import { API_BASE_URL } from '../config/api';

export interface GeminiGenerateRequest {
  section: string;
  context: any;
}

export interface GeminiGenerateResponse {
  success: boolean;
  data?: {
    section: string;
    content: string;
  };
  error?: string;
}

export interface GeminiSummaryRequest {
  dreamJob: string;
  personalInfo?: any;
  skills?: any[];
  education?: any[];
}

export interface GeminiSummaryResponse {
  success: boolean;
  data?: {
    summary: string;
  };
  error?: string;
}

export interface GeminiExperienceRequest {
  dreamJob: string;
  company: string;
  position: string;
  responsibilities?: string;
  achievements?: string;
}

export interface GeminiExperienceResponse {
  success: boolean;
  data?: {
    description: string;
  };
  error?: string;
}

export interface GeminiProjectRequest {
  dreamJob: string;
  projectName: string;
  technologies?: string;
  description?: string;
  impact?: string;
}

export interface GeminiProjectResponse {
  success: boolean;
  data?: {
    description: string;
  };
  error?: string;
}

export interface GeminiSkillsRequest {
  dreamJob: string;
  currentSkills?: any[];
  experienceLevel?: string;
}

export interface GeminiSkillsResponse {
  success: boolean;
  data?: {
    skills: string[];
  };
  error?: string;
}

class GeminiService {
  private baseUrl = `${API_BASE_URL}/gemini`;

  async generateContent(request: GeminiGenerateRequest): Promise<GeminiGenerateResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating content:', error);
      return {
        success: false,
        error: 'Failed to generate content'
      };
    }
  }

  async generateSummary(request: GeminiSummaryRequest): Promise<GeminiSummaryResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating summary:', error);
      return {
        success: false,
        error: 'Failed to generate summary'
      };
    }
  }

  async generateExperience(request: GeminiExperienceRequest): Promise<GeminiExperienceResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-experience`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating experience:', error);
      return {
        success: false,
        error: 'Failed to generate experience description'
      };
    }
  }

  async generateProject(request: GeminiProjectRequest): Promise<GeminiProjectResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating project description:', error);
      return {
        success: false,
        error: 'Failed to generate project description'
      };
    }
  }

  async generateSkills(request: GeminiSkillsRequest): Promise<GeminiSkillsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating skills:', error);
      return {
        success: false,
        error: 'Failed to generate skills'
      };
    }
  }
}

export const geminiService = new GeminiService();
