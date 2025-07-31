# 🚀 CareerBloom - AI-Powered Career Development Platform

<div align="center">

![CareerBloom Logo](https://img.shields.io/badge/CareerBloom-AI%20Career%20Platform-blue?style=for-the-badge&logo=rocket)

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![AI](https://img.shields.io/badge/AI-Gemini%20%7C%20OpenAI-FF6B6B?style=flat&logo=openai)](https://ai.google.dev/)

**A comprehensive AI-powered career development platform that revolutionizes job searching, resume building, and career planning with advanced machine learning and natural language processing.**

[🎯 Features](#-features) • [🛠️ Setup](#️-quick-setup) • [📖 Documentation](#-api-documentation) • [🤖 AI Features](#-ai-powered-features)

</div>

---

## 📋 Table of Contents

- [🎯 Features Overview](#-features-overview)
- [🛠️ Quick Setup](#️-quick-setup)
- [📦 Installation](#-installation)
- [🔧 Configuration](#-configuration)
- [🤖 AI-Powered Features](#-ai-powered-features)
- [📖 API Documentation](#-api-documentation)
- [🎨 UI Components](#-ui-components)
- [🔄 Prompting Strategies](#-prompting-strategies)
- [🚀 Deployment](#-deployment)
- [🧪 Testing](#-testing)
- [🤝 Contributing](#-contributing)

---

## 🎯 Features Overview

### 🎨 **Core Features**

| Feature | Description | AI Integration | Status |
|---------|-------------|----------------|--------|
| **Resume Builder** | Create professional resumes with multiple templates | ✅ AI Content Generation | ✅ Active |
| **Resume Customizer** | Tailor resumes for specific job applications | ✅ Job-Specific Optimization | ✅ Active |
| **Job Recommendations** | Intelligent job matching based on skills and experience | ✅ Vector Similarity + RAG | ✅ Active |
| **Career Path Predictor** | Generate personalized career roadmaps | ✅ Hierarchical Planning | ✅ Active |
| **Skills Assessment** | Evaluate technical and soft skills with adaptive testing | ✅ Dynamic Question Generation | ✅ Active |
| **Job Trends Analytics** | Market insights and salary analysis | ✅ Data-Driven Analysis | ✅ Active |
| **AI Chatbot** | Career counseling and interview preparation | ✅ Conversational AI | ✅ Active |
| **Cover Letter Generator** | Create tailored cover letters | ✅ Template + LLM Generation | ✅ Active |

### 🔍 **Advanced Features**

- **🎯 ATS Optimization**: Resume scanning and keyword optimization
- **📊 Skill Gap Analysis**: Identify missing skills for target roles
- **🌐 LinkedIn Integration**: Job scraping and profile analysis
- **📈 Progress Tracking**: Career development monitoring
- **🔗 Network Recommendations**: Professional connection suggestions
- **📱 Responsive Design**: Mobile-first UI with dark/light themes

---

## 🛠️ Quick Setup

### 📋 Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** (local or cloud)
- **Python** 3.8+ (for LinkedIn scraper)
- **Chrome/Chromium** + ChromeDriver

### ⚡ 5-Minute Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/career-bloom-engine.git
cd career-bloom-engine

# 2. Install dependencies
npm install
cd server && npm install && cd ..

# 3. Set up environment variables
cp server/.env.example server/.env
# Edit server/.env with your API keys

# 4. Start the development servers
npm run dev        # Frontend (http://localhost:5173)
npm run server     # Backend (http://localhost:3001)

# 5. Seed the database (optional)
npm run seed-jobs  # Populate with 1000 sample jobs
```

### 🔑 Required API Keys

Add these to your `server/.env` file:

```env
# AI Services
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Job Search
JSEARCH_API_KEY=your_jsearch_api_key_here

# Database
MONGODB_URI=mongodb://localhost:27017/careerbloom

# Authentication (optional)
CLERK_SECRET_KEY=your_clerk_secret_key

# Lightning AI (for resume analysis)
LIGHTNING_AI_TOKEN=your_lightning_ai_token
```

---

## 📦 Installation

### 🖥️ **Frontend Setup**

```bash
# Install frontend dependencies
npm install

# Available scripts
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### 🔧 **Backend Setup**

```bash
cd server

# Install backend dependencies
npm install

# Available scripts
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript
npm run start        # Start production server
npm run seed-jobs    # Populate database with sample jobs
```

### 🐍 **Python Dependencies (LinkedIn Scraper)**

```bash
# Install Python dependencies
pip install -r requirements.txt

# Required packages
pip install selenium beautifulsoup4 requests pandas
```

---

## 🔧 Configuration

### 🌐 **Environment Variables**

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GEMINI_API_KEY` | Google Gemini AI API key | ✅ | - |
| `JSEARCH_API_KEY` | JSearch job API key | ✅ | - |
| `MONGODB_URI` | MongoDB connection string | ✅ | `mongodb://localhost:27017/careerbloom` |
| `OPENAI_API_KEY` | OpenAI API key (optional) | ❌ | - |
| `LIGHTNING_AI_TOKEN` | Lightning AI API token | ❌ | - |
| `PORT` | Server port | ❌ | `3001` |
| `NODE_ENV` | Environment mode | ❌ | `development` |

### 📁 **Project Structure**

```
career-bloom-engine/
├── src/                          # Frontend React application
│   ├── components/
│   │   ├── dashboard/           # Main dashboard components
│   │   ├── ui/                  # Reusable UI components
│   │   └── career-tools/        # Career-specific tools
│   ├── pages/                   # Route pages
│   ├── services/                # API services
│   └── types/                   # TypeScript definitions
├── server/                       # Backend Node.js application
│   ├── controllers/             # Route controllers
│   ├── models/                  # Database models
│   ├── routes/                  # API routes
│   ├── services/                # Business logic services
│   ├── middleware/              # Express middleware
│   └── utils/                   # Utility functions
├── data/                        # Sample data and embeddings
└── uploads/                     # File upload storage
```

---

## 🤖 AI-Powered Features

### 🧠 **Advanced Prompting Strategies**

CareerBloom uses sophisticated AI prompting techniques for optimal results:

| Feature | Prompting Strategy | AI Model | Purpose |
|---------|-------------------|----------|---------|
| **Resume Builder** | Few-Shot + Template-Based | Gemini 1.5 Flash | Consistent formatting and professional content |
| **Resume Customizer** | Chain-of-Thought + Context-Aware | Gemini 1.5 Flash | Job-specific optimization and ATS compliance |
| **Job Recommendations** | Semantic Similarity + Multi-Criteria | Vector Embeddings | Intelligent job matching and ranking |
| **Career Path Predictor** | Hierarchical + Progressive Disclosure | Gemini 1.5 Flash | Structured roadmaps with actionable steps |
| **Skills Assessment** | Adaptive + Difficulty Scaling | Gemini 1.5 Flash | Personalized question generation |
| **Job Trends Analytics** | Data-Driven + Predictive | Gemini 1.5 Flash | Market insights and trend analysis |
| **AI Chatbot** | Conversational + Role-Playing | Gemini 1.5 Flash | Expert career counseling |

### 🎯 **Resume Customization Workflow**

```mermaid
graph TD
    A[Upload Resume] --> B[Extract Text & Parse Structure]
    B --> C[Analyze Job Description]
    C --> D[Generate Job-Specific Summary]
    D --> E[Identify Missing Skills]
    E --> F[Integrate New Content]
    F --> G[Return Customized Resume]

    style A fill:#e1f5fe
    style G fill:#c8e6c9
```

### 🔍 **Job Recommendation Engine**

The system uses a **RAG (Retrieval Augmented Generation)** approach:

1. **📄 Resume Processing**: Extract and parse resume content
2. **🔢 Vector Embedding**: Convert text to high-dimensional vectors
3. **🔍 Similarity Search**: Find matching jobs using cosine similarity
4. **📊 Scoring Algorithm**: Rank jobs based on multiple factors
5. **🎯 Personalization**: Adapt recommendations to user preferences

```typescript
// Example: Job Recommendation API
const recommendations = await fetch('/api/job-recommendations/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    resumeText: userResume,
    preferences: { location: 'Remote', salaryMin: 80000 },
    limit: 10
  })
});
```

---

## 📖 API Documentation

### 🎯 **Resume APIs**

#### **Resume Builder**
```http
POST /api/resume-builder/generate
Content-Type: application/json

{
  "personalInfo": { "name": "John Doe", "email": "john@example.com" },
  "experience": [...],
  "skills": ["React", "Node.js"],
  "template": "modern"
}
```

#### **Resume Customizer**
```http
POST /api/resume-customization/customize-text
Content-Type: application/json

{
  "resumeText": "Your complete resume text...",
  "jobDescription": "Target job description...",
}
```

### 🔍 **Job Recommendation APIs**

#### **Get Recommendations**
```http
POST /api/job-recommendations/recommendations
Content-Type: application/json

{
  "resumeText": "Your resume content...",
  "limit": 10,
  "filters": {
    "location": "Remote",
    "salaryMin": 70000,
    "experienceLevel": "mid"
  }
}
```

#### **Add Jobs to Database**
```http
POST /api/job-recommendations/add-jobs
Content-Type: application/json

{
  "jobs": [
    {
      "title": "Senior React Developer",
      "company": "TechCorp",
      "description": "Build scalable web applications...",
      "skills": ["React", "TypeScript", "Node.js"],
      "salary": { "min": 90000, "max": 120000 },
      "location": "San Francisco, CA",
      "remote": true
    }
  ]
}
```

### 🛤️ **Career Path APIs**

#### **Generate Career Roadmap**
```http
POST /api/career-path/generate
Content-Type: application/json

{
  "currentRole": "Junior Developer",
  "targetRole": "Senior Full Stack Developer",
  "timeframe": "2 years",
  "skills": ["JavaScript", "React"]
}
```

### 📊 **Skills Assessment APIs**

#### **Start Assessment**
```http
POST /api/skills-assessment/start
Content-Type: application/json

{
  "category": "frontend",
  "difficulty": "intermediate",
  "questionCount": 15
}
```

#### **Submit Answers**
```http
POST /api/skills-assessment/submit
Content-Type: application/json

{
  "assessmentId": "uuid",
  "answers": [
    { "questionId": 1, "selectedOption": "A" },
    { "questionId": 2, "selectedOption": "C" }
  ]
}
```

---

## 🎨 UI Components

### 📱 **Dashboard Components**

- **`ResumeBuilder`**: Multi-step resume creation with AI assistance
- **`ResumeCustomizer`**: Job-specific resume optimization
- **`JobRecommendations`**: Intelligent job matching interface
- **`CareerPathPredictor`**: Interactive career roadmap generator
- **`SkillsAssessment`**: Adaptive skill evaluation system
- **`ProgressDashboard`**: Career development tracking
- **`AIResumeFeatures`**: AI-powered resume enhancements

### 🎯 **Specialized Tools**

- **`SkillGapAnalyzer`**: Identify missing skills for target roles
- **`SalaryFilter`**: Advanced salary and location filtering
- **`ConnectionRecommender`**: Professional networking suggestions
- **`AssessmentQuiz`**: Interactive skill testing interface

### 🎨 **UI Framework**

Built with **shadcn/ui** components and **Tailwind CSS**:

- **Responsive Design**: Mobile-first approach
- **Dark/Light Themes**: Automatic theme switching
- **Accessibility**: WCAG 2.1 compliant
- **Modern Animations**: Smooth transitions and micro-interactions

---

## 🔄 Prompting Strategies

### 🧠 **Advanced AI Techniques**

CareerBloom implements cutting-edge prompting strategies for optimal AI performance:

#### **1. Few-Shot Prompting** 🎯
```typescript
// Used in: Resume Builder, Content Generation
const prompt = `Generate a professional summary for a ${jobTitle} role.

Examples:
Software Engineer: "Experienced software engineer with 3+ years developing scalable web applications..."
Data Scientist: "Results-driven data scientist with expertise in machine learning..."

Now generate for: ${jobTitle}
Skills: ${skills.join(', ')}`;
```

#### **2. Chain-of-Thought Prompting** 🔗
```typescript
// Used in: Resume Customizer, Skill Analysis
const prompt = `Analyze job compatibility step by step:

Step 1: Extract key requirements from job description
Step 2: Identify user's relevant skills and experience
Step 3: Calculate skill match percentage
Step 4: Suggest improvements

Job Description: "${jobDescription}"
Resume: "${resumeText}"`;
```

#### **3. Context-Aware Prompting** 📋
```typescript
// Used in: All job-related features
const prompt = `You are a senior career counselor with 15+ years experience.

Context:
- User's Resume: ${resumeData}
- Target Job: ${jobData}
- Industry: ${industry}

Provide personalized career advice considering the user's background and target role.`;
```

#### **4. Hierarchical Prompting** 🏗️
```typescript
// Used in: Career Path Predictor
const prompt = `Create a 4-stage career roadmap for ${careerPath}:

Stage 1 (0-6 months): Foundation
- Core skills to learn
- Beginner projects
- Learning resources

Stage 2 (6-12 months): Intermediate
- Advanced concepts
- Portfolio projects
- Certifications

[Continue for all 4 stages...]`;
```

### 🎛️ **Prompt Optimization Techniques**

- **Temperature Control**: Creative tasks (0.7-0.9) vs Analytical tasks (0.1-0.3)
- **Token Optimization**: Efficient prompts within API limits
- **Error Handling**: Fallback prompts for failed requests
- **Multi-Turn Conversations**: Context preservation across sessions

---

## 🚀 Deployment

### 🌐 **Production Deployment**

#### **Frontend (Vercel/Netlify)**
```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

#### **Backend (Railway/Heroku)**
```bash
# Build backend
cd server && npm run build

# Deploy to Railway
railway deploy

# Deploy to Heroku
git push heroku main
```

#### **Database (MongoDB Atlas)**
```bash
# Update connection string in production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/careerbloom
```

### 🐳 **Docker Deployment**

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production

  backend:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/careerbloom
    depends_on:
      - mongo

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

---

## 🧪 Testing

### 🔬 **Test Coverage**

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit        # Unit tests
npm run test:integration # Integration tests
npm run test:e2e         # End-to-end tests
```

### 🎯 **API Testing**

```bash
# Test resume customization
curl -X POST http://localhost:3001/api/resume-customization/customize-text \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "Your resume text...",
    "jobDescription": "Job description..."
  }'

# Test job recommendations
curl -X POST http://localhost:3001/api/job-recommendations/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "Your resume text...",
    "limit": 5
  }'
```

### 🔍 **Performance Testing**

- **Load Testing**: Artillery.js for API endpoints
- **Frontend Performance**: Lighthouse CI integration
- **Database Performance**: MongoDB profiling and indexing

---

## 🤝 Contributing

### 📝 **Development Guidelines**

1. **Fork the repository** and create a feature branch
2. **Follow coding standards**: ESLint + Prettier configuration
3. **Write tests** for new features and bug fixes
4. **Update documentation** for API changes
5. **Submit a pull request** with detailed description

### 🏗️ **Project Structure Guidelines**

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── dashboard/       # Feature-specific components
│   └── career-tools/    # Specialized career tools
├── services/            # API integration layer
├── hooks/               # Custom React hooks
├── types/               # TypeScript definitions
└── utils/               # Helper functions
```

### 🎨 **Code Style**

- **TypeScript**: Strict mode enabled
- **React**: Functional components with hooks
- **Styling**: Tailwind CSS with shadcn/ui
- **State Management**: React Query + Context API

### 🔧 **Adding New Features**

1. **Create component** in appropriate directory
2. **Add API endpoint** in server/routes
3. **Implement controller** logic
4. **Add TypeScript types**
5. **Write unit tests**
6. **Update documentation**

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI** for advanced language processing
- **OpenAI** for GPT model integration
- **shadcn/ui** for beautiful UI components
- **Tailwind CSS** for utility-first styling
- **React Query** for efficient data fetching
- **MongoDB** for flexible data storage

---

<div align="center">

**Built with ❤️ by the CareerBloom Team**

[🌟 Star this repo](https://github.com/your-username/career-bloom-engine) • [🐛 Report Bug](https://github.com/your-username/career-bloom-engine/issues) • [💡 Request Feature](https://github.com/your-username/career-bloom-engine/issues)

</div>
