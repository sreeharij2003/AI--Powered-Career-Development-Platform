import axios from 'axios';
import jobService from '../services/jobService';
import { extractSkillsFromResumeText } from '../utils/resumeParser';
import JobVectorStore from './jobVectorStore';

const JSEARCH_API_KEY = '38f988da28msh1698b0a89a1a354p1d4711jsn2bc53cbaadc6';
const JSEARCH_API_URL = 'https://jsearch.p.rapidapi.com/search';

class JobRecommendationService {
  private vectorStore: JobVectorStore;
  private isInitialized: boolean = false;

  constructor() {
    // Initialize the vector store
    this.vectorStore = new JobVectorStore();
  }

  /**
   * Initialize the job recommendation service and load existing jobs into the vector store
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize vector store
      await this.vectorStore.initialize();

      // Load existing jobs from database
      try {
        console.log('Loading jobs from database for recommendations...');
        const jobs = await jobService.getAllJobs();
        
        console.log(`Retrieved ${jobs.length} jobs from database`);
        
        if (jobs.length > 0) {
          try {
            // Log a sample job to verify structure
            console.log('Sample job structure:');
            console.log(JSON.stringify(jobs[0], null, 2));
            
            await this.vectorStore.addDocuments(jobs);
            console.log(`Loaded ${jobs.length} jobs into job recommendation vector store`);
          } catch (error) {
            console.error('Error adding jobs to job recommendation vector store:', error);
          }
        } else {
          console.log('No jobs found in database, loading mock jobs');
          const mockJobs = this.getMockJobs();
          await this.vectorStore.addDocuments(mockJobs);
          console.log(`Loaded ${mockJobs.length} mock jobs into job recommendation vector store`);
        }
      } catch (jobError) {
        console.error('Error loading jobs for recommendations:', jobError);
        console.log('Loading mock jobs as fallback');
        const mockJobs = this.getMockJobs();
        await this.vectorStore.addDocuments(mockJobs);
        console.log(`Loaded ${mockJobs.length} mock jobs into job recommendation vector store`);
      }

      this.isInitialized = true;
      console.log('Job recommendation service initialized successfully');
    } catch (error) {
      console.error('Error initializing job recommendation service:', error);
      throw error;
    }
  }

  /**
   * Add a new job to the vector store
   */
  async addJob(job: any) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await this.vectorStore.addDocuments([job]);
      return true;
    } catch (error) {
      console.error('Error adding job to vector store:', error);
      return false;
    }
  }

  /**
   * Add multiple jobs to the vector store
   */
  async addJobs(jobs: any[]) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await this.vectorStore.addDocuments(jobs);
      return true;
    } catch (error) {
      console.error('Error adding jobs to vector store:', error);
      return false;
    }
  }

  /**
   * Get job recommendations based on resume text
   */
  async getRecommendedJobs(resumeText: string, limit: number = 5) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`Getting job recommendations for resume text (${resumeText.length} chars)`);
      const recommendations = await this.vectorStore.getRecommendedJobs(resumeText, limit);
      console.log(`Found ${recommendations.length} recommendations`);
      return recommendations;
    } catch (error) {
      console.error('Error getting job recommendations:', error);
      console.log('Returning mock recommendations as fallback');
      return this.getMockRecommendations(limit);
    }
  }

  /**
   * Clear the vector store
   */
  async clearVectorStore() {
    try {
      await this.vectorStore.clearVectorStore();
      this.isInitialized = false;
      return true;
    } catch (error) {
      console.error('Error clearing job recommendation vector store:', error);
      return false;
    }
  }
  
  /**
   * Get mock jobs for development and testing
   */
  getMockJobs(): any[] {
    return [
      {
        _id: 'mock-job-1',
        title: 'Senior Software Engineer',
        company: 'Tech Innovations Inc.',
        location: 'San Francisco, CA',
        description: 'We\'re looking for a senior software engineer to join our team. You\'ll be working on cutting-edge technologies to solve complex problems.',
        salary: '$120,000 - $150,000',
        url: 'https://example.com/jobs/1',
        skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS'],
        posted_date: new Date(),
        type: 'Full-time',
        remote: true,
        is_active: true
      },
      {
        _id: 'mock-job-2',
        title: 'Frontend Developer',
        company: 'Digital Solutions',
        location: 'New York, NY',
        description: 'Join our frontend team to build beautiful and responsive user interfaces using modern frameworks and tools.',
        salary: '$90,000 - $120,000',
        url: 'https://example.com/jobs/2',
        skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Redux'],
        posted_date: new Date(Date.now() - 86400000), // Yesterday
        type: 'Full-time',
        remote: true,
        is_active: true
      },
      {
        _id: 'mock-job-3',
        title: 'Backend Engineer',
        company: 'Data Systems Inc.',
        location: 'Austin, TX',
        description: 'Build robust and scalable backend services to power our growing platform. Experience with distributed systems is a plus.',
        salary: '$110,000 - $140,000',
        url: 'https://example.com/jobs/3',
        skills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Docker'],
        posted_date: new Date(Date.now() - 172800000), // 2 days ago
        type: 'Full-time',
        remote: false,
        is_active: true
      },
      {
        _id: 'mock-job-4',
        title: 'Full Stack Developer',
        company: 'WebTech Solutions',
        location: 'Remote',
        description: 'Looking for a versatile developer who can work across the entire stack. You\'ll be involved in all aspects of product development.',
        salary: '$100,000 - $130,000',
        url: 'https://example.com/jobs/4',
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'MongoDB'],
        posted_date: new Date(Date.now() - 259200000), // 3 days ago
        type: 'Contract',
        remote: true,
        is_active: true
      },
      {
        _id: 'mock-job-5',
        title: 'DevOps Engineer',
        company: 'Cloud Systems',
        location: 'Seattle, WA',
        description: 'Join our infrastructure team to build and maintain our cloud-based systems. Experience with AWS and automation is required.',
        salary: '$130,000 - $160,000',
        url: 'https://example.com/jobs/5',
        skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD'],
        posted_date: new Date(Date.now() - 345600000), // 4 days ago
        type: 'Full-time',
        remote: false,
        is_active: true
      }
    ];
  }
  
  /**
   * Get mock recommendations for fallback
   */
  getMockRecommendations(limit: number = 5): any[] {
    const mockJobs = this.getMockJobs();
    return mockJobs.slice(0, limit).map(job => {
      const score = Math.random() * 0.5 + 0.5; // Random score between 0.5 and 1.0
      const match = Math.floor(Math.random() * 30) + 70; // Random match between 70 and 100
      
      return {
        ...job,
        _id: job._id || `mock-job-${Math.random().toString(36).substring(2, 9)}`,
        id: job.id || job._id || `mock-job-${Math.random().toString(36).substring(2, 9)}`,
        title: job.title || 'Senior Software Engineer',
        company: job.company || 'Tech Company Inc.',
        location: job.location || 'San Francisco, CA',
        description: job.description || 'This is a job description for a senior software engineering role.',
        salary: job.salary || '$120,000 - $150,000',
        url: job.url || '#',
        skills: job.skills || ['JavaScript', 'React', 'Node.js'],
        posted_date: job.posted_date || new Date(),
        type: job.type || 'Full-time',
        remote: job.remote !== undefined ? job.remote : true,
        score,
        match
      };
    });
  }

  /**
   * Fetch jobs from JSearch API, store them in the database, and return the jobs
   */
  async fetchAndStoreJSearchJobs(query: string, location: string = '', limit: number = 10) {
    try {
      console.log(`[JSearch] Starting API call with query: "${query}", location: "${location}", limit: ${limit}`);
      console.log(`[JSearch] API Key: ${JSEARCH_API_KEY.substring(0, 10)}...`);
      console.log(`[JSearch] API URL: ${JSEARCH_API_URL}`);

      const response = await axios.get(JSEARCH_API_URL, {
        params: {
          query: `${query} ${location}`.trim(),
          page: 1,
          num_pages: 1
        },
        headers: {
          'X-RapidAPI-Key': JSEARCH_API_KEY,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
        }
      });

      console.log(`[JSearch] API Response Status: ${response.status}`);
      console.log(`[JSearch] API Response Data Keys:`, Object.keys(response.data || {}));
      console.log(`[JSearch] API Response Data:`, JSON.stringify(response.data, null, 2));
      const jobs = response.data.data || [];
      console.log(`[JSearch] Found ${jobs.length} jobs from API`);
      const savedJobs = [];
      for (const job of jobs.slice(0, limit)) {
        console.log(`[JSearch] Processing job: ${job.job_title} at ${job.employer_name}`);
        // Map JSearch job fields to our DB schema
        const description = job.job_description || (job.job_highlights ? job.job_highlights.join('\n') : '');

        // Extract skills from job description using our skill extraction function
        const extractedSkills = extractSkillsFromResumeText(description);
        const providedSkills = job.job_required_skills ? job.job_required_skills.split(',').map((s: string) => s.trim()) : [];
        const allSkills = [...new Set([...extractedSkills, ...providedSkills])]; // Combine and deduplicate

        const jobData = {
          title: job.job_title || job.title || '',
          company: job.employer_name || job.company_name || '',
          location: job.job_city ? `${job.job_city}, ${job.job_state || job.job_country || ''}` : (job.job_country || ''),
          description: description,
          salary: job.job_min_salary && job.job_max_salary ? `$${job.job_min_salary}-$${job.job_max_salary} ${job.job_salary_currency || 'USD'}` : '',
          remote: job.job_is_remote || false,
          type: job.job_employment_type || 'Full-time',
          experience_level: job.job_experience_level || this.inferExperienceLevel(description),
          skills: allSkills,
          requirements: job.job_required_qualifications ? job.job_required_qualifications.split(',').map((r: string) => r.trim()) : [],
          posted_date: job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc) : new Date(),
          is_active: true,
          source: 'jsearch',
          url: job.job_apply_link || job.job_google_link || job.job_url || job.url || ''
        };
        console.log(`[JSearch] Mapped job data:`, {
          title: jobData.title,
          company: jobData.company,
          location: jobData.location,
          url: jobData.url,
          posted_date: jobData.posted_date
        });
        // Check for existing job using multiple criteria for better deduplication
        console.log(`[JSearch] Checking for existing job: ${jobData.title} at ${jobData.company}`);
        try {
          // Check for duplicates using URL, or title+company combination
          const existingJob = await this.findExistingJob(jobData);

          if (!existingJob) {
            console.log(`[JSearch] Creating new job: ${jobData.title}`);
            const saved = await jobService.createJob(jobData);
            savedJobs.push(saved);
            console.log(`[JSearch] Successfully saved job: ${saved.title} with ID: ${saved._id}`);
          } else {
            console.log(`[JSearch] Job already exists, using existing: ${existingJob.title}`);
            savedJobs.push(existingJob);
          }
        } catch (error: any) {
          console.error(`[JSearch] Error processing job: ${error?.message || error}`);
          // If processing fails, continue with next job
        }
      }
      // Add all saved jobs to the vector store for recommendations
      await this.addJobs(savedJobs);
      console.log(`[VectorStore] Added ${savedJobs.length} jobs to the vector store. Titles:`, savedJobs.map(j => j.title).join(', '));
      return savedJobs;
    } catch (error: any) {
      console.error('[JSearch] Error fetching or saving jobs from JSearch API:');
      console.error('[JSearch] Error details:', error?.message || error);
      if (error?.response) {
        console.error('[JSearch] Response status:', error.response.status);
        console.error('[JSearch] Response data:', error.response.data);
      }
      console.log('[JSearch] Falling back to empty array');
      return [];
    }
  }

  /**
   * Find existing job to avoid duplicates
   */
  private async findExistingJob(jobData: any): Promise<any | null> {
    try {
      // First try to find by URL (most reliable)
      if (jobData.url) {
        const existingByUrl = await jobService.getJobs({ url: jobData.url }, 1, 1);
        if (existingByUrl.jobs && existingByUrl.jobs.length > 0) {
          return existingByUrl.jobs[0];
        }
      }

      // Then try to find by title + company combination
      const existingByTitleCompany = await jobService.getJobs({
        title: jobData.title,
        company: jobData.company
      }, 1, 1);

      if (existingByTitleCompany.jobs && existingByTitleCompany.jobs.length > 0) {
        // Check if it's a recent posting (within last 30 days) to avoid very old duplicates
        const existingJob = existingByTitleCompany.jobs[0];
        const daysDiff = Math.abs(new Date().getTime() - new Date(existingJob.posted_date).getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff <= 30) {
          return existingJob;
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding existing job:', error);
      return null;
    }
  }

  /**
   * Infer experience level from job description
   */
  private inferExperienceLevel(description: string): string {
    const descLower = description.toLowerCase();

    // Look for explicit experience requirements
    if (descLower.includes('senior') || descLower.includes('lead') || descLower.includes('principal') ||
        descLower.includes('architect') || descLower.includes('staff')) {
      return 'Senior';
    }

    if (descLower.includes('junior') || descLower.includes('entry') || descLower.includes('graduate') ||
        descLower.includes('intern') || descLower.includes('trainee')) {
      return 'Entry-level';
    }

    // Look for years of experience
    const experienceMatch = descLower.match(/(\d+)\+?\s*years?\s*(?:of\s*)?experience/);
    if (experienceMatch) {
      const years = parseInt(experienceMatch[1]);
      if (years >= 5) return 'Senior';
      if (years >= 2) return 'Mid-level';
      return 'Entry-level';
    }

    return 'Mid-level'; // Default
  }
}

// Create singleton instance
const jobRecommendationService = new JobRecommendationService();

export default jobRecommendationService; 