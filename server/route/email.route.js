import express from "express"
import { createContactMessage, listContactMessages, deleteContactMessage, replyToContact, markAsRead } from "../controllers/email.controller.js"
import auth from "../middleware/auth.js"
import { admin } from "../middleware/Admin.js"

const router = express.Router()

// Public: Contact Us creates a message
router.post("/contact", createContactMessage)

// Admin: view, delete and reply to messages
router.get("/contact", auth, admin, listContactMessages)
router.delete("/contact/:id", auth, admin, deleteContactMessage)
router.put("/contact/:id/read", auth, admin, markAsRead)
router.post("/contact/reply", auth, admin, replyToContact)

export default router