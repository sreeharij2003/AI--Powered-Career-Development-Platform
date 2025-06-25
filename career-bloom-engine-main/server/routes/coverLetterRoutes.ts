import express from 'express';
import {
    deleteCoverLetter,
    exportCoverLetter,
    generateCoverLetter,
    getCoverLetterHistory,
    updateCoverLetter
} from '../controllers/coverLetterController';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Cover letter generation
router.post('/generate', generateCoverLetter);

// Cover letter history
router.get('/history', getCoverLetterHistory);

// Cover letter management
router.put('/:id', updateCoverLetter);
router.delete('/:id', deleteCoverLetter);

// Export cover letter
router.get('/export/:id', exportCoverLetter);

export default router; 