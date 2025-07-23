import { spawn } from 'child_process';
import crypto from 'crypto';
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path'; // Import the 'path' module to help resolve paths
import { handleError } from '../utils/errorHandler';
import { extractSkillsFromResumeText, extractTextFromResume } from '../utils/resumeParser';

export const customizeResume = async (req: Request, res: Response) => {
  const { jobPost, resume } = req.body;

  // Define the path to the Python script relative to the project root
  // Assuming the Node.js process is started from the project root directory.
  const scriptPath = path.join(__dirname, '../scripts/resume_customizer_script.py');

  console.log(`Debug: Spawning python script at ${scriptPath}`);

  const pythonProcess = spawn('python', [scriptPath]);

  let scriptOutput = '';
  let scriptError = '';

  pythonProcess.stdout.on('data', (data) => {
    scriptOutput += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    // Log stderr from the Python script (useful for debugging model loading errors, etc.)
    scriptError += data.toString();
    console.error(`Python script stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      // Script executed successfully, return its stdout
      try {
         // The Python script should return plain text. Return the raw text output.
         res.json({ customizedResume: scriptOutput.trim() });

      } catch (e) {
         console.error(`Error processing script output: ${e}`);
         res.status(500).json({ error: 'Failed to process script output', scriptOutput: scriptOutput.trim(), scriptError: scriptError.trim() });
      }
    } else {
      // Script exited with an error code, return its output (which might contain error messages) and stderr
      console.error(`Python script process exited with code ${code}`);
      res.status(500).json({ error: 'Python script execution failed', statusCode: code, scriptOutput: scriptOutput.trim(), scriptError: scriptError.trim() });
    }
  });

  pythonProcess.on('error', (err) => {
      // Handle errors like 'command not found' (python executable not in PATH)
      console.error(`Failed to start python process: ${err}`);
      res.status(500).json({ error: `Failed to start Python process: ${err.message}`, scriptError: err.message });
  });

  // Write the input JSON to the Python script's stdin
  pythonProcess.stdin.write(JSON.stringify({ jobPost, resume }));
  pythonProcess.stdin.end(); // Close stdin to signal end of input
};

export const uploadResumeAndExtractSkills = async (req: Request, res: Response) => {
  console.log("=== Resume upload request received ===");
  console.log("URL:", req.originalUrl);
  console.log("Method:", req.method);
  console.log("Content-Type:", req.headers['content-type']);
  console.log("User:", req.user);

  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Handle multipart form data manually
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

        // Generate a unique filename
        const fileId = crypto.randomBytes(16).toString('hex');
        const fileExtension = path.extname(filePart.filename);
        const fileName = `${fileId}${fileExtension}`;
        const filePath = path.join(uploadsDir, fileName);

        // Validate file size
        if (filePart.data.length < 100) {
          console.log(`❌ File too small (${filePart.data.length} bytes), likely invalid`);
          return res.status(400).json({ error: 'Invalid file: file too small' });
        }

        // Save the file
        fs.writeFileSync(filePath, filePart.data);
        console.log(`Resume file saved to ${filePath} (${filePart.data.length} bytes)`);

        // Validate PDF structure for PDF files
        if (fileExtension === '.pdf') {
          const fileHeader = filePart.data.slice(0, 4).toString();
          if (fileHeader !== '%PDF') {
            console.log(`❌ Invalid PDF file header: ${fileHeader}`);
            return res.status(400).json({ error: 'Invalid PDF file format' });
          }
        }

        // Extract text from resume
        const resumeText = await extractTextFromResume(filePath);
        console.log(`Extracted ${resumeText.length} characters from resume`);

        // Validate extracted text
        if (resumeText.length < 50) {
          console.log(`❌ Extracted text too short (${resumeText.length} chars), likely invalid`);
          return res.status(400).json({ error: 'Could not extract meaningful content from resume' });
        }

        // Extract skills from resume text
        const skills = extractSkillsFromResumeText(resumeText);
        console.log(`Extracted skills from resume: ${skills.join(', ')}`);

        // Generate a simple summary from the text
        const summary = generateSummaryFromText(resumeText);
        const headline = generateHeadlineFromText(resumeText);

        // Store the full extracted text in metadata for later retrieval
        const resumeMetaPath = path.join(uploadsDir, 'resumeMeta.json');
        let resumeMeta: any = {};

        if (fs.existsSync(resumeMetaPath)) {
          resumeMeta = JSON.parse(fs.readFileSync(resumeMetaPath, 'utf-8'));
        }

        resumeMeta[userId] = {
          fileId: fileId,
          fileName: fileName,
          fileUrl: `/uploads/${fileName}`,
          uploadDate: new Date().toISOString(),
          skills: skills,
          summary: summary,
          headline: headline,
          extractedText: resumeText // Store full extracted text
        };

        fs.writeFileSync(resumeMetaPath, JSON.stringify(resumeMeta, null, 2));

        // Return success response with extracted data
        return res.status(200).json({
          message: 'Resume uploaded and processed successfully',
          id: fileId,
          fileName: filePart.filename,
          fileUrl: `/uploads/${fileName}`,
          uploadDate: new Date().toISOString(),
          skills: skills,
          summary: summary,
          headline: headline,
          extractedText: resumeText.substring(0, 500) + '...' // First 500 chars for debugging
        });
      } catch (error: any) {
        console.error('Error processing resume:', error);
        return res.status(500).json({ error: 'Failed to process resume file' });
      }
    });

  } catch (error: any) {
    console.error('Error in uploadResumeAndExtractSkills:', error);
    handleError(res, error, 'Failed to upload resume and extract skills');
  }
};



/**
 * Generate a summary from resume text
 */
function generateSummaryFromText(text: string): string {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  // Look for summary section
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('summary') || line.includes('profile') || line.includes('objective')) {
      // Get the next few lines as summary
      const summaryLines = lines.slice(i + 1, i + 4).filter(line =>
        line.length > 20 && !line.toLowerCase().includes('experience') && !line.toLowerCase().includes('education')
      );
      if (summaryLines.length > 0) {
        return summaryLines.join(' ').substring(0, 200) + '...';
      }
    }
  }

  // Fallback: use first meaningful paragraph
  const meaningfulLines = lines.filter(line => line.length > 50);
  if (meaningfulLines.length > 0) {
    return meaningfulLines[0].substring(0, 200) + '...';
  }

  return 'Professional with experience in software development and technology.';
}

/**
 * Generate a headline from resume text
 */
function generateHeadlineFromText(text: string): string {
  const textLower = text.toLowerCase();

  // Common job titles to look for
  const jobTitles = [
    'software engineer', 'software developer', 'full stack developer', 'frontend developer',
    'backend developer', 'web developer', 'mobile developer', 'data scientist', 'data analyst',
    'devops engineer', 'system administrator', 'product manager', 'project manager'
  ];

  for (const title of jobTitles) {
    if (textLower.includes(title)) {
      // Capitalize properly
      return title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  }

  return 'Software Professional';
}

// Helper function to get boundary from content-type header
function getBoundary(contentType: string): string | null {
  console.log(`Parsing boundary from content-type: ${contentType}`);
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  const result = boundaryMatch ? (boundaryMatch[1] || boundaryMatch[2]) : null;
  console.log(`Boundary result: ${result}`);
  return result;
}

// Helper function to parse multipart form data
function parseMultipartForm(buffer: Buffer, boundary: string): Array<{name: string, filename?: string, data: Buffer}> {
  const parts: Array<{name: string, filename?: string, data: Buffer}> = [];
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  
  let startPos = 0;
  let endPos = buffer.indexOf(boundaryBuffer, startPos);
  
  console.log(`Starting multipart parsing with boundary "${boundary}"`);
  console.log(`Buffer size: ${buffer.length}, boundary buffer size: ${boundaryBuffer.length}`);
  
  while (endPos !== -1) {
    startPos = endPos + boundaryBuffer.length + 2; // Skip boundary and CRLF
    endPos = buffer.indexOf(boundaryBuffer, startPos);
    
    if (endPos === -1) break;
    
    console.log(`Found part from ${startPos} to ${endPos}`);
    
    const partBuffer = buffer.slice(startPos, endPos - 2); // Exclude trailing CRLF
    const headerEndPos = partBuffer.indexOf(Buffer.from('\r\n\r\n'));
    
    if (headerEndPos !== -1) {
      const headerStr = partBuffer.slice(0, headerEndPos).toString();
      console.log(`Headers: ${headerStr}`);
      
      const contentDisposition = headerStr.match(/Content-Disposition: form-data; name="([^"]+)"(?:; filename="([^"]+)")?/i);
      
      if (contentDisposition) {
        const name = contentDisposition[1];
        const filename = contentDisposition[2];
        const data = partBuffer.slice(headerEndPos + 4); // Skip double CRLF
        
        console.log(`Found part: name=${name}, filename=${filename || 'none'}, data size=${data.length}`);
        parts.push({ name, filename, data });
      } else {
        console.log(`Could not parse content disposition from: ${headerStr}`);
      }
    } else {
      console.log(`No header end found in part`);
    }
    
    startPos = endPos;
  }
  
  console.log(`Parsed ${parts.length} parts from multipart form data`);
  return parts;
}

// Helper function to extract text from file
async function extractTextFromFile(filePath: string): Promise<string> {
  try {
    // For simplicity, just read the file as text
    // In a production environment, you would use libraries for different file formats
    const content = fs.readFileSync(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return '';
  }
}

// Delete user resume (file and DB record if needed)
export const deleteUserResume = async (req: Request, res: Response) => {
  try {
    // Assume user ID is available on req.user.id (from authenticateUser middleware)
    const userId = req.user?.id || '123456789'; // fallback for mock
    const uploadsDir = path.join(__dirname, '../../uploads');
    const filePath = path.join(uploadsDir, `${userId}.pdf`);

    // Delete the file if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted resume file: ${filePath}`);
    } else {
      console.log(`Resume file not found: ${filePath}`);
    }

    // TODO: Remove DB record if you store resume metadata in DB

    return res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Error deleting user resume:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete resume' });
  }
};

/**
 * Get extracted resume text for chatbot
 */
export const getResumeText = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const resumeMetaPath = path.join(uploadsDir, 'resumeMeta.json');

    if (!fs.existsSync(resumeMetaPath)) {
      return res.status(404).json({ error: 'No resume found' });
    }

    const resumeMeta = JSON.parse(fs.readFileSync(resumeMetaPath, 'utf-8'));
    const userResume = resumeMeta[userId];

    if (!userResume) {
      return res.status(404).json({ error: 'No resume found for user' });
    }

    // If extractedText is missing, extract it now
    if (!userResume.extractedText && userResume.fileName) {
      console.log('📄 Extracting text from existing resume file...');
      try {
        const filePath = path.join(uploadsDir, userResume.fileName);
        if (fs.existsSync(filePath)) {
          // Check file size first
          const stats = fs.statSync(filePath);
          if (stats.size < 100) {
            console.log(`❌ Resume file too small (${stats.size} bytes), likely invalid`);
            return res.status(400).json({
              error: 'Invalid resume file detected. Please upload a valid resume file.',
              suggestion: 'Upload a new resume file to continue.'
            });
          }

          const extractedText = await extractTextFromResume(filePath);

          // Validate extracted text
          if (extractedText.length < 50) {
            console.log(`❌ Extracted text too short (${extractedText.length} chars), likely invalid`);
            return res.status(400).json({
              error: 'Could not extract meaningful content from resume file.',
              suggestion: 'Please upload a new, valid resume file.'
            });
          }

          const skills = extractSkillsFromResumeText(extractedText);
          const summary = generateSummaryFromText(extractedText);
          const headline = generateHeadlineFromText(extractedText);

          // Update metadata with extracted text
          userResume.extractedText = extractedText;
          userResume.skills = skills;
          userResume.summary = summary;
          userResume.headline = headline;

          // Save updated metadata
          fs.writeFileSync(resumeMetaPath, JSON.stringify(resumeMeta, null, 2));
          console.log(`✅ Updated resume metadata with ${extractedText.length} characters of extracted text`);
        }
      } catch (extractError) {
        console.error('❌ Error extracting text from existing file:', extractError);
        return res.status(400).json({
          error: 'Failed to process resume file.',
          suggestion: 'Please upload a new, valid resume file.'
        });
      }
    }

    // Return the extracted text
    res.json({
      success: true,
      extractedText: userResume.extractedText || '',
      fileName: userResume.fileName,
      uploadDate: userResume.uploadDate,
      skills: userResume.skills || [],
      summary: userResume.summary || '',
      headline: userResume.headline || ''
    });
  } catch (error: any) {
    console.error('Error getting resume text:', error);
    handleError(res, error, 'Failed to get resume text');
  }
};