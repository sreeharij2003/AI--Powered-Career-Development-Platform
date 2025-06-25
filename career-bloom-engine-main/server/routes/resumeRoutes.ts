import express from 'express';
import { customizeResume, uploadResumeAndExtractSkills } from '../controllers/resumeController';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

// General resume endpoints
router.post('/resume/customize', customizeResume);
router.post('/resume/upload', uploadResumeAndExtractSkills);

// User resume endpoints - these need to match the API calls from the frontend
router.post('/user/resume/upload', authenticateUser, uploadResumeAndExtractSkills);
router.get('/user/resume', authenticateUser, (req, res) => {
  console.log("GET /user/resume endpoint hit");
  // For now, just return a mock response
  // In a real app, you would retrieve this from a database
  res.json({
    id: '123456789',
    fileName: 'resume.pdf',
    fileUrl: '/uploads/123456789.pdf',
    uploadDate: new Date().toISOString(),
    skills: ["JavaScript", "React", "Node.js"],
    summary: "Experienced software developer with expertise in web development...",
    headline: "Senior Software Engineer"
  });
});

router.delete('/user/resume', authenticateUser, (req, res) => {
  console.log("DELETE /user/resume endpoint hit");
  // For now, just return a success response
  // In a real app, you would delete the file and database record
  res.json({ success: true, message: 'Resume deleted successfully' });
});

// Parse route for resume analysis
router.post('/user/resume/:fileId/parse', authenticateUser, (req, res) => {
  console.log(`POST /user/resume/${req.params.fileId}/parse endpoint hit`);
  const { fileId } = req.params;
  
  // Mock response for resume parsing
  res.json({
    id: fileId,
    skills: ["JavaScript", "React", "Node.js", "TypeScript", "Express"],
    summary: "Experienced software developer with 5+ years of experience in web development...",
    headline: "Senior Software Engineer"
  });
});

export default router; 