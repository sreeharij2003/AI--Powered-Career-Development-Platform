import ChatbotService from '../chatbot/chatbotService';
import connectDB from '../config/database';

async function runChatbot() {
  try {
    // Connect to database
    await connectDB();

    // Initialize chatbot
    const chatbot = new ChatbotService();
    await chatbot.initialize();

    // Test queries
    const testQueries = [
      "I'm looking for a remote software engineering position",
      "What jobs are available for Python developers?",
      "Show me frontend development positions",
      "I need a job in New York with React experience"
    ];

    for (const query of testQueries) {
      console.log('\nQuery:', query);
      const response = await chatbot.processUserQuery(query);
      console.log('Response:', response);
      console.log('----------------------------------------');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error running chatbot:', error);
    process.exit(1);
  }
}

runChatbot(); 