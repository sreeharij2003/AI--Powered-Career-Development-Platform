import express from 'express';
import {
    addJobsToVectorStore,
    clearJobRecommendationStore,
    getRecommendations,
    getRecommendationsFromResumeFile
} from '../controllers/jobRecommendationController';
import jobRecommendationService from '../jobRecommendations/jobRecommendationService';

const router = express.Router();

// Initialize the job recommendation service
router.post('/initialize', async (req, res) => {
  try {
    await jobRecommendationService.initialize();
    res.status(200).json({ success: true, message: 'Job recommendation service initialized successfully' });
  } catch (error) {
    console.error('Error initializing job recommendation service:', error);
    res.status(500).json({ success: false, message: 'Failed to initialize job recommendation service' });
  }
});

// Routes
router.post('/add-jobs', addJobsToVectorStore);
router.post('/recommendations', getRecommendations);
router.post('/recommendations/resume', getRecommendationsFromResumeFile);
router.delete('/clear', clearJobRecommendationStore);

export default router; 