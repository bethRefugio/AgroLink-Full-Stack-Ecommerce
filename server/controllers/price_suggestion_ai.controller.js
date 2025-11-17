import PriceSuggestionModel from "../models/price_suggestion_ai.model.js"
import ProductModel from "../models/product.model.js"

/**
 * Create a new price entry
 */
export const createPriceEntry = async (req, res) => {
  try {
    const { year, month, commodity, item, unit, price, source, isPrediction, confidence } = req.body

    if (!year || !month || !commodity || !item || !unit || price === undefined) {
      return res.status(400).json({
        message: "Year, month, commodity, item, unit, and price are required",
        error: true,
        success: false
      })
    }

    const priceEntry = await PriceSuggestionModel.create({
      year,
      month: month.toLowerCase(),
      commodity: commodity.toLowerCase(),
      item: item.toLowerCase(),
      unit: unit.toLowerCase(),
      price,
      source: source || 'manual',
      isPrediction: isPrediction || false,
      confidence: confidence || null
    })

    return res.status(201).json({
      message: "Price entry created successfully",
      data: priceEntry,
      success: true,
      error: false
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

/**
 * Get all price entries with optional filters
 */
export const getAllPriceEntries = async (req, res) => {
  try {
    const { year, month, commodity, item, limit = 100, page = 1 } = req.query
    
    const filter = {}
    if (year) filter.year = parseInt(year)
    if (month) filter.month = month.toLowerCase()
    if (commodity) filter.commodity = commodity.toLowerCase()
    if (item) filter.item = item.toLowerCase()

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [data, total] = await Promise.all([
      PriceSuggestionModel.find(filter)
        .sort({ year: -1, month: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      PriceSuggestionModel.countDocuments(filter)
    ])

    return res.json({
      data,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      success: true,
      error: false
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

/**
 * Get latest price for a specific item
 */
export const getLatestPrice = async (req, res) => {
  try {
    const { commodity, item } = req.query

    if (!commodity || !item) {
      return res.status(400).json({
        message: "Commodity and item are required",
        error: true,
        success: false
      })
    }

    const latestPrice = await PriceSuggestionModel.getLatestPrice(commodity, item)

    if (!latestPrice) {
      return res.status(404).json({
        message: "No price data found for this item",
        error: true,
        success: false
      })
    }

    return res.json({
      data: latestPrice,
      isOutdated: latestPrice.isOutdated(),
      success: true,
      error: false
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

/**
 * Get price history for a specific item
 */
export const getPriceHistory = async (req, res) => {
  try {
    const { commodity, item, limit = 12 } = req.query

    if (!commodity || !item) {
      return res.status(400).json({
        message: "Commodity and item are required",
        error: true,
        success: false
      })
    }

    const history = await PriceSuggestionModel.getPriceHistory(
      commodity, 
      item, 
      parseInt(limit)
    )

    return res.json({
      data: history,
      count: history.length,
      success: true,
      error: false
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

/**
 * Get average price for a specific item
 */
export const getAveragePrice = async (req, res) => {
  try {
    const { commodity, item, year } = req.query

    if (!commodity || !item) {
      return res.status(400).json({
        message: "Commodity and item are required",
        error: true,
        success: false
      })
    }

    const avgData = await PriceSuggestionModel.getAveragePrice(
      commodity, 
      item, 
      year ? parseInt(year) : null
    )

    if (!avgData) {
      return res.status(404).json({
        message: "No price data found for this item",
        error: true,
        success: false
      })
    }

    return res.json({
      data: avgData,
      success: true,
      error: false
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

/**
 * Get price suggestions for farmer (based on commodity and item)
 */
export const getPriceSuggestion = async (req, res) => {
  try {
    const { commodity, item } = req.query

    if (!commodity || !item) {
      return res.status(400).json({
        message: "Commodity and item are required",
        error: true,
        success: false
      })
    }

    // Get latest price
    const latestPrice = await PriceSuggestionModel.getLatestPrice(commodity, item)
    
    // Get average price for current year
    const currentYear = new Date().getFullYear()
    const avgData = await PriceSuggestionModel.getAveragePrice(commodity, item, currentYear)
    
    // Get price history
    const history = await PriceSuggestionModel.getPriceHistory(commodity, item, 6)

    if (!latestPrice && !avgData) {
      return res.status(404).json({
        message: "No price data found for this item",
        error: true,
        success: false
      })
    }

    // Calculate suggested price range (±10% from average or latest)
    const basePrice = avgData ? avgData.avgPrice : latestPrice.price
    const suggestedMin = Math.round(basePrice * 0.9 * 100) / 100
    const suggestedMax = Math.round(basePrice * 1.1 * 100) / 100
    const suggestedPrice = Math.round(basePrice * 100) / 100

    return res.json({
      data: {
        suggestedPrice,
        suggestedMin,
        suggestedMax,
        latestPrice: latestPrice ? latestPrice.price : null,
        latestPriceDate: latestPrice ? `${latestPrice.month} ${latestPrice.year}` : null,
        averagePrice: avgData ? avgData.avgPrice : null,
        minPrice: avgData ? avgData.minPrice : null,
        maxPrice: avgData ? avgData.maxPrice : null,
        dataPoints: avgData ? avgData.count : 0,
        history: history.map(h => ({
          year: h.year,
          month: h.month,
          price: h.price
        })),
        isOutdated: latestPrice ? latestPrice.isOutdated() : false
      },
      success: true,
      error: false
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

/**
 * Update a price entry
 */
export const updatePriceEntry = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const priceEntry = await PriceSuggestionModel.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )

    if (!priceEntry) {
      return res.status(404).json({
        message: "Price entry not found",
        error: true,
        success: false
      })
    }

    return res.json({
      message: "Price entry updated successfully",
      data: priceEntry,
      success: true,
      error: false
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

/**
 * Delete a price entry
 */
export const deletePriceEntry = async (req, res) => {
  try {
    const { id } = req.params

    const priceEntry = await PriceSuggestionModel.findByIdAndDelete(id)

    if (!priceEntry) {
      return res.status(404).json({
        message: "Price entry not found",
        error: true,
        success: false
      })
    }

    return res.json({
      message: "Price entry deleted successfully",
      success: true,
      error: false
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

/**
 * Bulk import price data from CSV
 */
export const bulkImportPrices = async (req, res) => {
  try {
    const { data } = req.body // Array of price objects

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        message: "Data array is required",
        error: true,
        success: false
      })
    }

    // Validate and prepare data
    const priceEntries = data.map(entry => ({
      year: parseInt(entry.year),
      month: entry.month.toLowerCase(),
      commodity: entry.commodity.toLowerCase(),
      item: entry.item.toLowerCase(),
      unit: entry.unit.toLowerCase(),
      price: parseFloat(entry.price),
      source: entry.source || 'import'
    })).filter(entry => !isNaN(entry.price)) // Remove entries with invalid prices

    const result = await PriceSuggestionModel.insertMany(priceEntries, { 
      ordered: false // Continue on error
    })

    return res.json({
      message: `Successfully imported ${result.length} price entries`,
      data: result,
      success: true,
      error: false
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

/**
 * Get unique commodities list
 */
export const getCommodities = async (req, res) => {
  try {
    const commodities = await PriceSuggestionModel.distinct('commodity')
    
    return res.json({
      data: commodities,
      success: true,
      error: false
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

/**
 * Get items by commodity
 */
export const getItemsByCommodity = async (req, res) => {
  try {
    const { commodity } = req.query

    if (!commodity) {
      return res.status(400).json({
        message: "Commodity is required",
        error: true,
        success: false
      })
    }

    const items = await PriceSuggestionModel.distinct('item', {
      commodity: commodity.toLowerCase()
    })
    
    return res.json({
      data: items,
      success: true,
      error: false
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

/**
 * Sync products to price suggestion AI
 * Automatically adds product prices to the AI dataset
 */
// ...existing code...
export const syncProductsToPriceAI = async (req, res) => {
  try {
    const products = await ProductModel.find({ publish: true })
      .populate({
        path: "subCategory",
        select: "name",
        model: "subCategory"
      })
      .select("name unit price subCategory createdAt")
      .lean();

    if (!products || products.length === 0) {
      return res.json({
        message: "No products found to sync",
        success: true,
        error: false,
        synced: 0,
        skipped: 0
      });
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.toLocaleString("en-US", { month: "long" }).toLowerCase();

    // Cache for subcategory ObjectId -> name
    const subcatNameCache = new Map();
    let SubCategoryModel;
    const ensureSubcatName = async (subcat) => {
      if (!subcat) return "";
      // Already populated
      if (typeof subcat === "object" && subcat.name) return String(subcat.name).toLowerCase();
      // ObjectId path
      const id = String(subcat);
      if (subcatNameCache.has(id)) return subcatNameCache.get(id);
      if (!SubCategoryModel) {
        SubCategoryModel = (await import("../models/subCategory.model.js")).default;
      }
      const doc = await SubCategoryModel.findById(id).select("name").lean();
      const name = doc?.name ? String(doc.name).toLowerCase() : "";
      subcatNameCache.set(id, name);
      return name;
    };

    const ops = [];
    let skipped = 0;

    // avoid duplicates within the same batch
    const seenKeys = new Set();

    for (const product of products) {
      try {
        const name = product?.name?.trim();
        const unit = product?.unit?.trim();
        const rawPrice = product?.price;

        if (!name || !unit || rawPrice === undefined || rawPrice === null) {
          skipped++;
          continue;
        }

        const priceNum = Number(rawPrice);
        if (!Number.isFinite(priceNum) || priceNum < 0) {
          skipped++;
          continue;
        }

        // resolve first subcategory name
        let subCategoryName = "";
        if (Array.isArray(product.subCategory) && product.subCategory.length > 0) {
          subCategoryName = await ensureSubcatName(product.subCategory[0]);
        }
        if (!subCategoryName) {
          skipped++;
          continue;
        }

        const commodity = subCategoryName;
        const item = name.toLowerCase();
        const unitLc = unit.toLowerCase();

        const key = `${currentYear}|${currentMonth}|${commodity}|${item}`;
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);

        ops.push({
          updateOne: {
            filter: { year: currentYear, month: currentMonth, commodity, item },
            update: {
              $set: {
                unit: unitLc,
                price: priceNum,
                source: "product_sync",
                isPrediction: false,
                updatedAt: new Date()
              },
              $setOnInsert: {
                year: currentYear,
                month: currentMonth,
                commodity,
                item,
                createdAt: new Date()
              }
            },
            upsert: true
          }
        });
      } catch {
        skipped++;
      }
    }

    if (ops.length === 0) {
      return res.json({
        message: "Sync completed. 0 entries synced.",
        success: true,
        error: false,
        synced: 0,
        skipped,
        total: products.length
      });
    }

    const result = await PriceSuggestionModel.bulkWrite(ops, { ordered: false });

    const upserts = result.upsertedCount || 0;
    const modified = result.modifiedCount || 0;
    const matched = result.matchedCount || 0;

    // Optional verification: count current-month docs after write
    const verifiedCount = await PriceSuggestionModel.countDocuments({
      year: currentYear,
      month: currentMonth
    });

    return res.json({
      message: `Sync completed. ${upserts + modified} entries synced.`,
      success: true,
      error: false,
      synced: upserts + modified,
      details: { upserts, modified, matched },
      skipped,
      totalProducts: products.length,
      currentMonthDocs: verifiedCount
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};
// ...existing code...


/**
 * Auto-sync single product when created/updated
 * Called from product controller
 */
export const syncSingleProductToPriceAI = async (productData) => {
  try {
    if (!productData || !productData.name || !productData.price || !productData.unit) {
      return { success: false, message: 'Missing required fields' }
    }

    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' }).toLowerCase()

    // Get subcategory name
    let subCategoryName = ''
    if (productData.subCategory && productData.subCategory[0]) {
      const SubCategoryModel = (await import('../models/subCategory.model.js')).default
      const subCat = await SubCategoryModel.findById(productData.subCategory[0])
      subCategoryName = subCat?.name?.toLowerCase() || ''
    }

    if (!subCategoryName) {
      return { success: false, message: 'Subcategory not found' }
    }

    // Use subcategory name directly as commodity
    const commodity = subCategoryName
    const productName = productData.name.toLowerCase()
    const unit = productData.unit.toLowerCase()
    const price = parseFloat(productData.price)

    // Check for duplicate (removed price check)
    const existingEntry = await PriceSuggestionModel.findOne({
      year: currentYear,
      month: currentMonth,
      commodity: commodity,
      item: productName
    })

    if (existingEntry) {
      // Update price if different
      if (existingEntry.price !== price) {
        existingEntry.price = price
        await existingEntry.save()
        return { success: true, message: 'Price updated' }
      }
      return { success: true, message: 'Already synced', duplicate: true }
    }

    // Create new entry
    await PriceSuggestionModel.create({
      year: currentYear,
      month: currentMonth,
      commodity: commodity,
      item: productName,
      unit: unit,
      price: price,
      source: 'product_sync',
      isPrediction: false
    })

    return { success: true, message: 'Synced successfully' }
  } catch (error) {
    console.error('[syncSingleProductToPriceAI] Error:', error)
    return { success: false, message: error.message }
  }
}