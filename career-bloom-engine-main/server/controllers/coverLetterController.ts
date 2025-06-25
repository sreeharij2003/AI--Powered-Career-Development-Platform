import { spawn } from 'child_process';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import path from 'path';
import UserProfile, { ICoverLetter, IUserProfile } from '../models/UserProfile'; // Import interfaces
import { generateDOCX, generatePDF } from '../utils/documentGenerator';
import { handleError } from '../utils/errorHandler';

// Helper function to run Python script and return output as a Promise
const runPythonScript = (scriptPath: string, inputData: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    const python = spawn('python', [scriptPath]);
    let stdoutBuffer = '';
    let stderrBuffer = '';

    python.stdout.on('data', (data) => {
      const chunk = data.toString();
      stdoutBuffer += chunk;
      console.log('Python stdout data:', chunk); // Log data as it comes
    });

    python.stderr.on('data', (data) => {
      const chunk = data.toString();
      stderrBuffer += chunk;
      console.error('Python stderr data:', chunk); // Log stderr data
    });

    python.on('close', (code) => {
      console.log(`Python script closed with code ${code}`); // Log closure
      console.log('Final Python stdoutBuffer:', stdoutBuffer); // Log final stdout
      console.error('Final Python stderrBuffer:', stderrBuffer); // Log final stderr

      if (code !== 0) {
        const errorDetail = stderrBuffer || `Exited with code ${code}`;
        console.error('Python script execution failed:', errorDetail); // More specific log
        return reject(new Error(`Python script execution failed: ${errorDetail}`));
      }

      if (stderrBuffer) {
           console.warn('Python script had warnings/stderr output:', stderrBuffer);
      }

      try {
        const result = JSON.parse(stdoutBuffer);
        if (result.error) {
          console.error('Python script returned JSON error:', result.error); // Log specific error
          return reject(new Error(result.error));
        } else if (result.coverLetter !== undefined && result.coverLetter !== null && typeof result.coverLetter === 'string') {
          console.log('Python script successfully returned coverLetter.'); // Log success
          return resolve(result.coverLetter);
        } else {
          const errorDetail = 'Python script did not return expected coverLetter JSON output or content type.';
          console.error(`${errorDetail}\nFull stdout: ${stdoutBuffer}`); // Fix console log syntax
          return reject(new Error(errorDetail));
        }
      } catch (e: any) { // Explicitly type catch variable
        const errorDetail = `Failed to parse Python script JSON output: ${e.message}`;;
        console.error(`${errorDetail}\nFull stdout: ${stdoutBuffer}`); // Fix console log syntax
        return reject(new Error(errorDetail));
      }
    });

    python.on('error', (err) => {
      console.error('Failed to spawn Python process:', err); // Log spawn error
      reject(new Error(`Failed to spawn Python process: ${err.message}`));
    });

    python.stdin.write(JSON.stringify(inputData));
    python.stdin.end();
  });
};

// Generate new cover letter
export const generateCoverLetter = async (req: Request, res: Response) => {
  try {
    const { jobDescription, userProfile } = req.body;
    const userId = req.user?.id; // Assuming authentication middleware provides user id

    if (!jobDescription || !userProfile) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const scriptPath = path.join(__dirname, '..', 'scripts', 'cover_letter_generator.py');

    let generatedContent = '';

    try {
      console.log('Attempting to run Python cover letter script...'); // Log before running
      generatedContent = await runPythonScript(scriptPath, { jobDescription, userProfile });
      console.log('Python script ran successfully.'); // Log success after awaiting

    } catch (scriptRunError: any) { // Explicitly type catch variable
      console.error('Caught error from runPythonScript:', scriptRunError); // Log caught error
      handleError(res, scriptRunError, 'Error during cover letter script execution');
      return;
    }

    if (!generatedContent) {
       console.error('generatedContent is empty after script run.'); // Log empty content
       return res.status(500).json({ 
        error: 'No content generated',
        details: 'Python script ran, but returned empty cover letter content.'
      });
    }

    // Save to database
    try {
      const userProfileDoc = await UserProfile.findOne({ userId }) as IUserProfile | null; // Cast to imported interface
      
      if (!userProfileDoc) {
        console.error('User profile not found for authenticated user');
         return res.status(404).json({ error: 'User profile not found' });
      }

      // Ensure generatedContent and coverLetters array exist, initialize if needed
      if (!userProfileDoc.generatedContent) {
          userProfileDoc.generatedContent = { coverLetters: [], resumes: [] };
      }

      // Type guard to ensure coverLetters is an array before pushing
      if (!Array.isArray(userProfileDoc.generatedContent.coverLetters)) {
         userProfileDoc.generatedContent.coverLetters = [];
      }

      userProfileDoc.generatedContent.coverLetters.push({
        title: `Cover Letter for ${jobDescription.company || 'Unknown Company'}`,
        content: generatedContent,
        createdAt: new Date(),
        updatedAt: new Date(),
        jobId: jobDescription.jobId ? new mongoose.Types.ObjectId(jobDescription.jobId) : undefined, // Use ObjectId if jobId exists
        company: jobDescription.company
      } as ICoverLetter); // Explicitly cast to ICoverLetter

      await userProfileDoc.save();

      console.log('Cover letter saved successfully.'); // Log save success
      res.json({
        message: 'Cover letter generated successfully',
        coverLetter: generatedContent
      });

    } catch (dbError: any) { // Explicitly type catch variable
      console.error('Caught database error during save:', dbError); // Log database error
      handleError(res, dbError, 'Failed to save cover letter to database');
    }

  } catch (error: any) { // Explicitly type catch variable
    console.error('Caught initial controller error:', error); // Log initial error
    handleError(res, error, 'Failed in cover letter generation controller (initial setup)');
  }
};

// Get cover letter history
export const getCoverLetterHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userProfile = await UserProfile.findOne({ userId }) as IUserProfile | null; // Cast to imported interface
    
    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Ensure generatedContent and coverLetters array exist and are arrays before returning
    if (!userProfile.generatedContent || !Array.isArray(userProfile.generatedContent.coverLetters)) {
        return res.json([]); // Return empty array if no generated content or not an array
    }

    // Return the cover letters (sorted by creation date, newest first). Ensure createdAt is treated as Date.
    res.json(userProfile.generatedContent.coverLetters.sort((a: ICoverLetter, b: ICoverLetter) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

  } catch (error: any) { // Explicitly type catch variable
    console.error('Caught error fetching cover letter history:', error); // Log history error
    handleError(res, error, 'Failed to fetch cover letter history');
  }
};

// Update cover letter
export const updateCoverLetter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Cover letter ID (string) is required for update.' });
    }

    if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'Valid content field (string) is required for update.' });
    }

    // Find the user and update the specific cover letter
    const result = await UserProfile.findOneAndUpdate(
      { 
        userId,
        'generatedContent.coverLetters': { $exists: true } // Ensure generatedContent exists before searching
      } as any, // Cast to any to bypass strict type checking for nested query
      {
        $set: {
          'generatedContent.coverLetters.$[elem].content': content,
          'generatedContent.coverLetters.$[elem].updatedAt': new Date()
        }
      } as any, // Cast to any
      {
        new: true,
        arrayFilters: [{ 'elem._id': new mongoose.Types.ObjectId(id) }] // Use mongoose.Types.ObjectId for id
      }
    );

    if (!result) {
       const userExists = await UserProfile.findOne({ userId });
       if (!userExists) {
           console.warn(`Update failed: User profile not found for userId: ${userId}`); // Log warning
           return res.status(404).json({ error: 'User profile not found' });
       } else {
           console.warn(`Update failed: Cover letter ${id} not found for user: ${userId}`); // Log warning
           return res.status(404).json({ error: 'Cover letter not found for this user' });
       }
    }

    console.log(`Cover letter ${id} updated successfully for user ${userId}.`); // Log update success
    res.json({ message: 'Cover letter updated successfully' });

  } catch (error: any) { // Explicitly type catch variable
    console.error(`Caught error updating cover letter ${req.params.id ?? 'unknown id'} for user ${req.user?.id ?? 'unknown user'}:`, error); // Log update error with user id
    handleError(res, error, 'Failed to update cover letter');
  }
};

// Delete cover letter
export const deleteCoverLetter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

     if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Cover letter ID (string) is required for deletion.' });
    }

    // Find the user and remove the specific cover letter from the array
    const result = await UserProfile.findOneAndUpdate(
      { userId },
      {
        $pull: {
          'generatedContent.coverLetters': { _id: new mongoose.Types.ObjectId(id) } // Use mongoose.Types.ObjectId for id
        }
      }
    );

    if (!result) {
       const userExists = await UserProfile.findOne({ userId });
       if (!userExists) {
           console.warn(`Delete failed: User profile not found for userId: ${userId}`); // Log warning
           return res.status(404).json({ error: 'User profile not found' });
       } else {
            console.warn(`Delete failed: Cover letter ${id} not found for user: ${userId}`); // Log warning
           return res.status(404).json({ error: 'Cover letter not found for this user' });
       }
    }

    console.log(`Cover letter ${id} deleted successfully for user ${userId}.`); // Log delete success
    res.json({ message: 'Cover letter deleted successfully' });

  } catch (error: any) { // Explicitly type catch variable
    console.error(`Caught error deleting cover letter ${req.params.id ?? 'unknown id'} for user ${req.user?.id ?? 'unknown user'}:`, error); // Log delete error with user id
    handleError(res, error, 'Failed to delete cover letter');
  }
};

// Export cover letter
export const exportCoverLetter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { format } = req.query;
    const userId = req.user?.id;

    if (!id || typeof id !== 'string') {
         return res.status(400).json({ error: 'Cover letter ID (string) is required for export.' });
    }

    if (!format || (format !== 'pdf' && format !== 'docx')) {
        return res.status(400).json({ error: 'Invalid or missing format parameter.' });
    }

    const userProfile = await UserProfile.findOne({ userId }) as IUserProfile | null; // Cast to imported interface
    if (!userProfile) {
      console.warn(`Export failed: User profile not found for userId: ${userId}`); // Log warning
      return res.status(404).json({ error: 'User profile not found' });
    }

    if (!userProfile.generatedContent || !Array.isArray(userProfile.generatedContent.coverLetters)) {
       console.warn(`Export failed: No cover letters found for user: ${userId}`); // Log warning
       return res.status(404).json({ error: 'No cover letters found for this user' });
    }

    const coverLetter = userProfile.generatedContent.coverLetters.find(
      (letter: ICoverLetter) => letter._id && letter._id.toString() === id
    );

    if (!coverLetter) {
      console.warn(`Export failed: Cover letter ${id} not found for user: ${userId}`); // Log warning
      return res.status(404).json({ error: 'Cover letter not found' });
    }

    let fileBuffer;
    let contentType;
    let fileExtension;

    if (coverLetter.content === undefined || coverLetter.content === null || typeof coverLetter.content !== 'string') {
         console.error(`Cover letter ${id} has missing or invalid content.`); // Log missing content
         return res.status(500).json({ error: 'Cover letter content is missing or invalid.' });
    }

    if (format === 'pdf') {
      fileBuffer = await generatePDF(coverLetter.content);
      contentType = 'application/pdf';
      fileExtension = 'pdf';
    } else if (format === 'docx') {
      fileBuffer = await generateDOCX(coverLetter.content);
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      fileExtension = 'docx';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=cover-letter-${coverLetter.title || 'generated'}.${fileExtension}`
    );
    res.send(fileBuffer);

  } catch (error: any) { // Explicitly type catch variable
    console.error(`Caught error exporting cover letter ${req.params.id ?? 'unknown id'} for user ${req.user?.id ?? 'unknown user'}:`, error); // Log export error with user id
    handleError(res, error, 'Failed to export cover letter');
  }
}; 