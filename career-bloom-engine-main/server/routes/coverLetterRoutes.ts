import express from 'express';
import multer from 'multer';
import { checkCoverLetterHealth, generateCoverLetter, testFileExtraction } from '../controllers/coverLetterController';

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept PDF and text files
    if (file.mimetype === 'application/pdf' ||
        file.mimetype === 'text/plain' ||
        file.originalname.endsWith('.pdf') ||
        file.originalname.endsWith('.txt')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and text files are allowed'));
    }
  }
});

const router = express.Router();

// Generate cover letter endpoint - supports both file upload and JSON
router.post('/generate', upload.single('resume'), generateCoverLetter);

// Test file extraction endpoint for debugging
router.post('/test-extraction', upload.single('resume'), testFileExtraction);

// Health check endpoint
router.get('/health', checkCoverLetterHealth);

export default router;
