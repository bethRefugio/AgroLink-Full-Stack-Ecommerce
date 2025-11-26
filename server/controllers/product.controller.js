import ProductModel from "../models/product.model.js";
import mongoose from "mongoose"
import { execFile } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { syncSingleProductToPriceAI } from "./price_suggestion_ai.controller.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PYTHON_EXEC = process.env.PYTHON_PATH ||
  "C:\\Users\\Acer\\AppData\\Local\\Programs\\Python\\Python312\\python.exe";

export const createProductController = async(request,response)=>{
    try {
        const { 
            name ,
            image ,
            category,
            subCategory,
            unit,
            stock,
            price,
            discount,
            description,
            more_details,
            userId,
        } = request.body 

        if(!name || !image[0] || !category[0] || !subCategory[0] || !unit || !price || !description || !userId ){
            return response.status(400).json({
                message : "Enter required fields",
                error : true,
                success : false
            })
        }

        const product = new ProductModel({
            name ,
            image ,
            category,
            subCategory,
            unit,
            stock,
            price,
            discount,
            description,
            more_details,
            userId
        })
        const saveProduct = await product.save()

        // Auto-sync to Price AI (non-blocking)
        syncSingleProductToPriceAI({
            name,
            subCategory,
            unit,
            price
        }).catch(err => console.error('[createProduct] Sync error:', err))

        return response.json({
            message : "Product Created Successfully",
            data : saveProduct,
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getProductController = async (request, response) => {
  try {
    let { page, limit, search, userId } = request.body;

    if (!page) page = 1;
    if (!limit) limit = 10;

    const query = {};

    // If search is provided, use regex for partial matching
    if (search) {
    query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
    ];
    }



    // If userId is provided, filter by that user
    if (userId) {
      query.userId = userId;
    }

    const skip = (page - 1) * limit;

    const [data, totalCount] = await Promise.all([
      ProductModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("category subCategory"),
      ProductModel.countDocuments(query),
    ]);

    return response.json({
      message: "Product data",
      error: false,
      success: true,
      totalCount: totalCount,
      totalNoPage: Math.ceil(totalCount / limit),
      data: data,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};


export const getProductByCategory = async(request,response)=>{
    try {
        const { id } = request.body 

        if(!id){
            return response.status(400).json({
                message : "provide category id",
                error : true,
                success : false
            })
        }

        const product = await ProductModel.find({ 
            category : { $in : id }
        }).limit(15)

        return response.json({
            message : "category product list",
            data : product,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getProductByCategoryAndSubCategory  = async(request,response)=>{
    try {
        let { categoryId, subCategoryId, page = 1, limit = 10 } = request.body || {}

        // normalize inputs to arrays and only keep valid ObjectIds
        const normalizeToIds = (val) => {
            if (!val) return []
            const arr = Array.isArray(val) ? val : String(val).split(",").map(s => s.trim())
            return arr.filter(v => mongoose.Types.ObjectId.isValid(v))
        }

        const categoryIds = normalizeToIds(categoryId)
        const subCategoryIds = normalizeToIds(subCategoryId)

        // if neither produced valid ids, return empty result instead of letting mongoose cast invalid values
        if (categoryIds.length === 0 && subCategoryIds.length === 0) {
            return response.json({
                message : "No valid category or subCategory ids provided",
                data : [],
                totalCount : 0,
                page,
                limit,
                success : true,
                error : false
            })
        }

        const query = {}
        if (categoryIds.length) query.category = { $in : categoryIds }
        if (subCategoryIds.length) query.subCategory = { $in : subCategoryIds }

        const skip = (page - 1) * limit

        const [data,dataCount] = await Promise.all([
            ProductModel.find(query).sort({createdAt : -1 }).skip(skip).limit(limit).populate('category subCategory'),
            ProductModel.countDocuments(query)
        ])

        return response.json({
            message : "Product list",
            data : data,
            totalCount : dataCount,
            page : page,
            limit : limit,
            success : true,
            error : false
        })

    } catch (error) {
        console.error("getProductByCategoryAndSubCategory error:", error)
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getProductDetails = async(request,response)=>{
    try {
        const { productId } = request.body 
        const product = await ProductModel
          .findOne({ _id : productId })
          .populate('userId category subCategory');

        return response.json({
            message : "product details",
            data : product,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//update product
export const updateProductDetails = async(request,response)=>{
    try {
        const { _id } = request.body 

        if(!_id){
            return response.status(400).json({
                message : "provide product _id",
                error : true,
                success : false
            })
        }

        const updateProduct = await ProductModel.updateOne({ _id : _id },{
            ...request.body
        })

        // If price was updated, sync to Price AI (non-blocking)
        if (request.body.price) {
            const updatedProductData = await ProductModel.findById(_id)
            if (updatedProductData) {
                syncSingleProductToPriceAI({
                    name: updatedProductData.name,
                    subCategory: updatedProductData.subCategory,
                    unit: updatedProductData.unit,
                    price: updatedProductData.price
                }).catch(err => console.error('[updateProduct] Sync error:', err))
            }
        }

        return response.json({
            message : "updated successfully",
            data : updateProduct,
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//delete product
export const deleteProductDetails = async(request,response)=>{
    try {
        const { _id } = request.body 

        if(!_id){
            return response.status(400).json({
                message : "provide _id ",
                error : true,
                success : false
            })
        }

        const deleteProduct = await ProductModel.deleteOne({_id : _id })

        return response.json({
            message : "Delete successfully",
            error : false,
            success : true,
            data : deleteProduct
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//search product
export const searchProduct = async(request,response)=>{
    try {
        let { search, page , limit } = request.body 

        if(!page){
            page = 1
        }
        if(!limit){
            limit  = 10
        }

        const query = search
            ? {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } }
                ]
                }
            : {};


        const skip = ( page - 1) * limit

        const [data,dataCount] = await Promise.all([
            ProductModel.find(query).sort({ createdAt  : -1 }).skip(skip).limit(limit).populate('category subCategory'),
            ProductModel.countDocuments(query)
        ])

        return response.json({
            message : "Product data",
            error : false,
            success : true,
            data : data,
            totalCount :dataCount,
            totalPage : Math.ceil(dataCount/limit),
            page : page,
            limit : limit 
        })


    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

// ...existing code...

export const suggestPriceController = async (req, res) => {
  try {
    const { item_name, test_size = 2 } = req.body || {};
    
    console.log("[suggestPriceController] ===== NEW REQUEST =====");
    console.log("[suggestPriceController] Item requested:", item_name);
    
    if (!item_name || typeof item_name !== "string") {
      return res.status(400).json({ success: false, message: "item_name is required" });
    }

    const python = PYTHON_EXEC;
    console.log("[suggestPriceController] Python executable:", python);

    // FIX: Go up one level from 'server' directory to reach 'client'
    const script = path.resolve(__dirname, "../../client/src/price_prediction_ai/ai_price_suggestion-new.py");
    
    console.log("[suggestPriceController] Script path:", script);
    console.log("[suggestPriceController] Script exists:", fs.existsSync(script));
    
    if (!fs.existsSync(script)) {
      console.error("[suggestPriceController] ❌ Script not found at:", script);
      return res.status(500).json({
        success: false,
        message: "Price engine script not found on server",
        error: "script not found",
        path: script
      });
    }

    // Get MongoDB URI from environment
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("[suggestPriceController] ❌ MONGODB_URI not found in environment");
      return res.status(500).json({
        success: false,
        message: "Database configuration error",
        error: "MONGODB_URI not configured"
      });
    }

    console.log("[suggestPriceController] ✅ MongoDB URI found");

    // Extract database name from connection string
    let dbName = 'test'; // Default for MongoDB Atlas when no DB is specified in URI
    
    try {
      const uriMatch = mongoUri.match(/mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/);
      if (uriMatch && uriMatch[1] && uriMatch[1].trim() !== '') {
        dbName = uriMatch[1];
      }
    } catch (parseErr) {
      console.log("[suggestPriceController] Using default database 'test'");
    }

    console.log("[suggestPriceController] ===== CONFIGURATION =====");
    console.log("[suggestPriceController] Database:", dbName);
    console.log("[suggestPriceController] Collection: pricesuggestions");
    console.log("[suggestPriceController] Item:", item_name);
    console.log("[suggestPriceController] Test size:", test_size);

    // Build command with MongoDB connection (NO CSV)
    const args = [
      script,
      "--item", item_name,
      "--mongo-uri", mongoUri,
      "--mongo-db", dbName,
      "--mongo-collection", "pricesuggestions",
      "--test-size", String(test_size)
    ];

    console.log("[suggestPriceController] ===== EXECUTING PYTHON =====");
    const maskedArgs = args.map((a, i) => 
      i > 0 && args[i-1] === '--mongo-uri' ? a.replace(/:[^:@]+@/, ':****@') : a
    );
    console.log("[suggestPriceController] Command:", `"${python}"`, maskedArgs.join(' '));

    const maxBuffer = 1024 * 1024 * 50; // 50MB
    const startTime = Date.now();
    
    execFile(
      python,
      args,
      { maxBuffer, timeout: 120000 }, // 2 minute timeout
      (err, stdout, stderr) => {
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`[suggestPriceController] Process completed in ${duration}s`);
        
        // Always log stderr (may contain warnings/info)
        if (stderr && stderr.toString().trim()) {
          console.log("[suggestPriceController] Python stderr:");
          console.log(stderr.toString());
        }
        
        // Handle errors
        if (err) {
          console.error("[suggestPriceController] ===== ERROR =====");
          console.error("[suggestPriceController] Error code:", err.code);
          console.error("[suggestPriceController] Error message:", err.message);
          
          if (stdout) {
            console.error("[suggestPriceController] stdout:");
            console.error(stdout.toString());
          }
          if (stderr) {
            console.error("[suggestPriceController] stderr:");
            console.error(stderr.toString());
          }
          
          const errorMsg = (stderr || stdout || err.message || '').toString();
          
          // Check for specific errors
          if (errorMsg.includes('ModuleNotFoundError') || errorMsg.includes('ImportError')) {
            const missingModule = errorMsg.match(/No module named '([^']+)'/);
            const moduleName = missingModule ? missingModule[1] : 'unknown';
            console.error("[suggestPriceController] Missing Python module:", moduleName);
            return res.status(500).json({ 
              success: false, 
              message: `Missing Python package: ${moduleName}. Please run: pip install ${moduleName}`,
              error: "Missing dependencies"
            });
          } else if (errorMsg.includes('No historical data') || errorMsg.includes('not found in')) {
            return res.status(404).json({ 
              success: false, 
              message: `No historical data found for "${item_name}". Please add price data to the database first.`,
              error: "No data"
            });
          } else if (errorMsg.includes('pymongo') || errorMsg.includes('PyMongo')) {
            return res.status(500).json({ 
              success: false, 
              message: "MongoDB Python driver not installed. Please run: pip install pymongo",
              error: "Missing pymongo"
            });
          } else if (err.code === 'ENOENT') {
            return res.status(500).json({ 
              success: false, 
              message: "Python executable not found. Please check PYTHON_PATH in .env",
              error: "Python not found"
            });
          }
          
          return res.status(500).json({ 
            success: false, 
            message: "Price suggestion failed. Please check server logs for details.",
            error: err.message || "Unknown error"
          });
        }
        
        // Check stdout
        if (!stdout || !stdout.toString().trim()) {
          console.error("[suggestPriceController] ❌ No output from Python");
          return res.status(500).json({ 
            success: false, 
            message: "Price engine returned no output."
          });
        }

        console.log("[suggestPriceController] Python output:");
        console.log(stdout.toString());

        // Parse JSON output
        try {
          const parsed = JSON.parse(stdout.toString());
          
          if (parsed.error) {
            console.error("[suggestPriceController] Python error:", parsed.error);
            return res.status(404).json({ 
              success: false, 
              message: parsed.error 
            });
          }

          console.log("[suggestPriceController] ===== SUCCESS =====");
          console.log("[suggestPriceController] Best model:", parsed.bestModel);
          console.log("[suggestPriceController] Suggested price:", parsed.suggestedPrice);

          return res.json({
            success: true,
            suggestedPrice: parsed.suggestedPrice,
            bestModel: parsed.bestModel,
            data: parsed,
          });
        } catch (parseErr) {
          console.error("[suggestPriceController] JSON parse error:", parseErr.message);
          console.error("[suggestPriceController] Raw output:", stdout.toString().slice(0, 500));
          return res.status(500).json({ 
            success: false, 
            message: "Failed to parse price suggestion output."
          });
        }
      }
    );
  } catch (error) {
    console.error("[suggestPriceController] Unexpected error:", error);
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// ...existing code...

export const getProductBySubCategory = async (request, response) => {
  try {
    const { id } = request.body
    if(!id){
      return response.status(400).json({ message:"provide subcategory id", error:true, success:false })
    }
    const products = await ProductModel.find({ subCategory : { $in : id } })
      .sort({ createdAt : -1 })
      .limit(20)
    return response.json({
      message : "subcategory product list",
      data : products,
      error : false,
      success : true
    })
  } catch (error) {
    return response.status(500).json({ message:error.message||error, error:true, success:false })
  }
}

export const getProductBySeller = async (request, response) => {
  try {
    const { sellerId, limit = 12, skip = 0 } = request.body
    if (!sellerId) {
      return response.status(400).json({
        message: "provide sellerId",
        error: true,
        success: false
      })
    }

    const products = await ProductModel.find({ userId: sellerId })
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .populate({
        path: 'userId',
        select: 'name address_details',
        populate: {
          path: 'address_details',
          model: 'address'
        }
      })

    return response.json({
      message: "seller product list",
      data: products,
      error: false,
      success: true
    })
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}