import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  url?: string;
  source: string;
  posted_date: Date;
  type: string;
  experience_level?: string;
  remote?: boolean;
  skills?: string[];
  requirements?: string[];
}

export interface JobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  totalPages: number;
}

export interface JobFilters {
  type?: string;
  location?: string;
  remote?: boolean;
  experience_level?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ScrapeResponse {
  message: string;
  jobsFound: number;
  sources?: string[];
  source?: string;
}

class JobsApi {
  // Get latest jobs with pagination and filters
  async getLatestJobs(filters: JobFilters = {}): Promise<JobsResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/scraper/jobs`, { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching latest jobs:', error);
      throw error;
    }
  }

  // Get job details by ID
  async getJobById(id: string): Promise<Job> {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job details:', error);
      throw error;
    }
  }

  // Search jobs
  async searchJobs(query: string, filters: JobFilters = {}): Promise<JobsResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs/search`, {
        params: { query, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }
  }

  // Get job statistics
  async getJobStats() {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job statistics:', error);
      throw error;
    }
  }

  // Scrape jobs from LinkedIn based on user profile skills
  async scrapeLinkedInJobs(keyword: string, location: string, limit: number = 25): Promise<ScrapeResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/scraper/scrape/linkedin`, {
        keyword,
        location,
        limit
      });
      return response.data;
    } catch (error) {
      console.error('Error scraping LinkedIn jobs:', error);
      throw error;
    }
  }

  // Check if LinkedIn scraper dependencies are installed
  async checkScraperDependencies(): Promise<{ dependenciesInstalled: boolean; message: string }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/scraper/check-dependencies`);
      return response.data;
    } catch (error) {
      console.error('Error checking scraper dependencies:', error);
      throw error;
    }
  }
}

export default new JobsApi(); 