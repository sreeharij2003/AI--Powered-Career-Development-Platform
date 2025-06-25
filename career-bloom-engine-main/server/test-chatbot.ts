import * as fs from 'fs';
import * as path from 'path';
import ChatbotService from './chatbot/chatbotService';

async function testChatbot() {
  try {
    // Initialize chatbot service
    const chatbot = new ChatbotService();
    await chatbot.initialize();

    // Load sample jobs
    const sampleJobsPath = path.join(__dirname, '..', 'data', 'sample_jobs.json');
    const jobs = JSON.parse(fs.readFileSync(sampleJobsPath, 'utf-8'));

    // Ingest jobs into vector store
    await chatbot.ingestJobs(jobs);
    console.log('Successfully ingested sample jobs');

    // Test queries
    const testQueries = [
      "I'm looking for a remote software engineering position",
      "What jobs are available for Python developers?",
      "Show me frontend development positions"
    ];

    for (const query of testQueries) {
      console.log('\nQuery:', query);
      const response = await chatbot.processUserQuery(query);
      console.log('Response:', response);
    }

  } catch (error) {
    console.error('Error testing chatbot:', error);
  }
}

testChatbot(); 