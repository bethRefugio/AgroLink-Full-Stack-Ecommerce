import { exec } from 'child_process'
import { promisify } from 'util'
import SavedModelModel from '../models/savemodel.model.js'

const execAsync = promisify(exec)

export const trainModelsController = async (req, res) => {
  try {
    const { item, iterations = 10, testSize = 2 } = req.body // ✅ Changed default to 10

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
        const { stdout } = await execAsync(pythonCmd, { 
          timeout: 600000, // ✅ 10 minutes per iteration
          maxBuffer: 10 * 1024 * 1024
        })

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

        // Save to database and track best models
        for (const [modelType, metrics] of Object.entries(result.metrics)) {
          if (metrics.RMSE && result.modelPaths && result.modelPaths[modelType]) {
            const modelDoc = await SavedModelModel.create({
              modelType,
              item: item.toLowerCase(),
              accuracy: {
                mae: metrics.MAE,
                rmse: metrics.RMSE
              },
              modelPath: result.modelPaths[modelType],
              trainingDataPoints: result.dataPoints || 0,
              version: i,
              isActive: true
            })

            console.log(`💾 Saved ${modelType} model v${i} - RMSE: ${metrics.RMSE.toFixed(2)}`)

            // Track best model for each type
            if (!bestModels[modelType] || metrics.RMSE < bestModels[modelType].accuracy.rmse) {
              bestModels[modelType] = modelDoc
            }
          }
        }

        console.log(`✅ Iteration ${i} complete - Best: ${result.bestModel} (RMSE: ${result.metrics[result.bestModel].RMSE.toFixed(2)})`)

      } catch (error) {
        console.error(`❌ Iteration ${i} failed:`, error.message)
        results.push({ iteration: i, error: error.message })
      }
    }

    // Deactivate old models (keep only the best ones)
    const bestModelIds = [
      bestModels.Prophet?._id,
      bestModels.XGBoost?._id,
      bestModels.LSTM?._id
    ].filter(Boolean)

    if (bestModelIds.length > 0) {
      await SavedModelModel.updateMany(
        { 
          item: item.toLowerCase(),
          _id: { $nin: bestModelIds }
        },
        { isActive: false }
      )
      console.log(`🗑️ Deactivated old models, kept ${bestModelIds.length} best models`)
    }

    return res.json({
      success: true,
      message: `✅ Training complete: ${iterations} iterations`,
      results,
      bestModels: {
        Prophet: bestModels.Prophet ? {
          version: bestModels.Prophet.version,
          rmse: bestModels.Prophet.accuracy.rmse,
          mae: bestModels.Prophet.accuracy.mae
        } : null,
        XGBoost: bestModels.XGBoost ? {
          version: bestModels.XGBoost.version,
          rmse: bestModels.XGBoost.accuracy.rmse,
          mae: bestModels.XGBoost.accuracy.mae
        } : null,
        LSTM: bestModels.LSTM ? {
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
      message: error.message || 'Training failed'
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

    const bestModels = await SavedModelModel.getBestModelsForItem(item)

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