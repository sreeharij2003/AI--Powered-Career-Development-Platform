import express from 'express';
import { predictAndPlan } from '../controllers/careerController';
import { generateCareerRoadmap } from '../controllers/careerRoadmapController';

const router = express.Router();

// Career path prediction endpoint
router.post('/predict-and-plan', predictAndPlan);

// Career path roadmap endpoint
router.post('/career-path/roadmap', generateCareerRoadmap);

export default router; 