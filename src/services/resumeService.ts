import { API } from './api';

export interface GenerateSummaryParams {
  experience: string;
  jobTitle: string;
  skills: string[];
}

export interface GenerateBulletPointsParams {
  role: string;
  responsibilities: string;
  jobType: string;
}

export interface ImproveTextParams {
  text: string;
  context: string;
}

export const ResumeService = {
  /**
   * Generate a professional resume summary
   */
  generateSummary: async (params: GenerateSummaryParams): Promise<string> => {
    try {
      const response = await API.resume.generateSummary(params);
      return response.summary;
    } catch (error) {
      console.error("Error generating summary:", error);
      throw new Error("Failed to generate summary");
    }
  },

  /**
   * Generate bullet points for experience/projects
   */
  generateBulletPoints: async (params: GenerateBulletPointsParams): Promise<string[]> => {
    try {
      const response = await API.resume.generateBulletPoints(params);
      return response.bulletPoints;
    } catch (error) {
      console.error("Error generating bullet points:", error);
      throw new Error("Failed to generate bullet points");
    }
  },

  /**
   * Improve existing text for clarity and impact
   */
  improveText: async (params: ImproveTextParams): Promise<string> => {
    try {
      const response = await API.resume.improveText(params);
      return response.improvedText;
    } catch (error) {
      console.error("Error improving text:", error);
      throw new Error("Failed to improve text");
    }
  }
}; 