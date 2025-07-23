import { Request, Response } from 'express';
import ChatbotService from '../chatbot/chatbotService';

class ChatbotController {
  private chatbotService: ChatbotService;

  constructor() {
    this.chatbotService = new ChatbotService();
    this.initialize();
  }

  private async initialize() {
    try {
      await this.chatbotService.initialize();
      console.log('Chatbot service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize chatbot service:', error);
    }
  }

  handleQuery = async (req: Request, res: Response) => {
    try {
      const { query, job, resumeText } = req.body;

      if (!query) {
        return res.status(400).json({ 
          error: 'Query is required',
          message: 'Please provide a search query'
        });
      }

      const response = await this.chatbotService.processUserQuery(query, job, resumeText);
      res.json({ 
        success: true,
        response,
        query
      });
    } catch (error) {
      console.error('Error processing chatbot query:', error);
      res.status(500).json({ 
        error: 'Failed to process query',
        message: 'An error occurred while processing your request'
      });
    }
  };

  // New endpoint to test LLM integration
  testLLM = async (req: Request, res: Response) => {
    try {
      const { query, job, resumeText } = req.body;

      if (!query) {
        return res.status(400).json({ 
          error: 'Query is required',
          message: 'Please provide a test query'
        });
      }

      // Force LLM usage for testing
      const response = await this.chatbotService.processUserQuery(query, job, resumeText);
      
      res.json({ 
        success: true,
        response,
        query,
        source: 'deepseek-llm'
      });
    } catch (error) {
      console.error('Error testing LLM integration:', error);
      res.status(500).json({ 
        error: 'Failed to test LLM',
        message: 'An error occurred while testing LLM integration'
      });
    }
  };

  ingestJobs = async (req: Request, res: Response) => {
    try {
      const { jobs } = req.body;

      if (!Array.isArray(jobs)) {
        return res.status(400).json({ error: 'Jobs must be an array' });
      }

      await this.chatbotService.ingestJobs(jobs);
      res.json({ message: `Successfully ingested ${jobs.length} jobs` });
    } catch (error) {
      console.error('Error ingesting jobs:', error);
      res.status(500).json({ error: 'Failed to ingest jobs' });
    }
  };
}

export default new ChatbotController(); 