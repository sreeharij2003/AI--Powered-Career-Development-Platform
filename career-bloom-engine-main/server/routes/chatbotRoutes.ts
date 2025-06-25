import express from 'express';
import chatbotController from '../controllers/chatbotController';

const router = express.Router();

// Route for handling chatbot queries
router.post('/query', chatbotController.handleQuery);

// Route for testing LLM integration
router.post('/test-llm', chatbotController.testLLM);

// Route for ingesting jobs into chatbot vector store
router.post('/ingest-jobs', chatbotController.ingestJobs);

export default router; 