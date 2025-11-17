import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  repliedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // Changed from 'user' to 'User' (capital U)
    required: false
  },
  repliedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const emailSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Provide name"]
    },
    email: {
        type: String,
        required: [true, "Provide email"]
    },
    subject: {
        type: String,
        default: ""
    },
    message: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ['unread', 'read', 'replied'],
        default: 'unread'
    },
    replies: [replySchema]
}, {
    timestamps: true
});

const EmailModel = mongoose.model("Email", emailSchema);

export default EmailModel;