import { exec } from 'child_process'
import { promisify } from 'util'
import SavedModelModel from '../models/savemodel.model.js'

const execAsync = promisify(exec)

export const trainModelsController = async (req, res) => {
  try {
    const { item, iterations = 10, testSize = 2 } = req.body

    if (!item) {
      return res.status(400).json({
        success: false,
        message: 'Item name is required'
      })
    }

    console.log(`🎯 Starting training for "${item}" with ${iterations} iterations...`)

    const results = []
    const bestModels = {
      Prophet: null,
      XGBoost: null,
      LSTM: null
    }

    for (let i = 1; i <= iterations; i++) {
      console.log(`\n📊 Training iteration ${i}/${iterations} for "${item}"...`)

      const pythonCmd = `python price_prediction_ai/ai_price_suggestion_new.py --item "${item}" --mongo-uri "${process.env.MONGODB_URI}" --mongo-db "${process.env.MONGO_DB || 'test'}" --mongo-collection "${process.env.MONGO_COLLECTION || 'pricesuggestions'}" --test-size ${testSize} --save-models --version ${i}`

      try {
        const { stdout, stderr } = await execAsync(pythonCmd, { 
          timeout: 600000,
          maxBuffer: 10 * 1024 * 1024
        })

        // Log Python stderr for debugging
        if (stderr) {
          console.log('Python stderr:', stderr)
        }

        const result = JSON.parse(stdout.trim())
        
        if (result.error) {
          console.error(`❌ Iteration ${i} error:`, result.error)
          results.push({ iteration: i, error: result.error })
          continue
        }

        results.push({
          iteration: i,
          metrics: result.metrics,
          bestModel: result.bestModel,
          modelPaths: result.modelPaths
        })

        console.log(`📝 Saving models to database for iteration ${i}...`)

        // Save each model to database
        for (const [modelType, metrics] of Object.entries(result.metrics || {})) {
          try {
            if (metrics.RMSE != null && result.modelPaths?.[modelType]) {
              const modelDoc = await SavedModelModel.create({
                modelType,
                item: item.toLowerCase().trim(),
                accuracy: {
                  mae: metrics.MAE ?? 0,
                  rmse: metrics.RMSE ?? 0
                },
                modelPath: result.modelPaths[modelType],
                trainingDataPoints: result.dataPoints ?? 0,
                version: i,
                isActive: true
              })

              console.log(`💾 Saved ${modelType} model v${i} - RMSE: ${metrics.RMSE.toFixed(2)} - ID: ${modelDoc._id}`)

              // Track best model for each type
              if (!bestModels[modelType] || metrics.RMSE < bestModels[modelType].accuracy.rmse) {
                bestModels[modelType] = modelDoc
              }
            } else {
              console.warn(`Skip save: missing metrics/modelPath for ${modelType}`, { metrics, modelPaths: result.modelPaths })
            }
          } catch (dbError) {
            console.error(`❌ Failed to save ${modelType} model:`, dbError)
          }
        }

        console.log(`✅ Iteration ${i} complete - Best: ${result.bestModel}`)

      } catch (error) {
        console.error(`❌ Iteration ${i} failed:`, error.message)
        results.push({ iteration: i, error: error.message })
      }
    }

    // Deactivate old models
    try {
      const bestModelIds = [
        bestModels.Prophet?._id,
        bestModels.XGBoost?._id,
        bestModels.LSTM?._id
      ].filter(Boolean)

      if (bestModelIds.length > 0) {
        await SavedModelModel.updateMany(
          { 
            item: item.toLowerCase().trim(),
            _id: { $nin: bestModelIds }
          },
          { isActive: false }
        )
        console.log(`🗑️ Deactivated old models, kept ${bestModelIds.length} best models`)
      }
    } catch (deactivateError) {
      console.error('Error deactivating old models:', deactivateError.message)
    }

    const successCount = Object.values(bestModels).filter(m => m).length

    return res.json({
      success: true,
      message: `✅ Training complete: ${iterations} iterations, ${successCount} models saved`,
      results,
      bestModels: {
        Prophet: bestModels.Prophet ? {
          _id: bestModels.Prophet._id,
          version: bestModels.Prophet.version,
          rmse: bestModels.Prophet.accuracy.rmse,
          mae: bestModels.Prophet.accuracy.mae
        } : null,
        XGBoost: bestModels.XGBoost ? {
          _id: bestModels.XGBoost._id,
          version: bestModels.XGBoost.version,
          rmse: bestModels.XGBoost.accuracy.rmse,
          mae: bestModels.XGBoost.accuracy.mae
        } : null,
        LSTM: bestModels.LSTM ? {
          _id: bestModels.LSTM._id,
          version: bestModels.LSTM.version,
          rmse: bestModels.LSTM.accuracy.rmse,
          mae: bestModels.LSTM.accuracy.mae
        } : null
      }
    })

  } catch (error) {
    console.error('Training controller error:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Training failed',
      error: error.toString()
    })
  }
}

export const getBestModelsController = async (req, res) => {
  try {
    const { item } = req.query

    if (!item) {
      return res.status(400).json({
        success: false,
        message: 'Item name is required'
      })
    }

    const bestModels = await SavedModelModel.getBestModelsForItem(item.toLowerCase().trim())

    return res.json({
      success: true,
      data: bestModels
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export const saveTrainedModelController = async (req, res) => {
  try {
    const {
      modelType,            // 'Prophet' | 'XGBoost' | 'LSTM'
      item,                 // e.g. 'mango'
      modelPath,            // filesystem path to saved file
      metrics = {},         // { MAE, RMSE, r2_score?, mape? }
      trainingDataPoints = 0,
      hyperparameters = {}, // optional params used in training
      version = 1,
      commodity = undefined // optional category
    } = req.body

    if (!modelType || !item || !modelPath) {
      return res.status(400).json({
        success: false,
        message: 'modelType, item, and modelPath are required'
      })
    }

    if (!['Prophet', 'XGBoost', 'LSTM'].includes(modelType)) {
      return res.status(400).json({ success: false, message: 'Invalid modelType' })
    }

    const doc = await SavedModelModel.create({
      modelType,
      item: String(item).toLowerCase().trim(),
      commodity: commodity ? String(commodity).toLowerCase().trim() : undefined,
      accuracy: {
        mae: Number(metrics.MAE ?? metrics.mae ?? 0),
        rmse: Number(metrics.RMSE ?? metrics.rmse ?? 0),
        r2_score: metrics.r2_score ?? undefined,
        mape: metrics.mape ?? undefined
      },
      modelPath,
      trainingDataPoints: Number(trainingDataPoints) || 0,
      hyperparameters,
      version: Number(version) || 1,
      isActive: true
    })

    // Deactivate older versions of the same type for this item (keep latest active)
    await SavedModelModel.updateMany(
      { item: doc.item, modelType, _id: { $ne: doc._id } },
      { isActive: false }
    )

    return res.json({
      success: true,
      message: 'Model saved successfully',
      data: {
        _id: doc._id,
        modelType: doc.modelType,
        item: doc.item,
        version: doc.version,
        accuracy: doc.accuracy
      }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}