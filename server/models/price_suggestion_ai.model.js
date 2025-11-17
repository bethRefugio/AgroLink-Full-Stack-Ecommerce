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
    ref: 'User',
    required: false
  },
  repliedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const priceSuggestionSchema = new mongoose.Schema({
    year: {
        type: Number,
        required: [true, "Provide year"],
        min: 2020,
        max: 2100
    },
    month: {
        type: String,
        required: [true, "Provide month"],
        lowercase: true,
        enum: [
            'january', 'february', 'march', 'april', 
            'may', 'june', 'july', 'august', 
            'september', 'october', 'november', 'december'
        ]
    },
    commodity: {
        type: String,
        required: [true, "Provide commodity"],
        lowercase: true,
        trim: true
        // REMOVED enum - now accepts any commodity name
    },
    item: {
        type: String,
        required: [true, "Provide item"],
        lowercase: true,
        trim: true
    },
    unit: {
        type: String,
        required: [true, "Provide unit"],
        lowercase: true,
        trim: true
        // REMOVED enum - now accepts any unit
    },
    price: {
        type: Number,
        required: [true, "Provide price"],
        min: 0
    },
    source: {
        type: String,
        default: 'manual',
        enum: ['manual', 'import', 'api', 'prediction', 'product_sync']
    },
    isPrediction: {
        type: Boolean,
        default: false
    },
    confidence: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    }
}, {
    timestamps: true
});

// Compound index for faster queries
priceSuggestionSchema.index({ year: 1, month: 1, commodity: 1, item: 1 });
priceSuggestionSchema.index({ commodity: 1, item: 1 });
priceSuggestionSchema.index({ year: -1, month: -1 });

// ...existing static methods and methods...

const PriceSuggestionModel = mongoose.model("PriceSuggestion", priceSuggestionSchema);

export default PriceSuggestionModel;