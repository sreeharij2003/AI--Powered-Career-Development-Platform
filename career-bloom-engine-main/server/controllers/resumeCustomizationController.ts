import { Request, Response } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { GeminiService } from '../src/services/geminiService';
import { generateTemplatedResumePDF } from '../utils/documentGenerator';
import { extractTextFromResume } from '../utils/resumeParser';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/resume-customization');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const geminiService = new GeminiService();

// Parse resume structure from extracted text
const parseResumeStructure = (extractedText: string): any => {
  console.log('🔍 DEBUGGING: Full extracted text:');
  console.log('='.repeat(50));
  console.log(extractedText);
  console.log('='.repeat(50));

  const lines = extractedText.split('\n').filter(line => line.trim());

  const resume: any = {
    contact: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      linkedin: '',
      address: ''
    },
    summary: '',
    experience: [] as any[],
    education: [] as any[],
    skills: [] as any[],
    projects: [] as any[],
    certifications: [] as any[],
    languages: [] as any[],
    interests: [] as any[]
  };

  // Extract email
  const emailMatch = extractedText.match(/[\w\.-]+@[\w\.-]+\.\w+/);
  if (emailMatch) {
    resume.contact.email = emailMatch[0];
  }

  // Extract phone
  const phoneMatch = extractedText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) {
    resume.contact.phone = phoneMatch[0];
  }

  // Extract LinkedIn
  const linkedinMatch = extractedText.match(/linkedin\.com\/in\/[\w-]+/);
  if (linkedinMatch) {
    resume.contact.linkedin = `https://${linkedinMatch[0]}`;
  }

  // Extract name - look for patterns like "SREEHARI J" or "John Doe"
  const namePatterns = [
    /^([A-Z]+\s+[A-Z]+)/m,  // All caps like "SREEHARI J"
    /^([A-Z][a-z]+\s+[A-Z][a-z]*)/m,  // Title case like "John Doe"
    /([A-Z]+\s+[A-Z]+).*Kottayam/i,  // Name before location
    /([A-Z][a-z]+\s+[A-Z][a-z]*)\s*\n.*email/i  // Name before email line
  ];

  for (const pattern of namePatterns) {
    const nameMatch = extractedText.match(pattern);
    if (nameMatch && nameMatch[1] && !nameMatch[1].includes('Computer') && !nameMatch[1].includes('Science')) {
      const nameParts = nameMatch[1].trim().split(/\s+/);
      resume.contact.firstName = nameParts[0] || '';
      resume.contact.lastName = nameParts.slice(1).join(' ') || '';
      break;
    }
  }

  // Extract summary/objective - look for PROFESSIONAL SUMMARY specifically
  const summaryPatterns = [
    /PROFESSIONAL SUMMARY\s*\n([\s\S]*?)(?=\n[A-Z\s]{3,}|$)/i,
    /(?:SUMMARY|OBJECTIVE|PROFILE)\s*\n([\s\S]*?)(?=\n[A-Z\s]{3,}|$)/i
  ];

  for (const pattern of summaryPatterns) {
    const summaryMatch = extractedText.match(pattern);
    if (summaryMatch && summaryMatch[1]) {
      resume.summary = summaryMatch[1].trim();
      console.log('✅ Found summary:', resume.summary.substring(0, 100) + '...');
      break;
    }
  }

  // Extract skills - look for CORE COMPETENCIES specifically
  const skillsPatterns = [
    /CORE COMPETENCIES\s*\n([\s\S]*?)(?=\n[A-Z\s]{3,}|$)/i,
    /(?:SKILLS|TECHNICAL SKILLS|COMPETENCIES)\s*\n([\s\S]*?)(?=\n[A-Z\s]{3,}|$)/i
  ];

  for (const pattern of skillsPatterns) {
    const skillsMatch = extractedText.match(pattern);
    if (skillsMatch && skillsMatch[1]) {
      const skillsText = skillsMatch[1].trim();
      // Split by bullet points, commas, or line breaks
      const skillsList = skillsText.split(/[,\n•·-]/).map(skill => skill.trim()).filter(skill => skill && skill.length > 1);
      resume.skills = skillsList.map((skill, index) => ({
        id: `skill-${index}`,
        name: skill,
        category: 'Technical',
        proficiency: 'intermediate'
      }));
      console.log('✅ Found skills:', skillsList.join(', '));
      break;
    }
  }

  // Extract experience (look for experience section)
  const experienceMatch = extractedText.match(/(?:EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT)[\s\S]*?(?=\n[A-Z]{2,}|\n\n|$)/i);
  if (experienceMatch) {
    const experienceText = experienceMatch[0].replace(/^(EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT)/i, '').trim();
    // Simple parsing - in a real implementation, you'd want more sophisticated parsing
    const experienceEntries = experienceText.split(/\n(?=[A-Z])/);
    resume.experience = experienceEntries.map((entry, index) => ({
      id: `exp-${index}`,
      title: entry.split('\n')[0] || '',
      company: '',
      duration: '',
      responsibilities: entry,
      location: '',
      achievements: ''
    }));
  }

  // Extract education - preserve your actual education details
  const educationMatch = extractedText.match(/(?:EDUCATION|ACADEMIC BACKGROUND)[\s\S]*?(?=\n[A-Z]{2,}|\n\n|$)/i);
  if (educationMatch) {
    const educationText = educationMatch[0].replace(/^(EDUCATION|ACADEMIC BACKGROUND)/i, '').trim();

    // Look for B.Tech
    const btechMatch = educationText.match(/Computer Science.*Engineering.*B\.?Tech.*Amrita.*Vishwa.*Vidyapeetham.*Vallikavu.*Kollam.*(2022-26|2022.*26).*(8\.35\/10|8\.35)/i);
    if (btechMatch) {
      resume.education.push({
        id: 'edu-1',
        degree: 'Computer Science & Engineering | B.Tech',
        major: 'Computer Science & Engineering',
        institution: 'Amrita Vishwa Vidyapeetham, Vallikavu, Kollam',
        year: '2022-26',
        gpa: '8.35/10',
        details: ''
      });
    }

    // Look for XII
    const xiMatch = educationText.match(/Senior Secondary.*XII.*Jawahar.*Navodaya.*Vidyalaya.*Kottayam.*(2019.*21|2019-21).*(94\.20|94\.2)/i);
    if (xiMatch) {
      resume.education.push({
        id: 'edu-2',
        degree: 'Senior Secondary (XII)',
        major: '',
        institution: 'Jawahar Navodaya Vidyalaya, Kottayam',
        year: '2019 - 21',
        gpa: '94.20%',
        details: ''
      });
    }

    // Fallback if specific patterns don't match
    if (resume.education.length === 0) {
      resume.education = [{
        id: 'edu-1',
        degree: educationText.split('\n')[0] || '',
        major: '',
        institution: '',
        year: '',
        gpa: '',
        details: educationText
      }];
    }
  }

  // Extract projects - look for KEY PROJECTS specifically
  const projectsPatterns = [
    /KEY PROJECTS\s*\n([\s\S]*?)(?=\n[A-Z\s]{3,}|$)/i,
    /(?:PROJECTS|PERSONAL PROJECTS|PROJECT EXPERIENCE)\s*\n([\s\S]*?)(?=\n[A-Z\s]{3,}|$)/i
  ];

  for (const pattern of projectsPatterns) {
    const projectsMatch = extractedText.match(pattern);
    if (projectsMatch && projectsMatch[1]) {
      const projectsText = projectsMatch[1].trim();

      // For your resume, the projects section contains a description, not individual projects
      // So we'll create one project entry with the full description
      if (projectsText.length > 10) {
        resume.projects = [{
          id: 'proj-1',
          title: 'Web Development Projects',
          description: projectsText,
          technologies: '',
          duration: '',
          link: ''
        }];
        console.log('✅ Found projects section:', projectsText.substring(0, 100) + '...');
      }
      break;
    }
  }

  return resume;
};

// Main resume customization endpoint
export const customizeResumeForJob = async (req: Request, res: Response) => {
  try {
    console.log('🎯 Starting resume customization process...');
    
    // Handle file upload
    upload.single('resume')(req, res, async (err) => {
      if (err) {
        console.error('File upload error:', err);
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }

      const { jobDescription, template = 'template1' } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'Resume file is required'
        });
      }

      if (!jobDescription) {
        return res.status(400).json({
          success: false,
          error: 'Job description is required'
        });
      }

      try {
        // Step 1: Extract text from uploaded resume
        console.log('📄 Extracting text from resume...');
        const extractedText = await extractTextFromResume(file.path);

        if (!extractedText || extractedText.trim().length < 50) {
          console.error('❌ Failed to extract meaningful text from resume');
          throw new Error('Failed to extract text from resume. Please ensure the PDF is not corrupted and contains readable text.');
        }

        console.log('✅ Successfully extracted text:', extractedText.length, 'characters');

        // Step 2: Parse resume structure
        console.log('🔍 Parsing resume structure...');
        const resumeData = parseResumeStructure(extractedText);

        // Step 3: Customize resume using advanced prompting strategies
        console.log('🤖 Customizing resume with AI...');
        const customizationResult = await geminiService.customizeResumeForJob(resumeData, jobDescription);

        if (!customizationResult.success) {
          console.error('❌ AI customization failed:', customizationResult);
          throw new Error('Failed to customize resume with AI');
        }

        console.log('✅ AI customization completed successfully');

        // Step 4: Generate PDF with customized content
        console.log('📋 Generating customized resume PDF...');
        const customizedResume = customizationResult.customizedResume;
        
        // Clean up uploaded file
        fs.unlinkSync(file.path);

        // Return the customized resume data
        res.json({
          success: true,
          data: {
            originalResume: resumeData,
            customizedResume: customizedResume,
            template: template,
            analysisResult: customizationResult.analysisResult,
            customizationPlan: customizationResult.customizationPlan,
            extractedText: extractedText.substring(0, 500) + '...' // First 500 chars for reference
          }
        });

      } catch (processingError: any) {
        console.error('❌ Error processing resume:', processingError);

        // Clean up uploaded file if it exists
        if (file && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        // Provide specific error messages based on the error type
        let userFriendlyError = 'Failed to process and customize resume';

        if (processingError.message.includes('PDF')) {
          userFriendlyError = processingError.message;
        } else if (processingError.message.includes('extract text')) {
          userFriendlyError = 'Unable to extract text from the uploaded file. Please ensure it contains readable text content.';
        } else if (processingError.message.includes('AI customization')) {
          userFriendlyError = 'AI customization service is temporarily unavailable. Please try again later.';
        } else if (processingError.message.includes('Gemini')) {
          userFriendlyError = 'AI service error. Please try again with a shorter job description or simpler resume format.';
        }

        res.status(500).json({
          success: false,
          error: userFriendlyError,
          details: processingError.message
        });
      }
    });

  } catch (error: any) {
    console.error('Resume customization error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};

// Simplified resume customizer - only modify summary and add missing skills
export const customizeResumeFromText = async (req: Request, res: Response) => {
  try {
    console.log('🎯 Starting simplified resume customization...');

    const { resumeText, jobDescription } = req.body;

    // Validate input
    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Resume text is required'
      });
    }

    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Job description is required'
      });
    }

    console.log('📝 Resume text length:', resumeText.length, 'characters');
    console.log('📋 Job description length:', jobDescription.length, 'characters');

    // Step 1: Generate new summary using direct Gemini API call
    console.log('🤖 Generating new summary...');
    let newSummary = '';
    let missingSkills = '';

    try {
      // Use direct Gemini API call
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Generate new summary
      const summaryPrompt = `Based on this job description: "${jobDescription}"

Create a professional summary (2-3 sentences) that highlights relevant experience and skills for this specific role.
Make it ATS-friendly and tailored to the job requirements.

Return only the summary text, nothing else.`;

      const summaryResult = await model.generateContent(summaryPrompt);
      const summaryResponse = await summaryResult.response;
      newSummary = summaryResponse.text().trim();

      console.log('✅ Summary generated successfully');

      // Step 2: Extract missing skills
      console.log('🔍 Analyzing missing skills...');
      const skillsPrompt = `Job Description: "${jobDescription}"
Current Resume: "${resumeText}"

Analyze the job requirements and identify 3-5 relevant technical skills that are mentioned in the job description but missing from the resume.
Only include skills that are actually required for the job and would be realistic to add.

Return only the skills as a comma-separated list, nothing else.
Example: React.js, Node.js, AWS, Docker`;

      const skillsResult = await model.generateContent(skillsPrompt);
      const skillsResponse = await skillsResult.response;
      missingSkills = skillsResponse.text().trim();

      console.log('✅ Skills analysis completed');

    } catch (aiError) {
      console.error('❌ AI generation failed:', aiError);

      // Fallback to simple text-based analysis
      console.log('🔄 Using fallback analysis...');

      // Simple fallback summary
      newSummary = `Experienced professional with relevant skills and background suitable for this role. Proven track record of delivering results and contributing to team success. Ready to apply expertise and drive innovation in a dynamic environment.`;

      // Simple fallback skills extraction
      const commonSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git', 'AWS', 'Docker'];
      const jobLower = jobDescription.toLowerCase();
      const resumeLower = resumeText.toLowerCase();

      const foundSkills = commonSkills.filter(skill =>
        jobLower.includes(skill.toLowerCase()) &&
        !resumeLower.includes(skill.toLowerCase())
      ).slice(0, 3);

      missingSkills = foundSkills.join(', ');
    }

    // Step 3: Modify the resume text - keep ALL original content, just replace summary and add skills
    console.log('✏️ Modifying resume text...');
    let customizedResume = resumeText;

    // Replace summary section (find and replace, keeping all other content)
    const summaryPatterns = [
      /PROFILE[\s\S]*?(?=\n\n[A-Z][A-Z\s]*[A-Z])/i,
      /PROFESSIONAL SUMMARY[\s\S]*?(?=\n\n[A-Z][A-Z\s]*[A-Z])/i,
      /SUMMARY[\s\S]*?(?=\n\n[A-Z][A-Z\s]*[A-Z])/i,
      /OBJECTIVE[\s\S]*?(?=\n\n[A-Z][A-Z\s]*[A-Z])/i
    ];

    let summaryReplaced = false;
    for (const pattern of summaryPatterns) {
      if (pattern.test(customizedResume)) {
        customizedResume = customizedResume.replace(pattern, `PROFESSIONAL SUMMARY\n${newSummary.trim()}\n\n`);
        summaryReplaced = true;
        console.log('✅ Summary section replaced');
        break;
      }
    }

    // If no summary section found, add one after contact info but before first major section
    if (!summaryReplaced) {
      const lines = customizedResume.split('\n');
      let insertIndex = 0;

      // Find where to insert summary (after contact info, before first major section)
      for (let i = 0; i < lines.length; i++) {
        // Skip empty lines and contact info
        if (lines[i].trim() === '' ||
            lines[i].includes('@') ||
            lines[i].includes('linkedin') ||
            lines[i].includes('+') ||
            lines[i].includes('phone') ||
            lines[i].includes('email')) {
          insertIndex = i + 1;
          continue;
        }

        // Stop when we find a major section header (all caps, 3+ letters)
        if (lines[i].match(/^[A-Z][A-Z\s]*[A-Z]$/) && lines[i].length >= 3) {
          insertIndex = i;
          break;
        }
      }

      lines.splice(insertIndex, 0, '', 'PROFESSIONAL SUMMARY', newSummary.trim(), '');
      customizedResume = lines.join('\n');
      console.log('✅ Summary section added at line', insertIndex);
    }

    // Add missing skills to existing skills section (only if not already present)
    if (missingSkills.trim()) {
      const skillsToAdd = missingSkills.split(',').map(s => s.trim()).filter(s => s);
      console.log('🔧 Skills to potentially add:', skillsToAdd);

      // Find skills section
      const skillsPattern = /(SKILLS|TECHNICAL SKILLS|CORE COMPETENCIES)[\s\S]*?(?=\n\n[A-Z][A-Z\s]*[A-Z]|$)/i;

      if (skillsPattern.test(customizedResume)) {
        customizedResume = customizedResume.replace(skillsPattern, (match: string) => {
          const existingSkillsText = match.toLowerCase();

          // Only add skills that are not already mentioned in the skills section
          const newSkills = skillsToAdd.filter(skill =>
            !existingSkillsText.includes(skill.toLowerCase())
          );

          if (newSkills.length > 0) {
            console.log('✅ Adding new skills:', newSkills);
            const trimmedMatch = match.trim();
            return trimmedMatch + ' • ' + newSkills.join(' • ') + '\n\n';
          } else {
            console.log('ℹ️ All skills already present in resume');
            return match;
          }
        });
      } else {
        // Add skills section if not found
        customizedResume += '\n\nSKILLS\n• ' + skillsToAdd.join(' • ') + '\n';
        console.log('✅ Skills section created with:', skillsToAdd);
      }
    }

    console.log('✅ Resume customization completed');
    console.log('📊 Original resume length:', resumeText.length);
    console.log('📊 Customized resume length:', customizedResume.length);
    console.log('📝 New summary preview:', newSummary.substring(0, 100) + '...');
    console.log('🔧 Skills to add:', missingSkills);

    // Return the customized resume as text
    res.json({
      success: true,
      data: {
        originalResume: resumeText,
        customizedResume: customizedResume,
        newSummary: newSummary.trim(),
        addedSkills: missingSkills.trim() ? missingSkills.split(',').map(s => s.trim()) : []
      }
    });

  } catch (error: any) {
    console.error('❌ Error customizing resume:', error);
    console.error('Error stack:', error.stack);

    // Provide more specific error messages
    let userMessage = 'Failed to customize resume. Please try again.';

    if (error.message?.includes('API key')) {
      userMessage = 'AI service configuration error. Please contact support.';
    } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
      userMessage = 'AI service temporarily unavailable due to usage limits. Please try again later.';
    } else if (error.message?.includes('network') || error.message?.includes('timeout')) {
      userMessage = 'Network error. Please check your connection and try again.';
    }

    res.status(500).json({
      success: false,
      error: userMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Generate PDF from customized resume data
export const generateCustomizedResumePDF = async (req: Request, res: Response) => {
  try {
    console.log('📋 Starting PDF generation...');
    const { resumeData, template = 'template1' } = req.body;

    if (!resumeData) {
      console.error('❌ No resume data provided');
      return res.status(400).json({
        success: false,
        error: 'Resume data is required'
      });
    }

    console.log('📄 Resume data received:', JSON.stringify(resumeData, null, 2));
    console.log('🎨 Template:', template);

    // Generate PDF using templated approach
    console.log('🔧 Generating PDF with template...');
    const pdfBuffer = await generateTemplatedResumePDF(resumeData, template);
    console.log('✅ PDF generated successfully, size:', pdfBuffer.length, 'bytes');

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="customized-resume.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);

  } catch (error: any) {
    console.error('❌ PDF generation error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to generate PDF',
      details: error.message
    });
  }
};

// Health check endpoint
export const checkResumeCustomizationHealth = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      message: 'Resume customization service is healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Service health check failed',
      details: error.message
    });
  }
};
