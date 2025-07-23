// Load environment variables FIRST, before any imports
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables and override any global ones
dotenv.config({ path: path.join(__dirname, '.env') });

// Manually set the environment variables to ensure they're correct
process.env.MONGODB_URI = 'mongodb+srv://sreehari:sreehari@cluster0.9ssc7ci.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
process.env.PORT = '5000';
process.env.GEMINI_API_KEY = 'AIzaSyA0aFb_12Xtn-qr5iv8hOaoerMV7YxS4qE';
process.env.RAPIDAPI_KEY = '0c187fdd35mshf36ce5f69972f2fp1656f4jsn73130185f98e';
process.env.GPT2_MODEL_PATH = 'C:\\Users\\ASUS\\Downloads\\gpt2-lora-finetuned\\gpt2-lora-finetuned';

// Now import other modules
import cors from 'cors';
import express from 'express';
import connectDB from './config/database';
import careerRoutes from './routes/careerRoutes';
import chatbotRoutes from './routes/chatbotRoutes';
import companyRoutes from './routes/companyRoutes';
import coverLetterRoutes from './routes/coverLetterRoutes';
import jobRecommendationRoutes from './routes/jobRecommendationRoutes';
import jobRoutes from './routes/jobRoutes';
import jobTrendsRoutes from './routes/jobTrendsRoutes';
import resumeCustomizationRoutes from './routes/resumeCustomizationRoutes';
import resumeRoutes from './routes/resumeRoutes';
import skillAssessmentRoutes from './routes/skillAssessmentRoutes';
import geminiRoutes from './src/routes/gemini';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/cover-letter', coverLetterRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/resume-customization', resumeCustomizationRoutes);
app.use('/api/job-recommendations', jobRecommendationRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api', careerRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/job-trends', jobTrendsRoutes);
app.use('/api/skill-assessment', skillAssessmentRoutes);

// Map user routes directly
app.use('/api', resumeRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});