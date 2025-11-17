import { Router } from 'express';
import { translateTextController } from '../controllers/translate.controller.js';

const router = Router();

router.post('/translate', translateTextController);

export default router;