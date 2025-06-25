import express from 'express';
import { getJobs } from '../controllers/jobController';
import scraperController from '../controllers/scraperController';

const router = express.Router();

// Route to trigger job scraping from all sources
router.post('/scrape', scraperController.scrapeJobs);

// Route to trigger LinkedIn job scraping specifically
router.post('/scrape/linkedin', scraperController.scrapeLinkedInJobs);

// Route to check if LinkedIn scraper dependencies are installed
router.get('/check-dependencies', scraperController.checkScraperDependencies);

// Route to get latest jobs
router.get('/jobs', getJobs);

export default router; 