import EmailModel from "../models/email.model.js"
import sendEmail from "../config/sendEmail.js"

/**
 * Create a contact message
 */
export const createContactMessage = async (req, res) => {
  try {
    const { name, email, subject = "", message = "" } = req.body || {}

    if (!name || !email || !message) {
      return res.status(400).json({
        message: "Name, email and message are required",
        error: true,
        success: false
      })
    }

    const doc = await EmailModel.create({
      name,
      email: String(email).toLowerCase(),
      subject,
      message,
      status: 'unread'
    })

    return res.json({
      message: "Message received. We'll get back to you soon.",
      data: doc,
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
 * List contact messages (admin)
 */
export const listContactMessages = async (req, res) => {
  try {
    const list = await EmailModel.find()
      .populate('replies.repliedBy', 'name email')
      .sort({ createdAt: -1 })
    return res.json({
      data: list,
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
 * Delete a contact message (admin)
 */
export const deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params
    const del = await EmailModel.findByIdAndDelete(id)
    if (!del) {
      return res.status(404).json({
        message: "Message not found",
        error: true,
        success: false
      })
    }
    return res.json({
      message: "Message deleted",
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
 * Mark message as read (admin)
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params
    const message = await EmailModel.findById(id)
    
    if (!message) {
      return res.status(404).json({
        message: "Message not found",
        error: true,
        success: false
      })
    }

    if (message.status === 'unread') {
      message.status = 'read'
      await message.save()
    }

    return res.json({
      message: "Message marked as read",
      success: true,
      error: false,
      data: message
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
 * Reply to a contact message (admin)
 */
export const replyToContact = async (req, res) => {
  try {
    const { messageId, subject, message } = req.body
    const userId = req.userId // from auth middleware

    if (!messageId || !subject || !message) {
      return res.status(400).json({
        message: "Message ID, subject and message are required",
        error: true,
        success: false
      })
    }

    const contactMessage = await EmailModel.findById(messageId)
    
    if (!contactMessage) {
      return res.status(404).json({
        message: "Message not found",
        error: true,
        success: false
      })
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">AgroLink</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              ${message.replace(/\n/g, '<br>')}
            </p>
            
            <div style="margin-top: 30px; padding: 20px; background: #f3f4f6; border-left: 4px solid #16a34a; border-radius: 5px;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0; text-transform: uppercase; font-weight: 600;">
                Original Message:
              </p>
              <p style="color: #4b5563; font-size: 14px; line-height: 1.5; margin: 0;">
                ${contactMessage.message.replace(/\n/g, '<br>')}
              </p>
            </div>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; background: #f9fafb; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            © ${new Date().getFullYear()} AgroLink. All rights reserved.
          </p>
        </div>
      </div>
    `

    await sendEmail({
      sendTo: contactMessage.email,
      subject: subject,
      html: emailHtml
    })

    // Save reply and update status
    contactMessage.replies.push({
      subject: subject,
      message: message,
      repliedBy: userId,
      repliedAt: new Date()
    })
    contactMessage.status = 'replied'
    await contactMessage.save()

    const populatedMessage = await EmailModel.findById(messageId)
      .populate('replies.repliedBy', 'name email')

    return res.json({
      message: "Reply sent successfully",
      success: true,
      error: false,
      data: populatedMessage
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}