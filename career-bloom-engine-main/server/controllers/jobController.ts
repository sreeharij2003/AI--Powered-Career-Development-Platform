import { Request, Response } from 'express';
import jobRecommendationService from '../jobRecommendations/jobRecommendationService';
import jobService from '../services/jobService';

// Get paginated, latest jobs
export const getJobs = async (req: Request, res: Response) => {
  try {
    console.log('📋 Getting jobs with pagination...');
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    // First try to get jobs from database
    const allJobs = await jobService.getAllJobs();
    console.log(`📊 Found ${allJobs.length} total jobs in database`);

    // If no jobs in database, fetch from JSearch API
    if (allJobs.length === 0) {
      console.log('🔄 No jobs in database, fetching from JSearch API...');
      try {
        // Fetch multiple job types to populate database
        const jobQueries = ['software engineer', 'frontend developer', 'backend developer', 'data scientist', 'product manager'];
        let totalFetched = 0;

        for (const query of jobQueries) {
          try {
            console.log(`🔍 Fetching jobs for query: "${query}"`);
            const fetchedJobs = await jobRecommendationService.fetchAndStoreJSearchJobs(query, '', 5);
            totalFetched += fetchedJobs.length;
            console.log(`✅ Fetched ${fetchedJobs.length} jobs for "${query}"`);

            if (fetchedJobs.length > 0) {
              console.log(`📝 Sample job: ${fetchedJobs[0].title} at ${fetchedJobs[0].company}`);
            }

            // Add delay between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (queryError) {
            console.error(`❌ Failed to fetch jobs for "${query}":`, queryError);
          }
        }

        console.log(`🎉 Total fetched: ${totalFetched} jobs from JSearch API`);

        // Get updated job list
        const updatedJobs = await jobService.getAllJobs();
        const jobs = updatedJobs.slice((page - 1) * limit, page * limit);
        res.json({ jobs, total: updatedJobs.length, page, limit, source: 'jsearch_api' });
        return;
      } catch (fetchError) {
        console.log('⚠️ Failed to fetch from JSearch, using empty response');
      }
    }

    const jobs = allJobs.slice((page - 1) * limit, page * limit);
    console.log(`📤 Returning ${jobs.length} jobs for page ${page}`);
    res.json({ jobs, total: allJobs.length, page, limit, source: 'database' });
  } catch (error) {
    console.error('❌ Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

// Get featured jobs
export const getFeaturedJobs = async (req: Request, res: Response) => {
  try {
    // Return mock featured jobs
    const featuredJobs = [
      {
        id: "featured-1",
        title: "Senior Software Engineer",
        company: "Google",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/2048px-Google_%22G%22_Logo.svg.png",
        location: "Mountain View, CA",
        type: "Full-time",
        posted_date: new Date().toISOString(),
        description: "Join our team to work on cutting-edge technologies and help build the future of the web.",
        skills: ["JavaScript", "TypeScript", "React", "Node.js", "Cloud"],
        salary: "$150,000 - $200,000",
        source: "Company Website",
        remote: false
      },
      {
        id: "featured-2",
        title: "Product Manager",
        company: "Microsoft",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2048px-Microsoft_logo.svg.png",
        location: "Redmond, WA",
        type: "Full-time",
        posted_date: new Date(Date.now() - 86400000).toISOString(),
        description: "Lead product development for Microsoft Teams. Work with engineers and designers to build innovative solutions.",
        skills: ["Product Strategy", "Agile", "SaaS", "User Research"],
        salary: "$140,000 - $180,000",
        source: "LinkedIn",
        remote: false
      },
      {
        id: "featured-3",
        title: "Full Stack Developer",
        company: "Airbnb",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Airbnb_Logo_B%C3%A9lo.svg/1200px-Airbnb_Logo_B%C3%A9lo.svg.png",
        location: "Remote",
        type: "Full-time",
        posted_date: new Date(Date.now() - 172800000).toISOString(),
        description: "Build and maintain features across our entire stack. Work with React, Node.js, and our custom infrastructure.",
        skills: ["JavaScript", "React", "Node.js", "AWS", "MongoDB"],
        salary: "$120,000 - $160,000",
        source: "Indeed",
        remote: true
      },
      {
        id: "featured-4",
        title: "DevOps Engineer",
        company: "Netflix",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1920px-Netflix_2015_logo.svg.png",
        location: "Los Gatos, CA",
        type: "Full-time",
        posted_date: new Date(Date.now() - 259200000).toISOString(),
        description: "Build and maintain infrastructure for Netflix. Implement CI/CD pipelines and ensure system reliability.",
        skills: ["AWS", "Kubernetes", "Docker", "CI/CD", "Terraform"],
        salary: "$150,000 - $190,000",
        source: "Glassdoor",
        remote: false
      }
    ];
    
    res.json(featuredJobs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch featured jobs' });
  }
};

// Search jobs with query parameters
export const searchJobs = async (req: Request, res: Response) => {
  try {
    const { query, location = '', limit = 20 } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid query parameter' });
    }

    console.log(`🔍 Searching jobs with query: "${query}", location: "${location}"`);

    // First try to search existing jobs in database
    try {
      const existingJobs = await jobService.searchJobs(query, { location }, 1, parseInt(limit as string) || 20);
      if (existingJobs.jobs && existingJobs.jobs.length > 0) {
        console.log(`✅ Found ${existingJobs.jobs.length} existing jobs in database`);
        res.json({ jobs: existingJobs.jobs, total: existingJobs.total, source: 'database' });
        return;
      }
    } catch (dbError) {
      console.log('⚠️ Database search failed, trying API fetch');
    }

    // If no existing jobs found, fetch from JSearch API
    console.log('🔄 No existing jobs found, fetching from JSearch API...');
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
};

// Fetch jobs from JSearch, save to DB and vector store, and return them
export const fetchJSearchJobs = async (req: Request, res: Response) => {
  try {
    const { query, location = '', limit = 10 } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid query parameter' });
    }

    console.log(`🔍 Fetching jobs with query: "${query}", location: "${location}"`);
    const jobs = await jobRecommendationService.fetchAndStoreJSearchJobs(query, location, limit);
    console.log(`✅ Fetched ${jobs.length} jobs from JSearch API`);
    res.json({ jobs, total: jobs.length, source: 'jsearch_api' });
  } catch (error) {
    console.error('❌ Error fetching jobs from JSearch:', error);
    res.status(500).json({ error: 'Failed to fetch jobs from JSearch' });
  }
};