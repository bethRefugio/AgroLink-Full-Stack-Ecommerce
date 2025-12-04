import { Router } from 'express'
import { trainModelsController, getBestModelsController } from '../controllers/model_training.controller.js'
import auth from '../middleware/auth.js'
import { admin } from '../middleware/Admin.js'

const modelTrainingRouter = Router()

// Train models for an item
modelTrainingRouter.post('/train', auth, admin, trainModelsController)

// Get best trained models for an item
modelTrainingRouter.get('/best-models', auth, getBestModelsController)

export default modelTrainingRouter