/**
 * A simple in-memory job vector store implementation
 * This is a placeholder implementation that doesn't use actual vector embeddings
 * In a production environment, you would use a proper vector database or embedding service
 */
class JobVectorStore {
  private jobs: any[] = [];
  
  constructor() {
    // Initialize empty jobs array
  }
  
  /**
   * Initialize the vector store
   */
  async initialize(): Promise<void> {
    try {
      // Clear jobs array
      this.jobs = [];
      console.log('Vector store initialized successfully');
    } catch (error) {
      console.error('Error initializing vector store:', error);
      throw error;
    }
  }
  
  /**
   * Add job documents to the vector store
   */
  async addDocuments(jobs: any[]): Promise<void> {
    try {
      // Add jobs to the store
      this.jobs = [...this.jobs, ...jobs];
    } catch (error) {
      console.error('Error adding documents to vector store:', error);
      throw error;
    }
  }
  
  /**
   * Get job recommendations based on resume text
   * This is a simple keyword matching implementation
   */
  async getRecommendedJobs(resumeText: string, limit: number = 5): Promise<any[]> {
    try {
      if (this.jobs.length === 0) {
        return [];
      }
      
      // Extract keywords from resume text (simple implementation)
      const resumeKeywords = extractKeywords(resumeText);
      
      // Score jobs based on keyword matches
      const scoredJobs = this.jobs.map(job => {
        const jobText = createJobText(job);
        const jobKeywords = extractKeywords(jobText);
        
        // Calculate score based on keyword overlap
        const matchingKeywords = resumeKeywords.filter(keyword => 
          jobKeywords.includes(keyword)
        );
        
        const score = matchingKeywords.length / Math.max(resumeKeywords.length, 1);
        
        // Ensure we preserve all original job fields and add the score
        return {
          ...job, // Preserve all original job fields
          _id: job._id || job.id, // Ensure _id is available
          id: job.id || job._id, // Ensure id is available
          title: job.title || 'Job Title',
          company: job.company || 'Company',
          location: job.location || 'Location',
          description: job.description || 'No description available',
          skills: job.skills || [],
          score,
          match: Math.round(score * 100) // Convert score to percentage
        };
      });
      
      // Sort by score (highest first) and take the top 'limit' results
      return scoredJobs
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting job recommendations:', error);
      return [];
    }
  }
  
  /**
   * Clear the vector store
   */
  async clearVectorStore(): Promise<void> {
    try {
      this.jobs = [];
    } catch (error) {
      console.error('Error clearing vector store:', error);
      throw error;
    }
  }
}

/**
 * Helper function to extract keywords from text
 */
function extractKeywords(text: string): string[] {
  if (!text) return [];
  
  // Convert to lowercase and remove special characters
  const cleanedText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  
  // Split into words
  const words = cleanedText.split(/\s+/);
  
  // Filter out common stop words and short words
  const stopWords = new Set(['and', 'the', 'of', 'to', 'a', 'in', 'for', 'is', 'on', 'that', 'by', 'this', 'with', 'i', 'you', 'it', 'not', 'or', 'be', 'are', 'from', 'at', 'as', 'your', 'have', 'more', 'an', 'was', 'we', 'will']);
  const keywords = words.filter(word => word.length > 2 && !stopWords.has(word));
  
  // Return unique keywords
  return [...new Set(keywords)];
}

/**
 * Helper function to create searchable text from a job
 */
function createJobText(job: any): string {
  return `
    ${job.title || ''}
    ${job.company || ''}
    ${job.location || ''}
    ${job.description || ''}
    ${job.requirements || ''}
    ${Array.isArray(job.skills) ? job.skills.join(' ') : (job.skills || '')}
  `;
}

// Export the class as default
export default JobVectorStore; 