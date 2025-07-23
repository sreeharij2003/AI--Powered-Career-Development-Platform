import { Request, Response } from 'express';
import { lightningAIService } from '../services/lightningAIService';

/**
 * Analyze resume against job description using Lightning AI
 * Extract missing skills that the candidate needs to develop
 */
export const analyzeResumeWithLightningAI = async (req: Request, res: Response) => {
  try {
    const { resumeText, jobDescription } = req.body;

    // Validate input
    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        error: 'Both resume text and job description are required'
      });
    }

    if (typeof resumeText !== 'string' || typeof jobDescription !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Resume text and job description must be strings'
      });
    }

    if (resumeText.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Resume text is too short. Please provide a complete resume.'
      });
    }

    if (jobDescription.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Job description is too short. Please provide a complete job description.'
      });
    }

    console.log('🔍 Starting resume analysis with Lightning AI...');
    console.log('📄 Resume length:', resumeText.length, 'characters');
    console.log('💼 Job description length:', jobDescription.length, 'characters');

    // Call Lightning AI service
    const analysisResult = await lightningAIService.analyzeResumeForMissingSkills(
      resumeText.trim(),
      jobDescription.trim()
    );

    if (!analysisResult.success) {
      console.error('❌ Lightning AI analysis failed:', analysisResult.error);
      return res.status(500).json({
        success: false,
        error: analysisResult.error || 'Failed to analyze resume with Lightning AI'
      });
    }

    console.log('✅ Resume analysis completed successfully');
    console.log('🎯 Missing skills found:', analysisResult.missingSkills.length);
    console.log('✅ Existing skills found:', analysisResult.existingSkills.length);

    // Return the analysis results
    res.json({
      success: true,
      data: {
        missingSkills: analysisResult.missingSkills,
        existingSkills: analysisResult.existingSkills,
        analysisText: analysisResult.analysisText,
        summary: {
          totalMissingSkills: analysisResult.missingSkills.length,
          totalExistingSkills: analysisResult.existingSkills.length,
          analysisDate: new Date().toISOString()
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Error in resume analysis controller:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error during resume analysis',
      details: error.message
    });
  }
};

/**
 * Health check endpoint for Lightning AI service
 */
export const checkLightningAIHealth = async (req: Request, res: Response) => {
  try {
    // Test with minimal data
    const testResult = await lightningAIService.analyzeResumeForMissingSkills(
      'Test resume with JavaScript skills',
      'Looking for React developer with TypeScript experience'
    );

    res.json({
      success: true,
      lightningAIStatus: testResult.success ? 'healthy' : 'error',
      message: testResult.success ? 'Lightning AI service is working' : testResult.error,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      lightningAIStatus: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
