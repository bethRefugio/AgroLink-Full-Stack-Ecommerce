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
  timestamps: true,
  collection: 'saved_models' // ensure consistent collection name
})

// Compound index for faster lookups
savedModelSchema.index({ item: 1, modelType: 1, isActive: 1 })
savedModelSchema.index({ 'accuracy.rmse': 1 })

// Static helpers
savedModelSchema.statics.getBestModelsForItem = async function(item) {
  const types = ['Prophet', 'XGBoost', 'LSTM']
  const result = {}

  for (const t of types) {
    const doc = await this.findOne(
      { item: item.toLowerCase().trim(), modelType: t, isActive: true },
      {},
      { sort: { 'accuracy.rmse': 1 } }
    )
    result[t] = doc || null
  }

  return result
}

const SavedModelModel = mongoose.models.SavedModel || mongoose.model('SavedModel', savedModelSchema)
export default SavedModelModel