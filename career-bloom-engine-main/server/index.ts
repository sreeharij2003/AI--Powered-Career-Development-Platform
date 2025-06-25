import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import connectDB from './config/database';
import chatbotRoutes from './routes/chatbotRoutes';
import coverLetterRoutes from './routes/coverLetterRoutes';
import jobRecommendationRoutes from './routes/jobRecommendationRoutes';
import jobRoutes from './routes/jobRoutes';
import resumeRoutes from './routes/resumeRoutes';

// Load environment variables
dotenv.config();

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
app.use('/api/coverletter', coverLetterRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/job-recommendations', jobRecommendationRoutes);
app.use('/api/jobs', jobRoutes);

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