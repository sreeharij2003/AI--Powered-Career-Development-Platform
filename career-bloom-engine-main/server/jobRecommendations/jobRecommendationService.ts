import jobService from '../services/jobService';
import JobVectorStore from './jobVectorStore';

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
}

// Create singleton instance
const jobRecommendationService = new JobRecommendationService();

export default jobRecommendationService; 