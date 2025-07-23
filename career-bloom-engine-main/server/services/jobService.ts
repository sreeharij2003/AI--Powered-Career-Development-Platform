import Job, { IJob } from '../models/Job';

class JobService {
  /**
   * Get all jobs from the database (without automatic mock fallback)
   */
  async getAllJobs(): Promise<IJob[]> {
    try {
      const jobs = await Job.find({ is_active: true }).sort({ posted_date: -1 });
      console.log(`📊 Found ${jobs.length} jobs in database`);

      // Ensure each job has a proper id field for frontend
      return jobs.map(job => ({
        ...job.toObject(),
        id: job._id.toString()
      }));
    } catch (error) {
      console.error('❌ Error getting all jobs:', error);
      return [];
    }
  }

  /**
   * Get all jobs with mock fallback (for backward compatibility)
   */
  async getAllJobsWithFallback(): Promise<IJob[]> {
    try {
      const jobs = await Job.find({ is_active: true }).sort({ posted_date: -1 });

      // If no jobs found in the database, return mock jobs
      if (jobs.length === 0) {
        console.log('No jobs found in database, returning mock jobs');
        return this.getMockJobs();
      }

      return jobs;
    } catch (error) {
      console.error('Error getting all jobs:', error);
      // If there's an error, return mock jobs as fallback
      console.log('Error retrieving jobs from database, returning mock jobs');
      return this.getMockJobs();
    }
  }

  /**
   * Get mock jobs for development and testing
   */
  getMockJobs(): IJob[] {
    const mockJobs = [
      {
        _id: 'job-1',
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
        _id: 'job-2',
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
        _id: 'job-3',
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
        _id: 'job-4',
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
        _id: 'job-5',
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
      },
      {
        _id: 'job-6',
        title: 'Data Scientist',
        company: 'Analytics Pro',
        location: 'Boston, MA',
        description: 'Join our data science team to build machine learning models and extract insights from large datasets.',
        salary: '$115,000 - $145,000',
        url: 'https://example.com/jobs/6',
        skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Data Visualization'],
        posted_date: new Date(Date.now() - 432000000), // 5 days ago
        type: 'Full-time',
        remote: true,
        is_active: true
      },
      {
        _id: 'job-7',
        title: 'UX/UI Designer',
        company: 'Creative Agency',
        location: 'Los Angeles, CA',
        description: 'Design beautiful and intuitive user interfaces for web and mobile applications.',
        salary: '$85,000 - $110,000',
        url: 'https://example.com/jobs/7',
        skills: ['Figma', 'Adobe XD', 'UI Design', 'User Research', 'Prototyping'],
        posted_date: new Date(Date.now() - 518400000), // 6 days ago
        type: 'Full-time',
        remote: false,
        is_active: true
      },
      {
        _id: 'job-8',
        title: 'Product Manager',
        company: 'Tech Startup',
        location: 'Chicago, IL',
        description: 'Lead product development for our SaaS platform. Work with engineers and designers to build innovative solutions.',
        salary: '$110,000 - $140,000',
        url: 'https://example.com/jobs/8',
        skills: ['Product Strategy', 'Agile', 'User Stories', 'Roadmapping', 'Analytics'],
        posted_date: new Date(Date.now() - 604800000), // 7 days ago
        type: 'Full-time',
        remote: true,
        is_active: true
      }
    ];
    
    return mockJobs as IJob[];
  }

  /**
   * Get jobs for the chatbot
   */
  async getJobsForChatbot(): Promise<IJob[]> {
    try {
      // Limit to 500 most recent jobs for the chatbot to avoid overloading
      return await Job.find({ is_active: true })
        .sort({ posted_date: -1 })
        .limit(500);
    } catch (error) {
      console.error('Error getting jobs for chatbot:', error);
      throw error;
    }
  }

  /**
   * Get jobs with filters
   */
  async getJobs(filters: any = {}, page: number = 1, limit: number = 20): Promise<{ jobs: IJob[]; total: number; page: number; totalPages: number }> {
    try {
      const query: any = { is_active: true };
      
      // Apply filters
      if (filters.search) {
        query.$text = { $search: filters.search };
      }
      
      if (filters.location) {
        query.location = { $regex: filters.location, $options: 'i' };
      }
      
      if (filters.remote) {
        query.remote = true;
      }
      
      if (filters.type) {
        query.type = filters.type;
      }
      
      if (filters.experience_level) {
        query.experience_level = filters.experience_level;
      }
      
      if (filters.skills && filters.skills.length > 0) {
        query.skills = { $in: filters.skills };
      }
      
      // Calculate pagination
      const skip = (page - 1) * limit;
      
      // Get jobs with pagination
      const jobs = await Job.find(query)
        .sort({ posted_date: -1 })
        .skip(skip)
        .limit(limit);
      
      // Get total count
      const total = await Job.countDocuments(query);
      
      // Calculate total pages
      const totalPages = Math.ceil(total / limit);
      
      return {
        jobs,
        total,
        page,
        totalPages
      };
    } catch (error) {
      console.error('Error getting jobs with filters:', error);
      throw error;
    }
  }

  /**
   * Get job by ID
   */
  async getJobById(id: string): Promise<IJob | null> {
    try {
      return await Job.findById(id);
    } catch (error) {
      console.error(`Error getting job with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new job
   */
  async createJob(jobData: any): Promise<IJob> {
    try {
      const job = new Job(jobData);
      const savedJob = await job.save();

      // Ensure the returned job has a proper id field
      return {
        ...savedJob.toObject(),
        id: savedJob._id.toString()
      } as IJob;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  /**
   * Update a job
   */
  async updateJob(id: string, jobData: any): Promise<IJob | null> {
    try {
      return await Job.findByIdAndUpdate(id, jobData, { new: true });
    } catch (error) {
      console.error(`Error updating job with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a job
   */
  async deleteJob(id: string): Promise<boolean> {
    try {
      const result = await Job.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error(`Error deleting job with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Search jobs by text query
   */
  async searchJobs(query: string, filters: any = {}, page: number = 1, limit: number = 20): Promise<{ jobs: IJob[]; total: number; page: number; totalPages: number }> {
    try {
      const searchQuery: any = {
        is_active: true,
        $text: { $search: query }
      };
      
      // Apply additional filters
      if (filters.location) {
        searchQuery.location = { $regex: filters.location, $options: 'i' };
      }
      
      if (filters.remote) {
        searchQuery.remote = true;
      }
      
      if (filters.type) {
        searchQuery.type = filters.type;
      }
      
      if (filters.experience_level) {
        searchQuery.experience_level = filters.experience_level;
      }
      
      // Calculate pagination
      const skip = (page - 1) * limit;
      
      // Get jobs with pagination and text score sorting
      const jobs = await Job.find(searchQuery, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' }, posted_date: -1 })
        .skip(skip)
        .limit(limit);
      
      // Get total count
      const total = await Job.countDocuments(searchQuery);
      
      // Calculate total pages
      const totalPages = Math.ceil(total / limit);
      
      // Ensure each job has a proper id field for frontend
      const jobsWithId = jobs.map(job => ({
        ...job.toObject(),
        id: job._id.toString()
      }));

      return {
        jobs: jobsWithId,
        total,
        page,
        totalPages
      };
    } catch (error) {
      console.error(`Error searching jobs with query "${query}":`, error);
      throw error;
    }
  }

  /**
   * Create multiple jobs in the database
   */
  async createManyJobs(jobs: any[]): Promise<IJob[]> {
    try {
      const savedJobs = await Job.insertMany(jobs);
      console.log(`Successfully saved ${savedJobs.length} jobs to database`);
      return savedJobs;
    } catch (error) {
      console.error('Error creating multiple jobs:', error);
      throw error;
    }
  }
}

export default new JobService(); 