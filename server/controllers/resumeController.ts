import { spawn } from 'child_process';
import crypto from 'crypto';
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path'; // Import the 'path' module to help resolve paths
import { handleError } from '../utils/errorHandler';

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
  console.log("Body:", req.body);
  
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Generate a unique filename
    const fileId = crypto.randomBytes(16).toString('hex');
    
    // For simplicity, let's create a mock file to test the frontend
    const mockFilePath = path.join(uploadsDir, `${fileId}.pdf`);
    fs.writeFileSync(mockFilePath, "Mock resume content");
    
    console.log(`Mock file created at ${mockFilePath}`);
    
    // Return success response with mock data
    return res.status(200).json({ 
      message: 'Resume uploaded successfully',
      id: fileId,
      fileName: 'uploaded-resume.pdf',
      fileUrl: `/uploads/${fileId}.pdf`,
      uploadDate: new Date().toISOString(),
      skills: ["JavaScript", "React", "Node.js", "TypeScript", "Express"],
      summary: "Experienced software developer with 5+ years of experience in web development...",
      headline: "Senior Software Engineer"
    });
  } catch (error: any) {
    console.error('Error in uploadResumeAndExtractSkills:', error);
    handleError(res, error, 'Failed to upload resume and extract skills');
  }
};

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