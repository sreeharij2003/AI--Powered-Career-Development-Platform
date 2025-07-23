import jobService from '../services/jobService';
import VectorStore from './vectorStore';
// Update fetch import to be compatible with CommonJS
import fetch from 'node-fetch';

// OpenRouter API key - store this in environment variables in production
const OPENROUTER_API_KEY ='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';
const SITE_URL = 'career-bloom-engine';
const SITE_NAME = 'CareerBloom Assistant';

class ChatbotService {
  private vectorStore: VectorStore;
  private isInitialized: boolean = false;
  private useLLM: boolean = true; // Toggle to use LLM or fallback to rule-based

  constructor() {
    // Initialize the vector store
    this.vectorStore = new VectorStore();
  }

  /**
   * Initialize the chatbot service and load existing jobs into the vector store
   * @param skipDbConnection If true, skip loading jobs from the database
   */
  async initialize(skipDbConnection: boolean = false) {
    if (this.isInitialized) return;

    try {
      // Initialize vector store
      await this.vectorStore.initialize();

      // Try to load existing jobs from database (if not skipping)
      if (!skipDbConnection) {
      try {
        const jobs = await jobService.getJobsForChatbot();
        
        if (jobs.length > 0) {
          try {
            await this.vectorStore.addDocuments(jobs);
            console.log(`Loaded ${jobs.length} jobs into vector store`);
          } catch (error) {
            console.error('Error adding jobs to vector store:', error);
            // Continue initialization even if adding documents fails
          }
        }
      } catch (jobError) {
        console.error('Error loading jobs:', jobError);
        // Continue initialization even if job loading fails
        }
      } else {
        console.log('Skipping database connection for testing');
      }

      this.isInitialized = true;
      console.log('Chatbot service initialized successfully');
    } catch (error) {
      console.error('Error initializing chatbot service:', error);
      throw error;
    }
  }

  /**
   * Ingest new jobs into the vector store
   */
  async ingestJobs(jobs: any[]) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // Only ingest up to 10 jobs at a time to avoid overloading
      const batchSize = 10;
      for (let i = 0; i < jobs.length; i += batchSize) {
        const batch = jobs.slice(i, i + batchSize);
        try {
          await this.vectorStore.addDocuments(batch);
          console.log(`Ingested batch ${i/batchSize + 1} (${batch.length} jobs)`);
          
          // Wait 1 second between batches
          if (i + batchSize < jobs.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`Error ingesting batch ${i/batchSize + 1}:`, error);
        }
      }
      
      console.log(`Completed job ingestion process`);
    } catch (error) {
      console.error('Error in ingestJobs:', error);
      throw error;
    }
  }

  /**
   * Process user query and generate a response using RAG with DeepSeek LLM
   */
  async processUserQuery(query: string, job?: any, resumeText?: string): Promise<string> {
    try {
      if (!this.isInitialized) {
        try {
          await this.initialize();
        } catch (error) {
          console.error('Failed to initialize chatbot on-demand:', error);
          // Return fallback response if initialization fails
          return this.generateRuleBasedResponse(query);
        }
      }

      // Extract intent from query
      const intent = this.classifyQueryIntent(query);

      // Get relevant context based on the query intent
      let context = '';
      
      if (intent === 'job_search') {
        try {
          // Get relevant jobs from vector store
          const relevantJobs = await this.fetchRelevantJobs(query);
          if (relevantJobs && relevantJobs.length > 0) {
            context = this.formatJobsContext(relevantJobs);
          } else {
            // Provide a hint that no jobs were found
            context = "I don't have specific job listings matching your query at the moment.";
          }
        } catch (error) {
          console.error('Error fetching job context:', error);
          // Continue without job context
          context = "I'm unable to access job listings at the moment, but I can still provide career advice.";
        }
      }

      // Add job and resume context if provided
      if (job) {
        context += `\nJob Details: ${JSON.stringify(job)}`;
      }
      if (resumeText) {
        context += `\nUser Resume: ${resumeText}`;
      }

      // Generate response using DeepSeek or fall back to rule-based
      if (this.useLLM) {
        try {
          return await this.generateLLMResponse(query, context, intent);
        } catch (error) {
          console.error('Error generating LLM response, falling back to rule-based:', error);
          return this.generateRuleBasedResponse(query, context);
        }
      } else {
        return this.generateRuleBasedResponse(query, context);
      }
    } catch (error) {
      console.error('Error processing query:', error);
      return "I'm sorry, I encountered an error while processing your request. Please try again.";
    }
  }
  
  /**
   * Generate a response using DeepSeek via OpenRouter
   */
  private async generateLLMResponse(query: string, context: string, intent: string): Promise<string> {
    try {
      // Create system prompt based on intent and context
      let systemPrompt = `You are CareerBloom Assistant, a helpful career advisor.\n\n`;

      // Special formatting for resume + job description analysis
      if (context.includes('Job Details:') && context.includes('User Resume:')) {
        systemPrompt += `When the user provides both a job description and a resume, always answer in the following structured format using clear Markdown:\n\n` +
        `Relevant Experience\n- Use ✅ or ❌ to indicate if the user has relevant work experience for the job.\n- Briefly explain why or why not.\n\n` +
        `Seniority\n- Use ✅ or ❌ to indicate if the user's seniority matches the job requirements.\n- Briefly explain.\n\n` +
        `Education\n- Use ✅ or ❌ to indicate if the user's education matches the job requirements.\n- Briefly explain.\n\n` +
        `Core Skills\n- **Aligned Skills:** List the user's skills that match the job requirements, each with a ✅.\n- **Not Aligned Skills:** List missing or weak skills, each with a ❌.\n\n` +
        `At the end, provide a short summary of fit and actionable advice.\n\n` +
        `Never output raw JSON or unformatted text—always use Markdown for clarity.\n`;
      } else {
        // Default formatting for other intents
        systemPrompt += `Always format your answers using clear Markdown structure:\n- Use headings (###) for the job or main section.\n- Use bullet points for skills, requirements, and advice.\n- Use bold for job title, company, and key advice.\n- Use emojis (✅, ❌, 🟡) for fit/match indicators.\n- At the end, provide a summary and actionable advice in a separate section.\n- Never output raw JSON or unformatted text—always use Markdown for clarity.\n`;
      }

      if (intent === 'job_search') {
        systemPrompt += "You help users find suitable job opportunities and provide career guidance. ";
      } else if (intent === 'resume_help') {
        systemPrompt += "You provide expert advice on resume writing and optimization. ";
      } else if (intent === 'interview_prep') {
        systemPrompt += "You help users prepare for job interviews with practical advice and tips. ";
      } else if (intent === 'career_advice') {
        systemPrompt += "You provide personalized career development advice and guidance. ";
      }
      
      // Add context if available
      if (context) {
        systemPrompt += "Use the following information to inform your response: " + context;
      }
      
      console.log('Sending request to OpenRouter with system prompt:', systemPrompt);
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": SITE_URL,
          "X-Title": SITE_NAME,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "deepseek/deepseek-r1-0528:free",
          "messages": [
            {
              "role": "system",
              "content": systemPrompt
            },
            {
              "role": "user",
              "content": query
            }
          ]
        })
      });

      const data = await response.json() as any;
      
      if (data.error) {
        console.error('OpenRouter API error:', data.error);
        throw new Error('OpenRouter API error: ' + data.error.message);
      }
      
      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        return data.choices[0].message.content;
      } else {
        throw new Error('Invalid response from OpenRouter API');
      }
    } catch (error) {
      console.error('Error in generateLLMResponse:', error);
      throw error;
    }
  }
  
  /**
   * Generate a rule-based response (fallback mechanism)
   */
  private generateRuleBasedResponse(query: string, context: string = ""): string {
    if (!query.trim()) {
      return "How can I help with your career today?";
    }
    
    const intent = this.classifyQueryIntent(query);
    const queryLower = query.toLowerCase();
    
    // Check if we have job context
    const hasJobContext = context.includes('job opportunities') || context.includes('job listings');
    
    // Job search responses
    if (intent === 'job_search') {
      if (hasJobContext) {
        return `${context}\n\nBased on the available job listings, I'd recommend focusing on the positions that best match your skills and experience. Look for positions where your key qualifications align with the job requirements. Consider factors like location, company culture, and growth opportunities when evaluating these positions.`;
      }
      
      if (queryLower.includes('frontend') || queryLower.includes('front end') || queryLower.includes('react')) {
        return `For frontend developer positions, focus on strengthening your skills in modern JavaScript frameworks like React, Vue, or Angular. Build a portfolio that showcases responsive designs and interactive web applications. Highlight your experience with CSS frameworks, state management, and performance optimization techniques.`;
      }
      
      if (queryLower.includes('backend') || queryLower.includes('back end') || queryLower.includes('java') || queryLower.includes('python')) {
        return `For backend developer roles, emphasize your experience with server-side languages like Java, Python, or Node.js. Highlight your knowledge of databases, API design, and server architecture. Showcase projects that demonstrate your understanding of security best practices, performance optimization, and scalable systems.`;
      }
      
      return `To find the right job opportunity, start by clearly defining your career goals, skills, and preferred work environment. Tailor your resume and cover letter for each application, highlighting relevant experience and achievements. Expand your search across multiple platforms, including company websites, job boards, and professional networks. Consider working with recruiters who specialize in your field for access to unadvertised positions.`;
    }
    
    // Resume help responses
    else if (intent === 'resume_help') {
      if (queryLower.includes('ats') || queryLower.includes('tracking')) {
        return `To make your resume ATS-friendly, use a clean, simple format without tables or graphics that could confuse the system. Include keywords from the job description that match your skills and experience. Use standard section headings like "Experience," "Education," and "Skills." Submit your resume as a Word document or simple PDF unless otherwise specified.`;
      }
      
      if (queryLower.includes('summary') || queryLower.includes('profile')) {
        return `A strong professional summary should be 3-4 sentences that highlight your years of experience, relevant skills, significant achievements, and career goals. Tailor it to each position by emphasizing qualifications that align with the job requirements. Think of it as your elevator pitch that gives hiring managers a quick overview of your value proposition.`;
      }
      
      return `To create an effective resume, focus on highlighting your achievements rather than just listing responsibilities. Use strong action verbs and include measurable results when possible. Tailor your resume for each application by matching your qualifications to the job description. Keep the format clean and consistent, and ensure there are no spelling or grammatical errors. Include a professional summary, relevant skills, work experience, and education in a reverse chronological order.`;
    }
    
    // Interview prep responses
    else if (intent === 'interview_prep') {
      if (queryLower.includes('common') || queryLower.includes('typical')) {
        return `Common interview questions include: "Tell me about yourself," "Why do you want this job?", "What are your strengths and weaknesses?", "Describe a challenge you faced and how you overcame it," and "Where do you see yourself in five years?" Prepare concise, structured answers with specific examples from your experience. Practice your responses but avoid memorizing them word-for-word to maintain authenticity.`;
      }
      
      if (queryLower.includes('technical') || queryLower.includes('coding')) {
        return `For technical interviews, review fundamental concepts in your field and practice solving problems aloud to demonstrate your thought process. Study the company's tech stack and be prepared to discuss relevant experience. When faced with a challenging question, break it down into smaller parts and communicate your approach clearly. It's okay to ask clarifying questions or admit when you don't know something, but follow up with how you would find the answer.`;
      }
      
      return `Prepare for your interview by researching the company, understanding the role, and preparing specific examples that showcase your relevant skills and experiences. Practice common questions using the STAR method (Situation, Task, Action, Result) to structure your responses. Prepare thoughtful questions to ask the interviewer about the role, team, and company. On interview day, arrive early, dress professionally, and follow up with a thank-you note expressing your continued interest in the position.`;
    }
    
    // Career advice responses
    else if (intent === 'career_advice') {
      if (queryLower.includes('switch') || queryLower.includes('change') || queryLower.includes('transition')) {
        return `When changing careers, start by identifying transferable skills from your current role that apply to your target field. Fill knowledge gaps through courses, certifications, or side projects. Update your resume to emphasize relevant experience and skills for the new field. Network with professionals in your target industry to gain insights and potential opportunities. Consider starting with a hybrid role that bridges your current experience and desired path, or taking on projects in your current job that develop skills needed for your new direction.`;
      }
      
      if (queryLower.includes('promotion') || queryLower.includes('advance') || queryLower.includes('growth')) {
        return `To advance in your career, take initiative by seeking additional responsibilities and leadership opportunities. Set clear goals and regularly discuss your career aspirations with your manager. Continuously develop relevant skills through training, certifications, or advanced education. Build a strong professional network within and outside your organization. Document your achievements and their impact on the business to make a strong case for promotion when opportunities arise.`;
      }
      
      return `For ongoing career development, focus on both technical and soft skills relevant to your industry. Stay updated on industry trends through professional associations, publications, and networking events. Seek feedback regularly and act on it to improve your performance. Find mentors who can provide guidance based on their experience. Take on challenging projects that stretch your abilities and showcase your potential. Consider both vertical growth (promotions) and horizontal growth (new skills or areas) when planning your career path.`;
    }
    
    // General responses
    else {
      return `I'm your career assistant, here to help with job searches, resume writing, interview preparation, and career advice. I can provide guidance on finding suitable job opportunities, optimizing your resume for specific roles, preparing for interviews, and developing your professional skills. Let me know what specific career assistance you need, and I'll provide relevant advice and resources.`;
    }
  }
  
  /**
   * Classify the intent of a user query
   */
  private classifyQueryIntent(query: string): string {
    const queryLower = query.toLowerCase();
    
    // Job search intent
    const jobSearchKeywords = [
      'job', 'jobs', 'position', 'positions', 'opening', 'openings',
      'vacancy', 'vacancies', 'opportunity', 'opportunities', 'hire', 'hiring',
      'find job', 'find a job', 'search job', 'looking for job', 'apply',
      'employment', 'work', 'career'
    ];
    
    // Career advice intent
    const careerAdviceKeywords = [
      'advice', 'career path', 'growth', 'progress', 'advance', 'promotion',
      'skill', 'skills', 'improve', 'learn', 'develop', 'education', 'training',
      'certificate', 'certification', 'degree', 'career change', 'switch career'
    ];
    
    // Resume help intent
    const resumeHelpKeywords = [
      'resume', 'cv', 'curriculum vitae', 'profile', 'portfolio',
      'improve resume', 'fix resume', 'update resume', 'review resume'
    ];
    
    // Interview prep intent
    const interviewPrepKeywords = [
      'interview', 'interviewing', 'question', 'questions', 'answer',
      'prepare', 'preparation', 'practice', 'behavioral', 'technical'
    ];
    
    // Count matches for each intent
    let jobSearchCount = 0;
    let careerAdviceCount = 0;
    let resumeHelpCount = 0;
    let interviewPrepCount = 0;
    
    // Check for job search intent
    for (const keyword of jobSearchKeywords) {
      if (queryLower.includes(keyword)) {
        jobSearchCount++;
      }
    }
    
    // Check for career advice intent
    for (const keyword of careerAdviceKeywords) {
      if (queryLower.includes(keyword)) {
        careerAdviceCount++;
      }
    }
    
    // Check for resume help intent
    for (const keyword of resumeHelpKeywords) {
      if (queryLower.includes(keyword)) {
        resumeHelpCount++;
      }
    }
    
    // Check for interview prep intent
    for (const keyword of interviewPrepKeywords) {
      if (queryLower.includes(keyword)) {
        interviewPrepCount++;
      }
    }
    
    // Determine the intent with the highest count
    const maxCount = Math.max(jobSearchCount, careerAdviceCount, resumeHelpCount, interviewPrepCount);
    
    if (maxCount === 0) {
      return 'general'; // No specific intent detected
    }
    
    if (maxCount === jobSearchCount) {
      return 'job_search';
    } else if (maxCount === careerAdviceCount) {
      return 'career_advice';
    } else if (maxCount === resumeHelpCount) {
      return 'resume_help';
    } else {
      return 'interview_prep';
    }
  }

  /**
   * Fetch relevant jobs based on the query using vector store
   */
  private async fetchRelevantJobs(query: string): Promise<any[]> {
    try {
      // Extract job roles, locations, and skills from the query
      const roles = this.extractRoles(query);
      const locations = this.extractLocations(query);
      const skills = this.extractSkills(query);
      
      // Extract job types from the query
      const jobTypes = [
        'frontend', 'backend', 'fullstack', 'full stack', 'full-stack', 
        'mobile', 'web', 'cloud', 'devops', 'data', 'machine learning',
        'ui', 'ux', 'security', 'qa', 'test'
      ];
      
      const queryLower = query.toLowerCase();
      const requestedJobTypes = jobTypes.filter(type => queryLower.includes(type));
      
      // Create an enhanced query with explicit job type if detected
      let enhancedQuery = query;
      if (requestedJobTypes.length > 0) {
        // Add job type keywords to make the search more specific
        const jobTypeStr = requestedJobTypes.join(' ');
        enhancedQuery = `${jobTypeStr} ${query} job position role`;
      }
      
      // Retrieve relevant jobs based on the enhanced query
      let relevantJobs = [];
      try {
        relevantJobs = await this.vectorStore.queryDocuments(enhancedQuery, 8);
        
        // Filter results to prioritize jobs matching the requested types
        if (requestedJobTypes.length > 0) {
          // First filter for exact matches in job title
          const exactMatches = relevantJobs.filter(job => {
            const jobTitle = (job.title || '').toLowerCase();
            return requestedJobTypes.some(type => jobTitle.includes(type));
          });
          
          // If we have enough exact matches, use those
          if (exactMatches.length >= 3) {
            relevantJobs = exactMatches.slice(0, 5);
          }
          // Otherwise use both exact and description matches
          else {
            const otherMatches = relevantJobs.filter(job => {
              if (exactMatches.includes(job)) return false;
              
              const jobDescription = (job.description || '').toLowerCase();
              return requestedJobTypes.some(type => jobDescription.includes(type));
            });
            
            relevantJobs = [...exactMatches, ...otherMatches].slice(0, 5);
          }
        }
      } catch (error) {
        console.error('Error querying vector store:', error);
        // Continue with empty results
      }
      
      return relevantJobs;
    } catch (error) {
      console.error('Error fetching relevant jobs:', error);
      return [];
    }
  }

  /**
   * Format jobs data as context for the response
   */
  private formatJobsContext(jobs: any[]): string {
    let context = 'Here are some relevant job opportunities:\n\n';
    
    jobs.forEach((job, index) => {
      context += `Job ${index + 1}: ${job.title || 'Unknown Position'} at ${job.company || 'Unknown Company'}\n`;
        
        if (job.location) {
        context += `Location: ${job.location}${job.remote ? ' (Remote)' : ''}\n`;
        }
        
        if (job.salary) {
        context += `Salary: ${job.salary}\n`;
        }
        
      context += `Type: ${job.type || 'Not specified'}\n`;
        
        if (job.skills && job.skills.length > 0) {
          const skillsText = Array.isArray(job.skills) ? job.skills.join(', ') : job.skills;
        context += `Required Skills: ${skillsText}\n`;
        }
        
        if (job.description) {
          const shortDescription = job.description.length > 150 
            ? job.description.substring(0, 150) + '...' 
            : job.description;
        context += `Description: ${shortDescription}\n`;
      }
      
      context += '\n';
    });
    
    return context;
  }
  
  /**
   * Extract potential job roles from a query
   */
  private extractRoles(query: string): string[] {
    const queryLower = query.toLowerCase();
    const commonRoles = [
      'developer', 'engineer', 'manager', 'designer', 'analyst', 
      'frontend', 'backend', 'fullstack', 'data scientist', 'devops',
      'product manager', 'project manager', 'UX', 'UI', 'marketing',
      'sales', 'customer service', 'HR', 'accountant', 'consultant'
    ];
    
    return commonRoles.filter(role => queryLower.includes(role));
  }
  
  /**
   * Extract potential locations from a query
   */
  private extractLocations(query: string): string[] {
    const queryLower = query.toLowerCase();
    const locations: string[] = [];
    
    // Check for remote preference
    if (queryLower.includes('remote') || queryLower.includes('work from home') || queryLower.includes('wfh')) {
      locations.push('remote');
    }
    
    // Check for hybrid preference
    if (queryLower.includes('hybrid')) {
      locations.push('hybrid');
    }
    
    // Check for onsite/in-office preference
    if (queryLower.includes('onsite') || queryLower.includes('in office') || queryLower.includes('in-office')) {
      locations.push('onsite');
    }
    
    // Add potential cities/locations - this could be expanded with a more comprehensive list
    const commonLocations = [
      'new york', 'san francisco', 'seattle', 'austin', 'boston',
      'chicago', 'los angeles', 'atlanta', 'dallas', 'denver'
    ];
    
    commonLocations.forEach(location => {
      if (queryLower.includes(location)) {
        locations.push(location);
      }
    });
    
    return locations;
  }
  
  /**
   * Extract potential skills from a query
   */
  private extractSkills(query: string): string[] {
    const queryLower = query.toLowerCase();
    const commonSkills = [
      'javascript', 'python', 'java', 'c++', 'c#', 'react', 'angular', 'vue', 
      'node', 'express', 'mongodb', 'sql', 'nosql', 'aws', 'azure', 'docker', 
      'kubernetes', 'git', 'agile', 'scrum', 'typescript', 'html', 'css', 'php',
      'ruby', 'swift', 'kotlin', 'flutter', 'react native', 'django', 'flask',
      'spring', 'hibernate', 'graphql', 'rest', 'api', 'database', 'frontend',
      'backend', 'fullstack', 'devops', 'machine learning', 'ai', 'data science'
    ];
    
    return commonSkills.filter(skill => queryLower.includes(skill));
  }
  
  /**
   * Reset the vector store (for maintenance or testing)
   */
  async resetVectorStore() {
    try {
      await this.vectorStore.clearVectorStore();
      this.isInitialized = false;
      return true;
    } catch (error) {
      console.error('Error resetting vector store:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default ChatbotService; 