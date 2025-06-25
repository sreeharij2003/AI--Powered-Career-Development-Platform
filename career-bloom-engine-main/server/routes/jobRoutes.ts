import express from 'express';
import { getFeaturedJobs, getJobs } from '../controllers/jobController';

const router = express.Router();

// Get all jobs (paginated)
router.get('/', getJobs);

// Get featured jobs
router.get('/featured', getFeaturedJobs);

export default router; 