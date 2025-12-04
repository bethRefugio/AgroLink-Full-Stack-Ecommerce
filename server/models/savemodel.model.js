import mongoose from 'mongoose'

const savedModelSchema = new mongoose.Schema({
  modelType: {
    type: String,
    enum: ['Prophet', 'XGBoost', 'LSTM'],
    required: true
  },
  item: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  commodity: {
    type: String,
    lowercase: true,
    trim: true
  },
  accuracy: {
    mae: { type: Number, required: true },
    rmse: { type: Number, required: true },
    r2_score: { type: Number },
    mape: { type: Number }
  },
  modelPath: {
    type: String,
    required: true
  },
  trainingDataPoints: {
    type: Number,
    required: true
  },
  hyperparameters: {
    type: mongoose.Schema.Types.Mixed
  },
  trainingDate: {
    type: Date,
    default: Date.now
  },
  version: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Compound index for faster lookups
savedModelSchema.index({ item: 1, modelType: 1, isActive: 1 })
savedModelSchema.index({ rmse: 1 }) // For finding best models

// Static method to get best model for an item
savedModelSchema.statics.getBestModel = async function(item, modelType) {
  return this.findOne({
    item: item.toLowerCase(),
    modelType,
    isActive: true
  }).sort({ rmse: 1 }).limit(1)
}

// Static method to get all active models for an item
savedModelSchema.statics.getBestModelsForItem = async function(item) {
  const models = {}
  for (const type of ['Prophet', 'XGBoost', 'LSTM']) {
    models[type] = await this.getBestModel(item, type)
  }
  return models
}

const SavedModelModel = mongoose.model('saved_model', savedModelSchema)

export default SavedModelModel