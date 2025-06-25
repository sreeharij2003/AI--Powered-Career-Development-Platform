import { spawn } from 'child_process';
import { Request, Response } from 'express';
import path from 'path';
import { CareerPathResponse } from '../types/career';

// Helper function to run Python script and return output as a Promise
const runPythonScript = (scriptPath: string, inputData: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    const python = spawn('python', [scriptPath]);
    let stdoutBuffer = '';
    let stderrBuffer = '';

    python.stdout.on('data', (data) => {
      const chunk = data.toString();
      stdoutBuffer += chunk;
      console.log('Python stdout data:', chunk);
    });

    python.stderr.on('data', (data) => {
      const chunk = data.toString();
      stderrBuffer += chunk;
      console.error('Python stderr data:', chunk);
    });

    python.on('close', (code) => {
      if (code === 0) {
        resolve(stdoutBuffer);
      } else {
        reject(new Error(`Python script exited with code ${code}: ${stderrBuffer}`));
      }
    });

    python.stdin.write(JSON.stringify(inputData));
    python.stdin.end();
  });
};

export const predictAndPlan = async (req: Request, res: Response) => {
  try {
    const { skills, role } = req.body;

    if (!skills || !Array.isArray(skills) || !role) {
      return res.status(400).json({ error: 'Invalid input. Skills array and role are required.' });
    }

    const scriptPath = path.join(__dirname, '..', 'scripts', 'career_path_predictor.py');

    try {
      console.log('Attempting to run Python career path script...');
      const generatedContent = await runPythonScript(scriptPath, { skills, role });
      console.log('Python script ran successfully.');

      if (!generatedContent) {
        console.error('generatedContent is empty after script run.');
        return res.status(500).json({ 
          error: 'No content generated',
          details: 'Python script ran, but returned empty content.'
        });
      }

      const response: CareerPathResponse = JSON.parse(generatedContent);
      res.json(response);

    } catch (scriptRunError: any) {
      console.error('Caught error from runPythonScript:', scriptRunError);
      return res.status(500).json({ 
        error: 'Error during career path prediction',
        details: scriptRunError.message
      });
    }

  } catch (error: any) {
    console.error('Caught error in predictAndPlan:', error);
    res.status(500).json({ 
      error: 'Failed to generate career plan',
      details: error.message
    });
  }
}; 