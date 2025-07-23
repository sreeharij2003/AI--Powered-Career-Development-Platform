import { spawn } from 'child_process';
import { Request, Response } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

interface CoverLetterRequest {
  resumeText: string;
  jobDescription: string;
}

interface CoverLetterResponse {
  success: boolean;
  coverLetter?: string;
  error?: string;
  message?: string;
}

/**
 * Generate cover letter using GPT-2 LoRA fine-tuned model
 * Handles both file upload and direct text input
 */
export const generateCoverLetter = async (req: Request, res: Response) => {
  try {
    console.log(' Starting cover letter generation...');

    let resumeText = '';
    let jobDescription = '';

    // Check if this is a file upload (FormData) or JSON request
    if (req.file) {
      // File upload case
      console.log('📁 Processing uploaded file:', req.file.originalname);

      jobDescription = req.body.jobDescription;

      if (!jobDescription) {
        return res.status(400).json({
          success: false,
          error: 'Job description is required',
          coverLetter: ''
        });
      }

      // Extract text from uploaded file
      try {
        console.log('📁 File details:', {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
          exists: fs.existsSync(req.file.path)
        });

        resumeText = await extractTextFromResume(req.file);
        console.log('📄 Text extracted from file, length:', resumeText.length);

        // Clean up uploaded file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (extractError: any) {
        console.error('❌ Error extracting text from file:', extractError);
        console.error('❌ Full error details:', extractError.stack);

        // Clean up uploaded file even on error
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(400).json({
          success: false,
          error: `Failed to extract text from resume file: ${extractError.message}`,
          coverLetter: ''
        });
      }
    } else {
      // JSON request case (direct text input)
      const requestData: CoverLetterRequest = req.body;
      resumeText = requestData.resumeText;
      jobDescription = requestData.jobDescription;
    }

    // Validate extracted/provided data
    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        error: 'Both resume text and job description are required',
        coverLetter: ''
      });
    }

    if (resumeText.trim().length === 0 || jobDescription.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Resume text and job description cannot be empty',
        coverLetter: ''
      });
    }

    console.log('📝 Input validation passed');
    console.log(`Resume length: ${resumeText.length} characters`);
    console.log(`Job description length: ${jobDescription.length} characters`);

    // Check if model path exists
    const modelPath = process.env.GPT2_MODEL_PATH;
    if (!modelPath) {
      return res.status(500).json({
        success: false,
        error: 'GPT2_MODEL_PATH environment variable not configured',
        coverLetter: ''
      });
    }

    if (!fs.existsSync(modelPath)) {
      return res.status(500).json({
        success: false,
        error: `Model path does not exist: ${modelPath}`,
        coverLetter: ''
      });
    }

    console.log(`🔍 Model path verified: ${modelPath}`);

    // Path to Python script
    const scriptPath = path.join(__dirname, '..', 'scripts', 'generateCoverLetter.py');

    if (!fs.existsSync(scriptPath)) {
      return res.status(500).json({
        success: false,
        error: 'Cover letter generation script not found',
        coverLetter: ''
      });
    }

    console.log(`🐍 Python script path: ${scriptPath}`);

    // Call Python script
    const result = await callPythonScript(scriptPath, resumeText, jobDescription);

    console.log('✅ Cover letter generation completed');
    res.json(result);

  } catch (error: any) {
    console.error('❌ Error in generateCoverLetter:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate cover letter',
      coverLetter: ''
    });
  }
};

/**
 * Call Python script to generate cover letter
 */
function callPythonScript(scriptPath: string, resumeText: string, jobDescription: string): Promise<CoverLetterResponse> {
  return new Promise((resolve, reject) => {
    console.log('🚀 Spawning Python process...');

    // Spawn Python process
    const pythonProcess = spawn('python', [scriptPath, resumeText, jobDescription], {
      env: { ...process.env }, // Pass all environment variables including GPT2_MODEL_PATH
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    // Collect stdout data
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    // Collect stderr data (for logging)
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      console.log('Python stderr:', data.toString());
    });

    // Handle process completion
    pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code: ${code}`);

      if (stderr) {
        console.log('Python stderr output:', stderr);
      }

      try {
        // Parse JSON response from Python script
        const response: CoverLetterResponse = JSON.parse(stdout);

        if (response.success) {
          console.log('✅ Cover letter generated successfully');
          resolve(response);
        } else {
          console.log('❌ Python script returned error:', response.error);
          resolve(response); // Still resolve, but with error in response
        }
      } catch (parseError) {
        console.error('❌ Failed to parse Python script output:', parseError);
        console.error('Raw stdout:', stdout);

        reject({
          success: false,
          error: 'Failed to parse cover letter generation response',
          coverLetter: ''
        });
      }
    });

    // Handle process errors
    pythonProcess.on('error', (error) => {
      console.error('❌ Python process error:', error);
      reject({
        success: false,
        error: `Python process failed: ${error.message}`,
        coverLetter: ''
      });
    });

    // Set timeout (5 minutes)
    setTimeout(() => {
      pythonProcess.kill();
      reject({
        success: false,
        error: 'Cover letter generation timed out',
        coverLetter: ''
      });
    }, 300000); // 5 minutes timeout
  });
}

/**
 * Test file extraction endpoint for debugging
 */
export const testFileExtraction = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    console.log('🧪 Testing file extraction...');
    console.log('📁 File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      exists: fs.existsSync(req.file.path)
    });

    const extractedText = await extractTextFromResume(req.file);

    // Clean up uploaded file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.json({
      success: true,
      fileInfo: {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      },
      extractedText: extractedText,
      textLength: extractedText.length,
      preview: extractedText.substring(0, 200) + '...'
    });

  } catch (error: any) {
    console.error('❌ Test extraction error:', error);

    // Clean up uploaded file even on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};

/**
 * Health check endpoint for cover letter service
 */
export const checkCoverLetterHealth = async (req: Request, res: Response) => {
  try {
    const modelPath = process.env.GPT2_MODEL_PATH;
    const scriptPath = path.join(__dirname, '..', 'scripts', 'generateCoverLetter.py');

    console.log('🔍 Health check - Environment variables:');
    console.log('GPT2_MODEL_PATH:', modelPath);
    console.log('Model path exists:', modelPath ? fs.existsSync(modelPath) : false);

    const health = {
      modelPathConfigured: !!modelPath,
      modelPathValue: modelPath || 'NOT_SET',
      modelPathExists: modelPath ? fs.existsSync(modelPath) : false,
      scriptExists: fs.existsSync(scriptPath),
      scriptPath: scriptPath,
      pythonAvailable: true // We'll assume Python is available
    };

    const isHealthy = health.modelPathConfigured && health.modelPathExists && health.scriptExists;

    res.json({
      success: true,
      healthy: isHealthy,
      details: health,
      message: isHealthy ? 'Cover letter service is healthy' : 'Cover letter service has issues',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      healthy: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
