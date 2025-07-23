import express from 'express';
import {
    checkResumeCustomizationHealth,
    customizeResumeForJob,
    generateCustomizedResumePDF
} from '../controllers/resumeCustomizationController';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

// Resume customization endpoints
router.post('/customize', customizeResumeForJob);
router.post('/customize-text', async (req, res) => {
  try {
    const { customizeResumeFromText } = await import('../controllers/resumeCustomizationController');
    await customizeResumeFromText(req, res);
  } catch (error) {
    console.error('Error in customize-text route:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});
router.post('/generate-pdf', generateCustomizedResumePDF);
router.get('/health', checkResumeCustomizationHealth);

// Test endpoint for debugging
router.post('/test', async (req, res) => {
  try {
    console.log('🧪 Testing resume customization...');
    console.log('Request body:', req.body);

    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        error: 'Missing resumeText or jobDescription'
      });
    }

    // Test basic functionality without AI
    const testResult = {
      originalResume: resumeText,
      customizedResume: resumeText + '\n\n[TEST] This resume was processed successfully!',
      newSummary: 'Test summary: Professional with relevant experience for this role.',
      addedSkills: ['JavaScript', 'React', 'Node.js']
    };

    console.log('✅ Test completed successfully');

    res.json({
      success: true,
      data: testResult,
      message: 'Test endpoint working correctly'
    });

  } catch (error: any) {
    console.error('❌ Test endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Test endpoint failed',
      details: error.message
    });
  }
});

// Authenticated endpoints (if you want to require authentication)
router.post('/user/customize', authenticateUser, customizeResumeForJob);
router.post('/user/generate-pdf', authenticateUser, generateCustomizedResumePDF);

export default router;
