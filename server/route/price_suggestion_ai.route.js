import express from "express"
import {
  createPriceEntry,
  getAllPriceEntries,
  getLatestPrice,
  getPriceHistory,
  getAveragePrice,
  getPriceSuggestion,
  updatePriceEntry,
  deletePriceEntry,
  bulkImportPrices,
  getCommodities,
  getItemsByCommodity,
  syncProductsToPriceAI
} from "../controllers/price_suggestion_ai.controller.js"
import auth from "../middleware/auth.js"
import { admin } from "../middleware/Admin.js"

const router = express.Router()

// Public routes - available to all users
router.get("/price/latest", getLatestPrice)
router.get("/price/history", getPriceHistory)
router.get("/price/average", getAveragePrice)
router.get("/price/suggestion", getPriceSuggestion)
router.get("/commodities", getCommodities)
router.get("/items", getItemsByCommodity)

// Admin routes - require authentication and admin role
router.post("/price", auth, admin, createPriceEntry)
router.get("/price/all", auth, admin, getAllPriceEntries)
router.put("/price/:id", auth, admin, updatePriceEntry)
router.delete("/price/:id", auth, admin, deletePriceEntry)
router.post("/price/bulk-import", auth, admin, bulkImportPrices)
router.post("/sync-products", auth, admin, syncProductsToPriceAI)

export default router