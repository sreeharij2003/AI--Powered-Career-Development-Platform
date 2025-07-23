import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Generic content generation method
  async generateContent(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating content with Gemini:', error);
      throw new Error('Failed to generate content');
    }
  }

  async generateResumeContent(section: string, context: any): Promise<string> {
    try {
      let prompt = '';

      switch (section) {
        case 'summary':
          prompt = this.createSummaryPrompt(context);
          break;
        case 'experience':
          prompt = this.createExperiencePrompt(context);
          break;
        case 'projects':
          prompt = this.createProjectPrompt(context);
          break;
        case 'skills':
          prompt = this.createSkillsPrompt(context);
          break;
        case 'education':
          prompt = this.createEducationPrompt(context);
          break;
        case 'certifications':
          prompt = this.createCertificationPrompt(context);
          break;
        default:
          throw new Error(`Unsupported section: ${section}`);
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating content with Gemini:', error);
      throw new Error('Failed to generate content');
    }
  }

  // Advanced Resume Customization with Multiple Prompting Strategies
  async customizeResumeForJob(resumeData: any, jobDescription: string): Promise<any> {
    try {
      console.log('🎯 Starting resume customization with advanced prompting strategies...');

      // Step 1: Chain-of-Thought Analysis with retry logic
      const analysisResult = await this.retryWithBackoff(() =>
        this.analyzeJobRequirements(jobDescription)
      );

      // Step 2: ReAct Prompting for Strategic Planning with retry logic
      const customizationPlan = await this.retryWithBackoff(() =>
        this.createCustomizationPlan(resumeData, analysisResult)
      );

      // Step 3: Few-Shot Prompting for Content Generation with retry logic
      const customizedContent = await this.retryWithBackoff(() =>
        this.generateCustomizedContent(resumeData, customizationPlan, jobDescription)
      );

      return {
        success: true,
        originalResume: resumeData,
        customizedResume: customizedContent,
        analysisResult,
        customizationPlan
      };
    } catch (error: any) {
      console.error('❌ Error customizing resume:', error);

      // Check if it's a Gemini API overload error
      if (error.status === 503 || error.message.includes('overloaded')) {
        throw new Error('AI service is temporarily overloaded. Please try again in a few moments.');
      } else if (error.status === 429) {
        throw new Error('AI service rate limit exceeded. Please wait a moment and try again.');
      } else if (error.message.includes('GoogleGenerativeAI')) {
        throw new Error('AI service is temporarily unavailable. Please try again later.');
      }

      // Fallback: provide basic customization without AI
      console.log('🔄 AI service unavailable, providing basic customization...');
      return this.createBasicCustomization(resumeData, jobDescription);
    }
  }

  // Fallback method for basic customization when AI is unavailable - ONLY SUMMARY AND SKILLS
  private createBasicCustomization(resumeData: any, jobDescription: string): any {
    console.log('📝 FALLBACK MODE: Only modifying summary and skills, preserving ALL other content exactly as-is');

    // Extract keywords from job description
    const jobKeywords = this.extractKeywordsFromJobDescription(jobDescription);

    // Basic summary enhancement - only if summary exists
    let enhancedSummary = resumeData.summary || '';
    if (enhancedSummary && jobKeywords.length > 0) {
      // Add 1-2 relevant keywords to summary if not already present
      const keywordsToAdd = jobKeywords.slice(0, 2);
      keywordsToAdd.forEach(keyword => {
        if (!enhancedSummary.toLowerCase().includes(keyword.toLowerCase())) {
          enhancedSummary += ` Experienced with ${keyword}.`;
        }
      });
    }

    // Basic skills enhancement - add relevant skills from job description
    let enhancedSkills = [...(resumeData.skills || [])];
    jobKeywords.slice(0, 5).forEach(keyword => {
      const skillExists = enhancedSkills.some(skill =>
        (typeof skill === 'string' ? skill : skill.name)
          .toLowerCase().includes(keyword.toLowerCase())
      );

      if (!skillExists) {
        enhancedSkills.push({
          name: keyword,
          category: 'Technical',
          proficiency: 'intermediate'
        });
      }
    });

    // Return resume with ONLY summary and skills modified, everything else exactly preserved
    return {
      success: true,
      originalResume: resumeData,
      customizedResume: {
        ...resumeData,
        summary: enhancedSummary,
        skills: enhancedSkills
        // ALL other fields preserved exactly as they were
      },
      analysisResult: {
        roleAnalysis: { title: 'Position from job description', industry: 'Technology' },
        fallbackMode: true
      },
      customizationPlan: {
        fallbackMode: true,
        message: 'Basic customization applied - only summary and skills modified, all other content preserved exactly'
      }
    };
  }

  // Extract keywords from job description
  private extractKeywordsFromJobDescription(jobDescription: string): string[] {
    const commonTechKeywords = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue',
      'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker',
      'Git', 'TypeScript', 'Express', 'Spring', 'Django', 'Flask',
      'REST', 'API', 'GraphQL', 'Microservices', 'Agile', 'Scrum'
    ];

    const foundKeywords = commonTechKeywords.filter(keyword =>
      jobDescription.toLowerCase().includes(keyword.toLowerCase())
    );

    return foundKeywords.slice(0, 8); // Return top 8 relevant keywords
  }

  // Retry logic with exponential backoff
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        console.log(`🔄 Attempt ${attempt}/${maxRetries} failed:`, error.message);

        // Don't retry on certain errors
        if (error.status === 400 || error.status === 401 || error.status === 403) {
          throw error;
        }

        // If this is the last attempt, throw the error
        if (attempt === maxRetries) {
          throw error;
        }

        // Wait before retrying with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Max retries exceeded');
  }

  // Chain-of-Thought Prompting for Job Analysis
  private async analyzeJobRequirements(jobDescription: string): Promise<any> {
    const cotPrompt = `
You are an expert ATS (Applicant Tracking System) and resume optimization specialist. Analyze this job description using Chain-of-Thought reasoning to extract ONLY the essential elements needed for resume customization.

Job Description:
${jobDescription}

Think step by step:

1. FIRST, identify the core role requirements:
   - What is the exact job title?
   - What are the PRIMARY technical skills mentioned?
   - What are the SECONDARY technical skills mentioned?
   - What soft skills are explicitly mentioned?

2. SECOND, extract ATS keywords:
   - What specific technologies, frameworks, and tools are mentioned?
   - What programming languages are required?
   - What methodologies or processes are mentioned?
   - What industry-specific terms appear?

3. THIRD, identify experience expectations:
   - What level of experience is required?
   - What types of projects or responsibilities are mentioned?
   - What achievements or outcomes are valued?

4. FOURTH, determine customization priorities:
   - Which skills should be emphasized MOST in summary?
   - Which technical skills should be added to skills section?
   - What keywords should be naturally integrated?
   - What tone matches the job posting (technical, business-focused, etc.)?

CRITICAL RULES:
- Focus ONLY on skills and keywords that can be reasonably added
- Do NOT suggest skills that require extensive training
- Prioritize skills that are complementary to existing background
- Extract exact terminology used in job posting

Provide your analysis in JSON format:
{
  "roleAnalysis": {
    "title": "exact job title from posting",
    "primarySkills": ["most important skills"],
    "secondarySkills": ["nice-to-have skills"],
    "experienceLevel": "entry/mid/senior level"
  },
  "atsKeywords": {
    "mustHave": ["critical keywords for ATS"],
    "technical": ["programming languages, frameworks, tools"],
    "methodologies": ["agile, scrum, etc."],
    "softSkills": ["communication, teamwork, etc."]
  },
  "customizationPriority": {
    "summaryFocus": ["top 3 areas to emphasize in summary"],
    "skillsToAdd": ["skills to add that complement existing background"],
    "keywordIntegration": ["exact phrases to include naturally"],
    "toneStyle": "technical/business/creative/formal"
  }
}
`;

    console.log('🧠 Sending Chain-of-Thought analysis to Gemini...');
    const result = await this.model.generateContent(cotPrompt);
    const response = await result.response;
    console.log('✅ Received analysis from Gemini');

    try {
      // Extract JSON from response
      const jsonMatch = response.text().match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Error parsing analysis result:', parseError);
    }

    return { error: 'Failed to parse analysis result' };
  }

  // ReAct Prompting for Strategic Planning
  private async createCustomizationPlan(resumeData: any, analysisResult: any): Promise<any> {
    const reactPrompt = `
You are a strategic resume consultant using ReAct (Reasoning + Acting) methodology.

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

JOB ANALYSIS:
${JSON.stringify(analysisResult, null, 2)}

Use ReAct prompting to create a customization plan. IMPORTANT: Only customize content that should change based on job requirements. DO NOT modify factual information like education details, certifications, or contact information.

THOUGHT: What are the key gaps between the current resume and job requirements?
ACTION: Analyze each resume section against job requirements
OBSERVATION: [Identify specific areas that need enhancement - focus on summary, skills, experience descriptions, and project descriptions]

THOUGHT: What is the best strategy to align the resume with the job?
ACTION: Prioritize customization actions based on impact
OBSERVATION: [Determine which changes will have the most impact - prioritize summary rewriting, skills optimization, and experience/project rephrasing]

THOUGHT: How should I restructure and rephrase content?
ACTION: Plan specific modifications for customizable sections only
OBSERVATION: [Create detailed action plan for summary, skills, experience descriptions, and project descriptions]

CUSTOMIZATION RULES:
- ALWAYS customize: summary, skills, experience descriptions, project descriptions
- NEVER customize: education details, certifications, contact information, dates, company names, job titles
- FOCUS ON: keyword optimization, achievement highlighting, relevance enhancement

Provide your plan in JSON format:
{
  "gapAnalysis": {
    "missingSkills": ["skill1", "skill2"],
    "underemphasizedAreas": ["area1", "area2"],
    "strengthsToHighlight": ["strength1", "strength2"]
  },
  "prioritizedActions": [
    {
      "section": "summary|skills|experience|projects",
      "priority": "high|medium|low",
      "action": "rewrite|enhance|add_keywords|optimize",
      "reasoning": "why this change is important"
    }
  ],
  "contentStrategy": {
    "keywordsToAdd": ["keyword1", "keyword2"],
    "phrasesToInclude": ["phrase1", "phrase2"],
    "toneAdjustments": "more technical|more leadership-focused|etc"
  },
  "sectionsToCustomize": ["summary", "skills", "experience", "projects"],
  "sectionsToPreserve": ["education", "certifications", "contact"]
}
`;

    console.log('⚡ Sending ReAct planning to Gemini...');
    const result = await this.model.generateContent(reactPrompt);
    const response = await result.response;
    console.log('✅ Received customization plan from Gemini');

    try {
      const jsonMatch = response.text().match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Error parsing customization plan:', parseError);
    }

    return { error: 'Failed to parse customization plan' };
  }

  // Few-Shot Prompting for Content Generation - ONLY SUMMARY AND SKILLS
  private async generateCustomizedContent(resumeData: any, plan: any, jobDescription: string): Promise<any> {
    console.log('🎯 STRICT RULE: Only customizing summary and skills, preserving ALL other content exactly as-is');

    const customizedSections = {};

    // ONLY customize Summary and Skills - NOTHING ELSE
    customizedSections['summary'] = await this.customizeSummaryFewShot(resumeData.summary, plan, jobDescription);
    customizedSections['skills'] = await this.customizeSkillsFewShot(resumeData.skills, plan, jobDescription);

    // Return the resume with ONLY summary and skills modified, everything else preserved exactly
    return {
      ...resumeData,
      summary: customizedSections['summary'],
      skills: customizedSections['skills']
      // All other fields (education, projects, experience, certifications, etc.) remain exactly as they were
    };
  }

  // Few-Shot Summary Customization
  private async customizeSummaryFewShot(originalSummary: string, plan: any, jobDescription: string): Promise<string> {
    const fewShotPrompt = `
You are an expert ATS-optimized resume writer. Here are examples of how to customize summaries for specific jobs while maintaining truthfulness:

EXAMPLE 1:
Original: "Computer Science student with expertise in developing deep-learning models, analyzing network data, and building web applications. Proficient in Python, SQL, Java, HTML, CSS, and JavaScript."
Job: "Frontend Developer - React, JavaScript, HTML/CSS, Responsive Design"
Customized: "Dedicated Computer Science student with strong expertise in frontend web development using JavaScript, HTML, and CSS. Proven experience in building responsive web applications with modern frameworks, demonstrating proficiency in user interface design and cross-browser compatibility."

EXAMPLE 2:
Original: "Marketing professional with digital campaign experience and analytics background."
Job: "Data Analyst - Python, SQL, Machine Learning, Data Visualization"
Customized: "Analytical marketing professional with extensive experience in data analysis and SQL database management. Skilled in Python programming and statistical analysis, with proven ability to derive actionable insights from complex datasets and create compelling data visualizations."

EXAMPLE 3:
Original: "Recent graduate with internship experience in full-stack development and database management."
Job: "Backend Developer - Node.js, Express, MongoDB, RESTful APIs"
Customized: "Results-driven developer with hands-on experience in backend development using Node.js and Express framework. Proficient in MongoDB database management and RESTful API development, with strong foundation in building scalable server-side applications."

NOW CUSTOMIZE THIS:
Original Summary: "${originalSummary}"
Job Description: "${jobDescription}"
Analysis Results: ${JSON.stringify(plan, null, 2)}

CRITICAL CUSTOMIZATION RULES:
1. PRESERVE the candidate's actual background and experience level
2. ONLY emphasize existing skills that genuinely match the job requirements
3. ADD relevant keywords from job description NATURALLY (don't force them)
4. NEVER add fake experience, skills, or achievements
5. KEEP the original tone and personality of the summary
6. ONLY make minimal changes - enhance, don't rewrite completely
7. If the original summary is good, make only small keyword additions

IMPORTANT: Make MINIMAL changes. Only add 1-2 relevant keywords if they fit naturally.

Return ONLY the enhanced summary text, nothing else.
`;

    const result = await this.model.generateContent(fewShotPrompt);
    const response = await result.response;
    return response.text().trim();
  }

  // Few-Shot Skills Customization
  private async customizeSkillsFewShot(originalSkills: any[], plan: any, jobDescription: string): Promise<any[]> {
    const fewShotPrompt = `
You are an expert ATS optimization specialist. Here are examples of how to enhance skills sections for better job matching:

EXAMPLE 1:
Original Skills: ["Python", "C", "C++", "Java", "HTML", "CSS", "JavaScript", "Bootstrap", "React.js"]
Job: "Frontend Developer - React, JavaScript, HTML/CSS, Responsive Design, Git"
Enhanced Skills: ["JavaScript", "React.js", "HTML", "CSS", "Bootstrap", "Responsive Design", "Git", "Python", "Java", "C++", "C"]
Reasoning: Prioritized frontend skills first, added Git (fundamental for developers), kept all original skills

EXAMPLE 2:
Original Skills: ["Python", "MySQL", "PostgreSQL", "MongoDB", "Machine Learning", "Deep Learning"]
Job: "Data Scientist - Python, SQL, Machine Learning, Pandas, NumPy, Scikit-learn, Data Visualization"
Enhanced Skills: ["Python", "Machine Learning", "Deep Learning", "SQL", "Pandas", "NumPy", "Scikit-learn", "Data Visualization", "MySQL", "PostgreSQL", "MongoDB"]
Reasoning: Prioritized ML skills, added complementary Python libraries, grouped SQL variants

EXAMPLE 3:
Original Skills: ["Node.js", "Express", "MongoDB", "JavaScript", "HTML", "CSS"]
Job: "Full Stack Developer - React, Node.js, Express, MongoDB, RESTful APIs, Git"
Enhanced Skills: ["JavaScript", "React", "Node.js", "Express", "MongoDB", "RESTful APIs", "HTML", "CSS", "Git"]
Reasoning: Added React (natural progression from JS), RESTful APIs (backend essential), Git (version control)

NOW ENHANCE THIS:
Original Skills: ${JSON.stringify(originalSkills)}
Job Description: "${jobDescription}"
Job Analysis: ${JSON.stringify(plan, null, 2)}

ENHANCEMENT RULES:
1. KEEP ALL existing skills - never remove any
2. REORDER skills to put job-relevant ones first
3. ADD ONLY skills that are:
   - Explicitly mentioned in job description
   - Natural extensions of existing skills (e.g., React if they know JavaScript)
   - Fundamental tools for their field (e.g., Git for developers)
4. USE exact terminology from job posting
5. GROUP related skills together logically
6. MAINTAIN realistic proficiency levels
7. DO NOT add skills requiring extensive new learning

Return a JSON array of skill objects in this format:
[
  {"name": "Skill Name", "category": "Technical|Soft|Domain", "proficiency": "beginner|intermediate|advanced|expert"},
  ...
]
`;

    const result = await this.model.generateContent(fewShotPrompt);
    const response = await result.response;

    try {
      const jsonMatch = response.text().match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Error parsing customized skills:', parseError);
    }

    return originalSkills;
  }

  // Few-Shot Experience Customization
  private async customizeExperienceFewShot(originalExperience: any[], plan: any, jobDescription: string): Promise<any[]> {
    const customizedExperience = [];

    for (const exp of originalExperience) {
      const fewShotPrompt = `
You are an expert resume optimization specialist. Here are examples of how to rephrase experience descriptions for better job alignment:

EXAMPLE 1:
Original: "Designed and developed full-stack web applications using Node.js, Express, and MongoDB, creating RESTful APIs to enable seamless frontend-backend integration."
Job: "Frontend Developer - React, JavaScript, UI/UX, Responsive Design"
Optimized: "Designed and developed responsive full-stack web applications with focus on frontend user experience using JavaScript and modern frameworks. Created seamless frontend-backend integration through RESTful API development, ensuring optimal user interface performance and cross-browser compatibility."

EXAMPLE 2:
Original: "Developed a machine learning model to predict heart disease using Random Forest on a Kaggle dataset."
Job: "Data Scientist - Python, Machine Learning, Statistical Analysis, Model Optimization"
Optimized: "Developed and optimized machine learning models for predictive analytics using Python and Random Forest algorithms. Applied advanced statistical analysis and hyperparameter tuning techniques to enhance model performance and accuracy on large-scale datasets."

EXAMPLE 3:
Original: "Collaborated with cross-functional teams to conceptualize and deliver full-stack web solutions."
Job: "Backend Developer - Node.js, APIs, Database Design, System Architecture"
Optimized: "Collaborated with cross-functional teams to architect and deliver scalable backend solutions using Node.js. Designed robust database systems and RESTful APIs, ensuring efficient data management and seamless system integration."

NOW OPTIMIZE THIS:
Original Experience: "${exp.responsibilities || exp.description || ''}"
Company: "${exp.company || ''}"
Position: "${exp.title || exp.position || ''}"
Duration: "${exp.duration || ''}"
Job Description: "${jobDescription}"
Target Keywords: ${JSON.stringify(plan.atsKeywords || {})}

OPTIMIZATION RULES:
1. KEEP all factual information (company, title, duration) exactly the same
2. REPHRASE responsibilities to emphasize skills relevant to target job
3. INTEGRATE keywords from job description naturally
4. HIGHLIGHT transferable skills and relevant technical achievements
5. USE action verbs that match the job posting tone
6. MAINTAIN 100% truthfulness - only improve presentation, don't add fake accomplishments
7. FOCUS on aspects most relevant to the target role

Return ONLY the optimized experience description, nothing else.
`;

      const result = await this.model.generateContent(fewShotPrompt);
      const response = await result.response;

      customizedExperience.push({
        ...exp,
        responsibilities: response.text().trim()
      });
    }

    return customizedExperience;
  }

  // Few-Shot Projects Customization
  private async customizeProjectsFewShot(originalProjects: any[], plan: any, jobDescription: string): Promise<any[]> {
    const customizedProjects = [];

    for (const project of originalProjects) {
      const fewShotPrompt = `
You are an expert technical resume writer. Here are examples of how to optimize project descriptions for specific job targets:

EXAMPLE 1:
Original: "Developed a full-stack AI platform that converts uploaded documents into summaries, quizzes, podcasts, and video suggestions."
Job: "Frontend Developer - React, UI/UX, API Integration, Responsive Design"
Optimized: "Developed a responsive full-stack AI platform with intuitive user interface using React and modern frontend frameworks. Implemented seamless API integration for document processing and content transformation, ensuring optimal user experience across multiple device formats."

EXAMPLE 2:
Original: "Developed a machine learning model to predict heart disease using Random Forest on a Kaggle dataset."
Job: "Data Scientist - Python, Machine Learning, Statistical Modeling, Data Analysis"
Optimized: "Engineered a robust machine learning model for predictive healthcare analytics using Python and Random Forest algorithms. Applied advanced statistical modeling techniques and comprehensive data analysis to achieve high-accuracy predictions on large-scale medical datasets."

EXAMPLE 3:
Original: "Building an AI-driven interview platform utilizing React.js, Node.js, and MongoDB."
Job: "Full Stack Developer - React, Node.js, Database Design, System Architecture"
Optimized: "Architected and developed a scalable AI-driven interview platform using React.js frontend and Node.js backend architecture. Designed comprehensive MongoDB database schema and implemented robust system architecture to support real-time user interactions and data processing."

NOW OPTIMIZE THIS:
Original Project: "${project.description || ''}"
Project Name: "${project.title || project.name || ''}"
Technologies: "${project.technologies || ''}"
Duration: "${project.duration || ''}"
Job Description: "${jobDescription}"
Target Skills: ${JSON.stringify(plan.atsKeywords || {})}

OPTIMIZATION RULES:
1. KEEP project name, technologies, and timeline exactly the same
2. REPHRASE description to highlight skills most relevant to target job
3. EMPHASIZE technical aspects that match job requirements
4. USE exact terminology from job description where appropriate
5. HIGHLIGHT problem-solving and technical achievements relevant to role
6. MAINTAIN project accuracy - only improve presentation, don't add fake features
7. FOCUS on transferable technical skills and methodologies

Return ONLY the optimized project description, nothing else.
`;

      const result = await this.model.generateContent(fewShotPrompt);
      const response = await result.response;

      customizedProjects.push({
        ...project,
        description: response.text().trim()
      });
    }

    return customizedProjects;
  }

  private createSummaryPrompt(context: any): string {
    const { dreamJob, currentRole, experience, skills, education } = context;

    return `Create a professional resume summary for someone targeting a ${dreamJob} position.

Context:
- Dream Job: ${dreamJob}
- Current Role: ${currentRole || 'Recent graduate/Entry level'}
- Years of Experience: ${experience || '0-2 years'}
- Key Skills: ${skills?.join(', ') || 'Not specified'}
- Education: ${education || 'Not specified'}

Requirements:
- Write in third person
- 3-4 sentences maximum
- Highlight relevant skills and experience
- Show enthusiasm for the target role
- Use action words and quantifiable achievements where possible
- Make it ATS-friendly
- Professional tone

Generate only the summary text, no additional formatting or explanations.`;
  }

  private createExperiencePrompt(context: any): string {
    const { company, position, dreamJob, responsibilities, achievements } = context;

    return `Create professional bullet points for a work experience entry:

Position: ${position}
Company: ${company}
Target Role: ${dreamJob}
Current Responsibilities: ${responsibilities || 'Not specified'}
Achievements: ${achievements || 'Not specified'}

Requirements:
- Generate 3-4 bullet points
- Start each with strong action verbs
- Include quantifiable results where possible
- Align with skills needed for ${dreamJob}
- Use past tense for completed roles
- Professional and concise
- ATS-friendly language

Generate only the bullet points, one per line, starting with "•".`;
  }

  private createProjectPrompt(context: any): string {
    const { projectName, technologies, dreamJob, description, impact } = context;

    return `Create a professional project description for a resume:

Project: ${projectName}
Technologies Used: ${technologies || 'Not specified'}
Target Role: ${dreamJob}
Basic Description: ${description || 'Not specified'}
Impact/Results: ${impact || 'Not specified'}

Requirements:
- Generate 2-3 bullet points describing the project
- Highlight technical skills relevant to ${dreamJob}
- Include technologies and methodologies used
- Show impact and results achieved
- Use action verbs and technical terminology
- Professional and concise
- ATS-friendly

Generate only the bullet points, one per line, starting with "•".`;
  }

  private createSkillsPrompt(context: any): string {
    const { dreamJob, currentSkills, experienceLevel } = context;

    return `Suggest relevant skills for a ${dreamJob} position:

Current Skills: ${currentSkills?.join(', ') || 'Not specified'}
Experience Level: ${experienceLevel || 'Entry level'}
Target Role: ${dreamJob}

Requirements:
- List 8-12 relevant technical and soft skills
- Prioritize skills most important for ${dreamJob}
- Include both technical and soft skills
- Use industry-standard terminology
- Separate by commas
- No explanations, just the skill names

Generate only the skills list, separated by commas.`;
  }

  private createEducationPrompt(context: any): string {
    const { degree, institution, dreamJob, gpa, relevantCourses } = context;

    return `Enhance education section for a resume:

Degree: ${degree}
Institution: ${institution}
Target Role: ${dreamJob}
GPA: ${gpa || 'Not specified'}
Relevant Courses: ${relevantCourses || 'Not specified'}

Requirements:
- Suggest 2-3 relevant coursework or achievements
- Align with ${dreamJob} requirements
- Include academic projects if relevant
- Mention honors, awards, or high GPA if applicable
- Professional and concise
- Focus on relevance to target role

Generate only the additional details, one per line, starting with "•".`;
  }

  private createCertificationPrompt(context: any): string {
    const { certificationName, issuer, dreamJob, skills } = context;

    return `Create a professional certification description:

Certification: ${certificationName}
Issuer: ${issuer}
Target Role: ${dreamJob}
Skills Gained: ${skills || 'Not specified'}

Requirements:
- Write a brief 1-2 sentence description
- Highlight relevance to ${dreamJob}
- Mention key skills or knowledge gained
- Professional tone
- Concise and impactful

Generate only the description text, no additional formatting.`;
  }
}

export const geminiService = new GeminiService();
