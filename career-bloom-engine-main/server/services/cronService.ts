import cron from 'node-cron';
import ChatbotService from '../chatbot/chatbotService';
import scraperService from './scraperService';

class CronService {
  private chatbot: ChatbotService;
  private keywords: string[] = [
    "Software Engineer",
    "Web Developer",
    "Data Scientist",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Machine Learning Engineer",
    "DevOps Engineer",
    "Product Manager",
    "UI/UX Designer",
    "Mobile Developer",
    "QA Engineer",
    "Business Analyst",
    "Cloud Engineer",
    "Network Engineer",
    "Database Administrator",
    "Cybersecurity Analyst",
    "Technical Support",
    "Project Manager",
    "System Administrator"
  ];

  constructor() {
    this.chatbot = new ChatbotService();
  }

  // Schedule job scraping every 12 hours
  scheduleJobScraping() {
    // Run at 00:00 and 12:00 every day
    cron.schedule('0 0,12 * * *', async () => {
      try {
        console.log('Starting scheduled job scraping...');
        for (const keyword of this.keywords) {
          try {
            await scraperService.scrapeJobs(keyword, ""); // Empty location = all locations
            await new Promise(resolve => setTimeout(resolve, 5000));
          } catch (error) {
            console.error(`Error scraping jobs for ${keyword}:`, error);
            continue;
          }
        }
        await this.chatbot.initialize();
        console.log('Scheduled job scraping completed');
      } catch (error) {
        const e = error as Error;
        console.error('Error in scheduled job scraping:', e.message);
      }
    });
    console.log('Job scraping scheduler initialized');
  }
}

export default new CronService(); 