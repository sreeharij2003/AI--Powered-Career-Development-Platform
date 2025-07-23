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
   * Enhanced keyword matching with better scoring
   */
  async getRecommendedJobs(resumeText: string, limit: number = 5): Promise<any[]> {
    try {
      if (this.jobs.length === 0) {
        console.log('No jobs in vector store');
        return [];
      }

      console.log(`Processing ${this.jobs.length} jobs for recommendations`);

      // Extract keywords from resume text
      const resumeKeywords = extractKeywords(resumeText);
      const resumeSkills = extractTechnicalSkills(resumeText);

      console.log(`Resume keywords: ${resumeKeywords.slice(0, 10).join(', ')}...`);
      console.log(`Resume skills: ${resumeSkills.join(', ')}`);

      // Remove duplicates by job URL or title+company combination
      const uniqueJobs = this.removeDuplicateJobs(this.jobs);
      console.log(`Unique jobs after deduplication: ${uniqueJobs.length}`);

      // Score jobs using enhanced matching algorithm
      const scoredJobs = uniqueJobs.map(job => {
        const jobText = createJobText(job);
        const jobKeywords = extractKeywords(jobText);
        const jobSkills = extractTechnicalSkills(jobText);

        // 1. Exact skill matches (highest weight)
        const exactSkillMatches = resumeSkills.filter(skill =>
          jobSkills.some(jobSkill =>
            skill.toLowerCase() === jobSkill.toLowerCase()
          )
        );

        // 2. Partial skill matches (medium weight)
        const partialSkillMatches = resumeSkills.filter(skill =>
          jobSkills.some(jobSkill =>
            (jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
             skill.toLowerCase().includes(jobSkill.toLowerCase())) &&
            skill.toLowerCase() !== jobSkill.toLowerCase()
          )
        );

        // 3. Keyword matches (lower weight)
        const keywordMatches = resumeKeywords.filter(keyword =>
          jobKeywords.some(jobKeyword =>
            jobKeyword.includes(keyword) || keyword.includes(jobKeyword)
          )
        );

        // 4. Title relevance score
        const titleRelevanceScore = this.calculateTitleRelevance(resumeText, job.title || '');

        // 5. Experience level match
        const experienceLevelScore = this.calculateExperienceLevelMatch(resumeText, job.description || '');

        // 6. Location preference (if remote work is mentioned)
        const locationScore = this.calculateLocationScore(resumeText, job);

        // Calculate weighted scores
        const exactSkillScore = exactSkillMatches.length / Math.max(resumeSkills.length, 1);
        const partialSkillScore = partialSkillMatches.length / Math.max(resumeSkills.length, 1);
        const keywordScore = keywordMatches.length / Math.max(resumeKeywords.length, 1);

        // Combined score with sophisticated weighting
        const combinedScore = (
          exactSkillScore * 0.4 +        // 40% for exact skill matches
          partialSkillScore * 0.25 +     // 25% for partial skill matches
          keywordScore * 0.15 +          // 15% for keyword matches
          titleRelevanceScore * 0.1 +    // 10% for title relevance
          experienceLevelScore * 0.05 +  // 5% for experience level match
          locationScore * 0.05           // 5% for location preference
        );

        const matchPercentage = Math.min(Math.round(combinedScore * 100), 100);

        // Ensure we preserve all original job fields and add detailed scoring
        return {
          ...job, // Preserve all original job fields
          _id: job._id || job.id, // Ensure _id is available
          id: job.id || job._id, // Ensure id is available
          title: job.title || 'Job Title',
          company: job.company || 'Company',
          location: job.location || 'Location',
          description: job.description || 'No description available',
          skills: job.skills || [],
          score: combinedScore,
          match: matchPercentage,
          match_score: matchPercentage, // For compatibility
          // Detailed matching information
          exactSkillMatches: exactSkillMatches.length,
          partialSkillMatches: partialSkillMatches.length,
          keywordMatches: keywordMatches.length,
          titleRelevance: titleRelevanceScore,
          experienceMatch: experienceLevelScore,
          locationMatch: locationScore,
          matchedSkills: [...exactSkillMatches, ...partialSkillMatches],
          matchedKeywords: keywordMatches
        };
      });

      // Sort by score (highest first) and take the top 'limit' results
      const topJobs = scoredJobs
        .filter(job => job.score > 0) // Only return jobs with some match
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      console.log(`Returning ${topJobs.length} recommendations with scores:`,
        topJobs.map(job => `${job.title} (${job.match}%)`));

      return topJobs;
    } catch (error) {
      console.error('Error getting job recommendations:', error);
      return [];
    }
  }

  /**
   * Remove duplicate jobs based on URL or title+company combination
   */
  private removeDuplicateJobs(jobs: any[]): any[] {
    const seen = new Set();
    return jobs.filter(job => {
      // Create a unique identifier for the job
      const identifier = job.url || `${job.title}-${job.company}`.toLowerCase();

      if (seen.has(identifier)) {
        return false;
      }
      seen.add(identifier);
      return true;
    });
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

  /**
   * Calculate title relevance score based on job titles mentioned in resume
   */
  private calculateTitleRelevance(resumeText: string, jobTitle: string): number {
    const resumeLower = resumeText.toLowerCase();
    const titleLower = jobTitle.toLowerCase();

    // Common job title variations
    const titleVariations = [
      titleLower,
      titleLower.replace(/\s+/g, ''),
      titleLower.replace('engineer', 'developer'),
      titleLower.replace('developer', 'engineer'),
      titleLower.replace('sr.', 'senior'),
      titleLower.replace('jr.', 'junior')
    ];

    // Check if any variation appears in resume
    for (const variation of titleVariations) {
      if (resumeLower.includes(variation)) {
        return 1.0;
      }
    }

    // Check for partial matches with key terms
    const titleWords = titleLower.split(' ').filter(word => word.length > 2);
    const matchedWords = titleWords.filter(word => resumeLower.includes(word));

    return matchedWords.length / Math.max(titleWords.length, 1);
  }

  /**
   * Calculate experience level match score
   */
  private calculateExperienceLevelMatch(resumeText: string, jobDescription: string): number {
    const resumeLower = resumeText.toLowerCase();
    const jobLower = jobDescription.toLowerCase();

    // Extract experience indicators from resume
    const resumeExperience = this.extractExperienceLevel(resumeLower);
    const jobExperience = this.extractExperienceLevel(jobLower);

    // Perfect match
    if (resumeExperience === jobExperience) {
      return 1.0;
    }

    // Partial matches based on career progression
    const experienceLevels = ['entry', 'junior', 'mid', 'senior', 'lead'];
    const resumeIndex = experienceLevels.indexOf(resumeExperience);
    const jobIndex = experienceLevels.indexOf(jobExperience);

    if (resumeIndex !== -1 && jobIndex !== -1) {
      const difference = Math.abs(resumeIndex - jobIndex);
      return Math.max(0, 1 - (difference * 0.3));
    }

    return 0.5; // Default neutral score
  }

  /**
   * Calculate location preference score
   */
  private calculateLocationScore(resumeText: string, job: any): number {
    const resumeLower = resumeText.toLowerCase();

    // Check if candidate prefers remote work
    const prefersRemote = resumeLower.includes('remote') ||
                         resumeLower.includes('work from home') ||
                         resumeLower.includes('distributed');

    // Check if job is remote
    const isRemoteJob = job.remote ||
                       (job.location && job.location.toLowerCase().includes('remote'));

    if (prefersRemote && isRemoteJob) {
      return 1.0;
    }

    if (!prefersRemote && !isRemoteJob) {
      return 0.8; // Slight preference for on-site if not mentioned
    }

    return 0.6; // Neutral score for mixed preferences
  }

  /**
   * Extract experience level from text
   */
  private extractExperienceLevel(text: string): string {
    if (text.includes('senior') || text.includes('lead') || text.includes('principal')) {
      return 'senior';
    }
    if (text.includes('junior') || text.includes('entry') || text.includes('graduate')) {
      return 'junior';
    }

    // Look for years of experience
    const experienceMatch = text.match(/(\d+)\+?\s*years?\s*(?:of\s*)?experience/);
    if (experienceMatch) {
      const years = parseInt(experienceMatch[1]);
      if (years >= 5) return 'senior';
      if (years >= 2) return 'mid';
      return 'junior';
    }

    return 'mid'; // Default
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
  const stopWords = new Set(['and', 'the', 'of', 'to', 'a', 'in', 'for', 'is', 'on', 'that', 'by', 'this', 'with', 'i', 'you', 'it', 'not', 'or', 'be', 'are', 'from', 'at', 'as', 'your', 'have', 'more', 'an', 'was', 'we', 'will', 'can', 'will', 'would', 'should', 'could']);
  const keywords = words.filter(word => word.length > 2 && !stopWords.has(word));

  // Return unique keywords
  return [...new Set(keywords)];
}

/**
 * Enhanced function to extract technical skills and technologies
 */
function extractTechnicalSkills(text: string): string[] {
  if (!text) return [];

  const textLower = text.toLowerCase();

  // Comprehensive list of technical skills and technologies
  const technicalSkills = [
    // Programming Languages
    'javascript', 'typescript', 'python', 'java', 'c#', 'c++', 'c', 'ruby', 'php', 'swift', 'kotlin', 'go', 'rust', 'scala', 'r', 'matlab', 'perl', 'shell', 'bash', 'powershell',

    // Frontend Technologies
    'react', 'angular', 'vue', 'vue.js', 'svelte', 'ember', 'backbone', 'jquery', 'html', 'css', 'sass', 'scss', 'less', 'bootstrap', 'tailwind', 'material-ui', 'chakra-ui',

    // Backend Technologies
    'node.js', 'express', 'fastify', 'koa', 'django', 'flask', 'fastapi', 'spring', 'spring boot', 'asp.net', 'laravel', 'symfony', 'rails', 'sinatra', 'gin', 'echo',

    // Databases
    'mongodb', 'mysql', 'postgresql', 'sqlite', 'redis', 'elasticsearch', 'cassandra', 'dynamodb', 'firebase', 'firestore', 'oracle', 'sql server', 'mariadb', 'neo4j',

    // Cloud Platforms
    'aws', 'azure', 'gcp', 'google cloud', 'heroku', 'vercel', 'netlify', 'digitalocean', 'linode', 'cloudflare',

    // DevOps & Tools
    'docker', 'kubernetes', 'jenkins', 'gitlab ci', 'github actions', 'terraform', 'ansible', 'chef', 'puppet', 'vagrant', 'nginx', 'apache', 'linux', 'ubuntu', 'centos',

    // Version Control
    'git', 'github', 'gitlab', 'bitbucket', 'svn', 'mercurial',

    // Testing
    'jest', 'mocha', 'chai', 'cypress', 'selenium', 'pytest', 'junit', 'testng', 'rspec', 'phpunit',

    // Mobile Development
    'react native', 'flutter', 'ionic', 'xamarin', 'cordova', 'phonegap', 'android', 'ios', 'swift', 'objective-c',

    // Data Science & ML
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'matplotlib', 'seaborn', 'jupyter', 'anaconda', 'spark', 'hadoop',

    // Methodologies
    'agile', 'scrum', 'kanban', 'devops', 'ci/cd', 'tdd', 'bdd', 'microservices', 'serverless', 'rest', 'graphql', 'soap', 'api',

    // Design & UI/UX
    'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator', 'invision', 'zeplin', 'principle', 'framer'
  ];

  // Find skills that appear in the text
  const foundSkills = technicalSkills.filter(skill => {
    // Check for exact matches and partial matches
    return textLower.includes(skill) ||
           textLower.includes(skill.replace(/\./g, '')) || // Handle cases like "node.js" vs "nodejs"
           textLower.includes(skill.replace(/\s/g, '')); // Handle cases like "react native" vs "reactnative"
  });

  // Return unique skills
  return [...new Set(foundSkills)];
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