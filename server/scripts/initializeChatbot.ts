import ChatbotService from '../chatbot/chatbotService';
import llmService from '../chatbot/llmService';
import connectDB from '../config/database';
import jobService from '../services/jobService';

async function initializeChatbot() {
  console.log('Starting chatbot initialization...');
  let dbConnected = false;
  
  try {
    // Try to connect to MongoDB
    try {
      await connectDB();
      console.log('Connected to MongoDB');
      dbConnected = true;
    } catch (error: any) {
      console.error('MongoDB connection error:', error.message || 'Unknown error');
      console.log('Continuing with LLM-only mode (no job data)');
    }

    // Initialize LLM service
    await llmService.initialize();
    console.log('LLM service initialized with Qwen3-0.6B model');

    // Initialize chatbot service
    const chatbot = new ChatbotService();
    await chatbot.initialize(!dbConnected); // Skip DB if connection failed

    // Ingest jobs if connected to DB
    if (dbConnected) {
      try {
        // Get jobs from MongoDB
        const jobs = await jobService.getJobsForChatbot();
        console.log(`Retrieved ${jobs.length} jobs from MongoDB`);

        // Ingest jobs into vector store
        await chatbot.ingestJobs(jobs);
        console.log('Successfully ingested jobs into vector store');
      } catch (error: any) {
        console.error('Error retrieving or ingesting jobs:', error.message || 'Unknown error');
      }
    }

    // Test the chatbot
    const testQueries = [
      "I'm looking for a remote software engineering position",
      "What jobs are available for Python developers?",
      "Show me frontend development positions"
    ];

    console.log('\n=== Running test queries with LLM-powered responses ===');
    for (const query of testQueries) {
      console.log('\nQuery:', query);
      const startTime = Date.now();
      const response = await chatbot.processUserQuery(query);
      const endTime = Date.now();
      console.log(`Response (generated in ${endTime - startTime}ms):`);
      console.log(response);
    }

    console.log('\nChatbot initialization and testing completed successfully');
    process.exit(0);
  } catch (error: any) {
    console.error('Error initializing chatbot:', error.message || error);
    process.exit(1);
  }
}

initializeChatbot(); 