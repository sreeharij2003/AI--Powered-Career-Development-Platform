import crypto from 'crypto';
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import jobRecommendationService from '../jobRecommendations/jobRecommendationService';
import { handleError } from '../utils/errorHandler';
import { extractTextFromResume } from '../utils/resumeParser';

// Custom interface for request with file
interface RequestWithFile extends Request {
  file?: any;
}

/**
 * Add jobs to the job recommendation vector store
 */
export const addJobsToVectorStore = async (req: Request, res: Response) => {
  try {
    const { jobs } = req.body;
    
    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return res.status(400).json({ error: 'No jobs provided or invalid format' });
    }
    
    const result = await jobRecommendationService.addJobs(jobs);
    
    if (result) {
      return res.status(200).json({ 
        success: true, 
        message: `Successfully added ${jobs.length} jobs to the recommendation system` 
      });
    } else {
      return res.status(500).json({ error: 'Failed to add jobs to recommendation system' });
    }
  } catch (error: any) {
    console.error('Error in addJobsToVectorStore:', error);
    handleError(res, error, 'Failed to add jobs to recommendation system');
  }
};

/**
 * Get job recommendations based on resume file
 */
export const getRecommendationsFromResumeFile = async (req: Request, res: Response) => {
  try {
    // Check if the request contains form data
    if (!req.headers['content-type']?.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Request must be multipart/form-data' });
    }
    
    // Get the raw data from the request
    let data = Buffer.alloc(0);
    
    req.on('data', (chunk) => {
      data = Buffer.concat([data, chunk]);
    });
    
    req.on('end', async () => {
      try {
        // Parse the multipart form data
        const boundary = getBoundary(req.headers['content-type'] || '');
        if (!boundary) {
          return res.status(400).json({ error: 'Invalid multipart/form-data boundary' });
        }
        
        // Extract file data from the multipart form
        const parts = parseMultipartForm(data, boundary);
        const filePart = parts.find(part => part.name === 'resume');
        
        if (!filePart || !filePart.filename) {
          return res.status(400).json({ error: 'No resume file uploaded' });
        }
        
        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        // Generate a unique filename
        const fileId = crypto.randomBytes(16).toString('hex');
        const fileExtension = path.extname(filePart.filename);
        const fileName = `${fileId}${fileExtension}`;
        const filePath = path.join(uploadsDir, fileName);
        
        // Save the file
        fs.writeFileSync(filePath, filePart.data);
        
        console.log(`Resume file saved to ${filePath}`);
        
        // Extract text from resume
        const resumeText = await extractTextFromResume(filePath);
        console.log(`Extracted ${resumeText.length} characters from resume`);
        
        // Extract skills from resume text
        const skills = extractSkillsFromText(resumeText);
        console.log(`Extracted skills from resume: ${skills.join(', ')}`);
        
        // Get limit from query params or use default
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
        
        // Get actual recommendations based on resume text
        const recommendations = await jobRecommendationService.getRecommendedJobs(resumeText, limit);
        console.log(`Found ${recommendations.length} job recommendations`);
        
        // Log detailed information about the recommendations
        console.log('Job recommendation details:');
        recommendations.forEach((job, index) => {
          console.log(`Job ${index + 1}:`);
          console.log(`- ID: ${job._id || job.id || 'undefined'}`);
          console.log(`- Title: ${job.title || 'undefined'}`);
          console.log(`- Company: ${job.company || 'undefined'}`);
          console.log(`- Location: ${job.location || 'undefined'}`);
          console.log(`- Description: ${job.description ? job.description.substring(0, 50) + '...' : 'undefined'}`);
          console.log(`- Skills: ${job.skills ? job.skills.join(', ') : 'undefined'}`);
          console.log(`- Match Score: ${job.match || Math.round(job.score * 100) || 'undefined'}`);
        });
        
        // Format the recommendations to match the expected structure
        const formattedRecommendations = recommendations.map(job => {
          // Create a properly formatted job object with all required fields
          const formattedJob = {
            id: job._id || job.id || `job-${Math.random().toString(36).substring(2, 9)}`,
            title: job.title || 'Job Title',
            company: job.company || 'Company',
            location: job.location || 'Location',
            description: job.description || 'No description available',
            salary: job.salary || 'Competitive',
            url: job.url || '#',
            skills: job.skills || [],
            posted_date: job.posted_date || new Date().toISOString(),
            type: job.type || 'Full-time',
            remote: job.remote || false,
            match_score: job.match || Math.round(job.score * 100) || 75
          };
          
          return formattedJob;
        });
        
        // Log the formatted recommendations
        console.log('Formatted recommendations:');
        console.log(JSON.stringify(formattedRecommendations, null, 2));
        
        // Clean up the temporary file
        fs.unlinkSync(filePath);
        
        return res.status(200).json({
          success: true,
          recommendations: formattedRecommendations
        });
      } catch (error: any) {
        console.error('Error processing resume upload:', error);
        res.status(500).json({ error: 'Failed to process resume upload' });
      }
    });
  } catch (error: any) {
    console.error('Error in getRecommendationsFromResumeFile:', error);
    handleError(res, error, 'Failed to get job recommendations from resume');
  }
};

// Helper function to extract skills from text
function extractSkillsFromText(text: string): string[] {
  const commonSkills = [
    "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "Ruby", "PHP", "Swift", "Go",
    "React", "Angular", "Vue", "Node.js", "Express", "Django", "Flask", "Spring", "ASP.NET",
    "MongoDB", "MySQL", "PostgreSQL", "SQL Server", "Oracle", "Redis", "Firebase",
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Git", "GitHub", "GitLab",
    "Agile", "Scrum", "Kanban", "Project Management", "Team Leadership",
    "Machine Learning", "AI", "Data Science", "Big Data", "Data Analysis",
    "UI/UX", "Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator"
  ];
  
  const textLower = text.toLowerCase();
  return commonSkills.filter(skill => 
    textLower.includes(skill.toLowerCase())
  );
}

/**
 * Get job recommendations based on resume text or user ID
 */
export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const { resumeText, userId, limit = 5 } = req.body;
    
    // If neither resumeText nor userId is provided, return error
    if (!resumeText && !userId) {
      return res.status(400).json({ error: 'Either resumeText or userId must be provided' });
    }
    
    let textToUse = resumeText;
    
    // If userId is provided but no resumeText, fetch the user's resume
    if (!resumeText && userId) {
      // TODO: Implement logic to fetch user's resume from database
      // This would depend on how user resumes are stored
      // For now, return error
      return res.status(400).json({ error: 'User resume fetching not implemented yet' });
    }
    
    // Get recommendations
    const recommendations = await jobRecommendationService.getRecommendedJobs(textToUse, limit);
    console.log(`Found ${recommendations.length} job recommendations`);
    
    // Log detailed information about the recommendations
    console.log('Job recommendation details:');
    recommendations.forEach((job, index) => {
      console.log(`Job ${index + 1}:`);
      console.log(`- ID: ${job._id || job.id || 'undefined'}`);
      console.log(`- Title: ${job.title || 'undefined'}`);
      console.log(`- Company: ${job.company || 'undefined'}`);
      console.log(`- Location: ${job.location || 'undefined'}`);
      console.log(`- Description: ${job.description ? job.description.substring(0, 50) + '...' : 'undefined'}`);
      console.log(`- Skills: ${job.skills ? job.skills.join(', ') : 'undefined'}`);
      console.log(`- Match Score: ${job.match || Math.round(job.score * 100) || 'undefined'}`);
    });
    
    // Format the recommendations to match the expected structure
    const formattedRecommendations = recommendations.map(job => {
      // Create a properly formatted job object with all required fields
      const formattedJob = {
        id: job._id || job.id || `job-${Math.random().toString(36).substring(2, 9)}`,
        title: job.title || 'Job Title',
        company: job.company || 'Company',
        location: job.location || 'Location',
        description: job.description || 'No description available',
        salary: job.salary || 'Competitive',
        url: job.url || '#',
        skills: job.skills || [],
        posted_date: job.posted_date || new Date().toISOString(),
        type: job.type || 'Full-time',
        remote: job.remote || false,
        match_score: job.match || Math.round(job.score * 100) || 75
      };
      
      return formattedJob;
    });
    
    // Log the formatted recommendations
    console.log('Formatted recommendations:');
    console.log(JSON.stringify(formattedRecommendations, null, 2));
    
    return res.status(200).json({
      success: true,
      recommendations: formattedRecommendations
    });
  } catch (error: any) {
    console.error('Error in getRecommendations:', error);
    handleError(res, error, 'Failed to get job recommendations');
  }
};

/**
 * Clear the job recommendation vector store
 */
export const clearJobRecommendationStore = async (req: Request, res: Response) => {
  try {
    const result = await jobRecommendationService.clearVectorStore();
    
    if (result) {
      return res.status(200).json({ 
        success: true, 
        message: 'Successfully cleared job recommendation store' 
      });
    } else {
      return res.status(500).json({ error: 'Failed to clear job recommendation store' });
    }
  } catch (error: any) {
    console.error('Error in clearJobRecommendationStore:', error);
    handleError(res, error, 'Failed to clear job recommendation store');
  }
};

// Helper function to get boundary from content-type header
function getBoundary(contentType: string): string | null {
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  return boundaryMatch ? (boundaryMatch[1] || boundaryMatch[2]) : null;
}

// Helper function to parse multipart form data
function parseMultipartForm(buffer: Buffer, boundary: string): Array<{name: string, filename?: string, data: Buffer}> {
  const parts: Array<{name: string, filename?: string, data: Buffer}> = [];
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  
  let startPos = 0;
  let endPos = buffer.indexOf(boundaryBuffer, startPos);
  
  while (endPos !== -1) {
    startPos = endPos + boundaryBuffer.length + 2; // Skip boundary and CRLF
    endPos = buffer.indexOf(boundaryBuffer, startPos);
    
    if (endPos === -1) break;
    
    const partBuffer = buffer.slice(startPos, endPos - 2); // Exclude trailing CRLF
    const headerEndPos = partBuffer.indexOf(Buffer.from('\r\n\r\n'));
    
    if (headerEndPos !== -1) {
      const headerStr = partBuffer.slice(0, headerEndPos).toString();
      const contentDisposition = headerStr.match(/Content-Disposition: form-data; name="([^"]+)"(?:; filename="([^"]+)")?/i);
      
      if (contentDisposition) {
        const name = contentDisposition[1];
        const filename = contentDisposition[2];
        const data = partBuffer.slice(headerEndPos + 4); // Skip double CRLF
        
        parts.push({ name, filename, data });
      }
    }
    
    startPos = endPos;
  }
  
  return parts;
} 