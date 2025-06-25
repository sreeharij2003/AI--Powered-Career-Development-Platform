// API base URL - replace with your actual backend URL in production
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-api.com/api'
  : 'http://localhost:5000/api';

// Authentication token getter function interface
type TokenGetter = () => Promise<string | null>;
let tokenGetter: TokenGetter | null = null;

// Function to set the token getter from outside
export const setTokenGetter = (getter: TokenGetter) => {
  tokenGetter = getter;
};

// Helper function to get auth token
const getAuthToken = async () => {
  try {
    if (tokenGetter) {
      return await tokenGetter();
    }
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Helper to create authenticated fetch options
const createAuthHeaders = async () => {
  const token = await getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// API Service object
export const API = {
  career: {
    generateCareerPath: async (query: string) => {
      const headers = await createAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/career/path`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate career path');
      }
      
      return response.json();
    },
    getUserCareerPaths: async () => {
      const headers = await createAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/career/paths`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch career paths');
      }
      
      return response.json();
    },
    getCareerPathById: async (id: string) => {
      const headers = await createAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/career/path/${id}`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch career path details');
      }
      
      return response.json();
    },
    predictAndPlan: async (skills: string[], targetRole?: string) => {
      const headers = await createAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/career/predict-and-plan`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ skills, targetRole }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to predict career path');
      }
      
      return response.json();
    },
    assessInterests: async (answers: Record<string, any>) => {
      const headers = await createAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/career/assess-interests`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ answers }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to assess career interests');
      }
      
      return response.json();
    }
  },
  jobs: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/jobs`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      return response.json();
    },
    getFeatured: async () => {
      const response = await fetch(`${API_BASE_URL}/jobs/featured`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch featured jobs');
      }
      
      return response.json();
    },
    triggerScrape: async () => {
      const headers = await createAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/jobs/scrape`, {
        method: 'POST',
        headers,
      });
      
      if (!response.ok) {
        throw new Error('Failed to trigger job scrape');
      }
      
      return response.json();
    }
  },
  resume: {
    generateSummary: async (data: { experience: string, jobTitle: string, skills: string[] }) => {
      const headers = await createAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/resume/generate-summary`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate resume summary');
      }
      
      return response.json();
    },
    generateBulletPoints: async (data: { role: string, responsibilities: string, jobType: string }) => {
      const headers = await createAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/resume/generate-bullets`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate bullet points');
      }
      
      return response.json();
    },
    improveText: async (data: { text: string, context: string }) => {
      const headers = await createAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/resume/improve-text`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to improve text');
      }
      
      return response.json();
    },
    uploadResume: async (file: File) => {
      const token = await getAuthToken();
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await fetch(`${API_BASE_URL}/user/resume/upload`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload resume');
      }
      
      return response.json();
    },
    getResume: async () => {
      const headers = await createAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/user/resume`, {
        headers,
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // No resume found
        }
        throw new Error('Failed to get resume');
      }
      
      return response.json();
    },
    deleteResume: async () => {
      const headers = await createAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/user/resume`, {
        method: 'DELETE',
        headers,
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete resume');
      }
      
      return response.json();
    },
    parseResume: async (fileId: string) => {
      const headers = await createAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/user/resume/${fileId}/parse`, {
        method: 'POST',
        headers,
      });
      
      if (!response.ok) {
        throw new Error('Failed to parse resume');
      }
      
      return response.json();
    }
  }
};
