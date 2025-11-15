import ProductModel from "../models/product.model.js";
import mongoose from "mongoose"
import { execFile } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

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

        const product = await ProductModel.findOne({ _id : productId }).populate('userId');


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

export const suggestPriceController = async (req, res) => {
  try {
    const { item_name, csv_path: csvPathFromBody, test_size = 2 } = req.body || {};
    if (!item_name || typeof item_name !== "string") {
      return res.status(400).json({ success: false, message: "item_name is required" });
    }

    const python = PYTHON_EXEC;

    // Determine CSV path: prefer provided path (if exists), otherwise try likely locations
    const candidates = [];
    if (csvPathFromBody) candidates.push(path.resolve(csvPathFromBody));
    candidates.push(
      path.resolve(process.cwd(), "client/src/price_prediction_ai/price_list.csv"),
      path.resolve(__dirname, "../../client/src/price_prediction_ai/price_list.csv"),
      path.resolve(__dirname, "../client/src/price_prediction_ai/price_list.csv"),
      path.resolve(process.cwd(), "../client/src/price_prediction_ai/price_list.csv")
    );

    const csv_path = candidates.find((p) => fs.existsSync(p));
    if (!csv_path) {
      console.error("[suggestPriceController] csv not found. Tried:", candidates);
      return res.status(500).json({
        success: false,
        message: "Price engine CSV not found on server",
        error: "csv not found",
        tried: candidates,
      });
    }

    // Find script (keep existing resolution)
    const scriptCandidates = [
      path.resolve(process.cwd(), "client/src/price_prediction_ai/ai_price_suggestion.py"),
      path.resolve(__dirname, "../../client/src/price_prediction_ai/ai_price_suggestion.py"),
      path.resolve(__dirname, "../client/src/price_prediction_ai/ai_price_suggestion.py"),
      path.resolve(process.cwd(), "server/../client/src/price_prediction_ai/ai_price_suggestion.py"),
    ];
    const script = scriptCandidates.find((p) => fs.existsSync(p));
    if (!script) {
      console.error("[suggestPriceController] script not found. Tried:", scriptCandidates);
      return res.status(500).json({
        success: false,
        message: "Price engine script not found on server",
        error: "script not found",
        tried: scriptCandidates,
      });
    }

    console.log("[suggestPriceController] python:", python);
    console.log("[suggestPriceController] script:", script);
    console.log("[suggestPriceController] csv:", csv_path);

    const maxBuffer = 1024 * 1024 * 50;
    execFile(
      python,
      [script, "--item", item_name, "--csv", csv_path, "--test-size", String(test_size)],
      { maxBuffer },
      (err, stdout, stderr) => {
        if (stderr && stderr.toString().trim()) {
          console.error("[suggestPriceController] python stderr:", stderr.toString());
        }
        if (err) {
          console.error("[suggestPriceController] execFile error:", err);
          console.error("[suggestPriceController] stdout:", (stdout || "").toString().slice(0, 2000));
          console.error("[suggestPriceController] stderr:", (stderr || "").toString().slice(0, 2000));
          return res.status(500).json({ success: false, message: "Price suggestion failed", error: err.message || String(stderr) });
        }
        if (!stdout || !stdout.toString().trim()) {
          console.error("[suggestPriceController] python produced no stdout");
          return res.status(500).json({ success: false, message: "Price engine returned no output" });
        }
        try {
          const parsed = JSON.parse(stdout.toString());
          if (parsed.error) {
            return res.status(404).json({ success: false, message: parsed.error });
          }
          return res.json({
            success: true,
            suggestedPrice: parsed.suggestedPrice,
            bestModel: parsed.bestModel,
            data: parsed,
          });
        } catch (parseErr) {
          console.error("[suggestPriceController] JSON parse error:", parseErr, "stdout (truncated):", stdout.toString().slice(0, 2000));
          return res.status(500).json({ success: false, message: "Invalid response from price engine", error: parseErr.message });
        }
      }
    );
  } catch (error) {
    console.error("[suggestPriceController] unexpected error:", error);
    return res.status(500).json({ success: false, message: error.message || error });
  }
};