import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/job-recommendations';

export interface JobRecommendation {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  url?: string;
  skills?: string[];
  requirements?: string[];
  posted_date: Date;
  type: string;
  remote?: boolean;
  match_score: number;
}

export interface RecommendationsResponse {
  success: boolean;
  recommendations: JobRecommendation[];
}

class JobRecommendationApi {
  /**
   * Get job recommendations based on resume text
   */
  async getRecommendations(resumeText: string, limit: number = 5): Promise<JobRecommendation[]> {
    try {
      const response = await axios.post(`${API_BASE_URL}/recommendations`, {
        resumeText,
        limit
      });
      return response.data.recommendations || [];
    } catch (error) {
      console.error('Error getting job recommendations:', error);
      throw error;
    }
  }

  /**
   * Get job recommendations by uploading a resume file
   */
  async getRecommendationsFromFile(file: File, limit: number = 5): Promise<JobRecommendation[]> {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await axios.post(`${API_BASE_URL}/recommendations/resume?limit=${limit}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data.recommendations || [];
    } catch (error) {
      console.error('Error getting job recommendations from file:', error);
      throw error;
    }
  }

  /**
   * Add jobs to the recommendation system
   */
  async addJobs(jobs: any[]): Promise<boolean> {
    try {
      const response = await axios.post(`${API_BASE_URL}/add-jobs`, { jobs });
      return response.data.success || false;
    } catch (error) {
      console.error('Error adding jobs to recommendation system:', error);
      throw error;
    }
  }
}

export default new JobRecommendationApi(); 