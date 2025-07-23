import express from 'express';
import { analyzeResumeWithLightningAI, checkLightningAIHealth } from '../controllers/resumeAnalysisController';
import { customizeResume, deleteUserResume, getResumeText, uploadResumeAndExtractSkills } from '../controllers/resumeController';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

// General resume endpoints
router.post('/resume/customize', customizeResume);
router.post('/resume/upload', uploadResumeAndExtractSkills);

// Lightning AI resume analysis endpoints
router.post('/resume/analyze-missing-skills', analyzeResumeWithLightningAI);
router.get('/resume/lightning-ai-health', checkLightningAIHealth);

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

router.delete('/user/resume', authenticateUser, deleteUserResume);

// Get extracted resume text for chatbot
router.get('/user/resume/text', authenticateUser, getResumeText);

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

// Resume builder endpoints
router.post('/resumes', (req, res) => {
  console.log('POST /resumes endpoint hit');
  const resumeData = req.body;

  // Mock save to database
  const savedResume = {
    ...resumeData,
    id: resumeData.id || Date.now().toString(),
    createdAt: resumeData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.json(savedResume);
});

router.get('/resumes', (req, res) => {
  console.log('GET /resumes endpoint hit');

  // Mock resume history
  const mockResumes = [
    {
      id: '1',
      title: 'Software Engineer Resume',
      template: 'template1',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      title: 'Full Stack Developer Resume',
      template: 'template2',
      createdAt: '2024-01-10T14:20:00Z',
      updatedAt: '2024-01-10T14:20:00Z'
    }
  ];

  res.json(mockResumes);
});

router.get('/resumes/:id', (req, res) => {
  console.log(`GET /resumes/${req.params.id} endpoint hit`);
  const { id } = req.params;

  // Mock resume data
  const mockResume = {
    id,
    title: 'Software Engineer Resume',
    template: 'template1',
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      phone: '+1 (555) 123-4567'
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  };

  res.json(mockResume);
});

// Update a specific resume
router.put('/resumes/:id', (req, res) => {
  console.log(`PUT /resumes/${req.params.id} endpoint hit`);
  const { id } = req.params;
  const resumeData = req.body;

  // Mock update
  const updatedResume = {
    ...resumeData,
    id,
    updatedAt: new Date().toISOString()
  };

  res.json(updatedResume);
});

// Delete a specific resume
router.delete('/resumes/:id', (req, res) => {
  console.log(`DELETE /resumes/${req.params.id} endpoint hit`);
  const { id } = req.params;

  // Mock deletion - in a real app, you would delete from database
  res.json({
    success: true,
    message: `Resume ${id} deleted successfully`,
    deletedId: id
  });
});

export default router;