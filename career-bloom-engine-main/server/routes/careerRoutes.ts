import express from 'express';
import { predictAndPlan } from '../controllers/careerController';

const router = express.Router();

// Career path prediction endpoint
router.post('/predict-and-plan', predictAndPlan);

export default router; 