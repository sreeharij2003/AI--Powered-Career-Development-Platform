import express from 'express';
import { analyzeAssessmentResults, getSkillAssessments } from '../controllers/skillAssessmentController';

const router = express.Router();

// Get available skill assessments
router.get('/assessments', getSkillAssessments);

// Analyze assessment results with Gemini
router.post('/analyze', analyzeAssessmentResults);

export default router;
