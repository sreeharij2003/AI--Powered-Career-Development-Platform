import express from 'express';
import { fetchJSearchJobs, getFeaturedJobs, getJobs } from '../controllers/jobController';

const router = express.Router();

// Get all jobs (paginated)
router.get('/', getJobs);

// Get featured jobs
router.get('/featured', getFeaturedJobs);

// Search jobs
router.get('/search', async (req, res) => {
  try {
    const { query, location = '', limit = 20 } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid query parameter' });
    }

    console.log(`🔍 Searching jobs with query: "${query}", location: "${location}"`);

    // Import the service dynamically to avoid circular dependency
    const { default: jobRecommendationService } = await import('../jobRecommendations/jobRecommendationService');

    const jobs = await jobRecommendationService.fetchAndStoreJSearchJobs(
      query,
      location as string,
      parseInt(limit as string) || 20
    );

    console.log(`✅ Found ${jobs.length} jobs for search query from JSearch API`);
    res.json({ jobs, total: jobs.length, source: 'jsearch_api' });
  } catch (error) {
    console.error('❌ Error searching jobs:', error);
    res.status(500).json({ error: 'Failed to search jobs' });
  }
});

// Fetch jobs from JSearch, save to DB and vector store, and return them
router.post('/fetch-jsearch', fetchJSearchJobs);

// Test JSearch API directly
router.get('/test-api', async (req, res) => {
  try {
    console.log('🧪 Testing JSearch API directly...');

    const axios = require('axios');
    const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
      headers: {
        'X-RapidAPI-Key': '38f988da28msh1698b0a89a1a354p1d4711jsn2bc53cbaadc6',
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      },
      params: {
        query: 'software engineer',
        page: 1,
        num_pages: 1
      },
      timeout: 10000
    });

    console.log('✅ JSearch API test successful');
    console.log(`📊 Response data length: ${response.data?.data?.length || 0}`);

    res.json({
      success: true,
      message: 'JSearch API is working',
      jobCount: response.data?.data?.length || 0,
      sampleJob: response.data?.data?.[0] || null
    });
  } catch (error) {
    console.error('❌ JSearch API test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data || 'No additional details'
    });
  }
});

// Check database status
router.get('/db-status', async (req, res) => {
  try {
    console.log('🔍 Checking database status...');

    // Import job service
    const { default: jobService } = await import('../services/jobService');

    const jobs = await jobService.getAllJobs();
    console.log(`📊 Database contains ${jobs.length} jobs`);

    res.json({
      success: true,
      jobCount: jobs.length,
      message: `Database contains ${jobs.length} jobs`,
      sampleJob: jobs[0] || null
    });
  } catch (error) {
    console.error('❌ Database check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Database check failed'
    });
  }
});

// Initialize database with real job data
router.post('/initialize', async (req, res) => {
  try {
    console.log('🚀 Initializing database with real job data...');

    // Import the service dynamically to avoid circular dependency
    const { default: jobRecommendationService } = await import('../jobRecommendations/jobRecommendationService');

    const jobQueries = [
      'software engineer',
      'frontend developer',
      'backend developer',
      'full stack developer',
      'data scientist'
    ];

    let totalJobs = 0;
    const results = [];

    for (const query of jobQueries) {
      try {
        console.log(`📋 Fetching jobs for: ${query}`);
        const jobs = await jobRecommendationService.fetchAndStoreJSearchJobs(query, '', 5);
        totalJobs += jobs.length;
        results.push({ query, count: jobs.length });
        console.log(`✅ Added ${jobs.length} jobs for ${query}`);

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        console.error(`❌ Failed to fetch jobs for ${query}:`, error);
        results.push({ query, count: 0, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Successfully initialized database with ${totalJobs} real jobs`,
      totalJobs,
      results
    });
  } catch (error) {
    console.error('❌ Error in database initialization:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize database'
    });
  }
});

export default router;