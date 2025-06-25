# Career Bloom Engine

A comprehensive career development platform with job recommendations, resume building, and career path guidance.

## LinkedIn Job Scraper

This project includes a LinkedIn job scraper that helps users find relevant job opportunities based on their skills and preferences. The scraper is built using the `linkedin-jobs-scraper` Python package and integrates with the main application.

### Setup Instructions

1. **Install Python dependencies**

   ```bash
   pip install -r requirements.txt
   ```

2. **Install Chrome/Chromium and ChromeDriver**

   The LinkedIn scraper requires Chrome/Chromium and ChromeDriver to be installed. 

   - Download and install Chrome or Chromium browser
   - Download ChromeDriver from https://chromedriver.chromium.org/downloads (make sure to match your Chrome version)
   - Add ChromeDriver to your system PATH

3. **Start the backend server**

   ```bash
   cd server
   npm install
   npm run dev
   ```

4. **Start the frontend application**

   ```bash
   npm install
   npm run dev
   ```

5. **Access the application**

   Open your browser and navigate to http://localhost:3000

### Using the LinkedIn Job Scraper

1. Navigate to the Dashboard
2. Go to the "Job Recommendations" tab
3. Click on "Find Jobs" to access the LinkedIn Job Finder
4. Enter your preferred job title and location
5. Click "Find LinkedIn Jobs" to start scraping

The application will automatically recommend keywords based on your profile skills.

### Troubleshooting

- If you encounter issues with the scraper, check that ChromeDriver is properly installed and matches your Chrome version
- The application will fall back to a basic scraper if dependencies are not properly configured
- For rate limiting issues, try reducing the number of jobs to scrape or wait before trying again

## Job Recommendation System

### Seeding Jobs

To populate the database with 1000 sample job listings for testing the recommendation system:

```bash
npm run seed-jobs
```

This script will:
1. Generate 1000 diverse job listings with realistic titles, descriptions, skills, and other attributes
2. Save the jobs to a JSON file in `server/data/seed-jobs.json`
3. Add the jobs to the vector database for similarity search
4. Save the jobs to MongoDB if connected

### How the Job Recommendation System Works

The job recommendation system uses a RAG (Retrieval Augmented Generation) approach:

1. **Resume Processing**: When a user uploads a resume, the system extracts text from it
2. **Vector Embedding**: Both job listings and resume text are converted to vector embeddings
3. **Similarity Search**: The system finds job listings most similar to the resume using vector similarity
4. **Match Scoring**: Jobs are scored based on skill overlap with the resume
5. **Recommendation**: The top matching jobs are displayed to the user

### Using the Job Recommendation API

#### Get Recommendations from Resume Text

```http
POST /api/job-recommendations/recommendations
Content-Type: application/json

{
  "resumeText": "Your resume text here...",
  "limit": 10
}
```

#### Get Recommendations from Resume File

```http
POST /api/job-recommendations/recommendations/resume
Content-Type: multipart/form-data

resume: [Your resume file]
limit: 10
```

#### Add Jobs to Recommendation System

```http
POST /api/job-recommendations/add-jobs
Content-Type: application/json

{
  "jobs": [
    {
      "title": "Software Engineer",
      "company": "TechCorp",
      "description": "...",
      "skills": ["JavaScript", "React", "Node.js"],
      ...
    },
    ...
  ]
}
```

#### Initialize Recommendation System

```http
POST /api/job-recommendations/initialize
```

#### Clear Recommendation System

```http
DELETE /api/job-recommendations/clear
```

## Features

- Personalized job recommendations based on user profile
- LinkedIn job scraping with customizable parameters
- Skills assessment and gap analysis
- Resume builder and customizer
- Career path prediction
- Cover letter generation

## Technologies Used

- React + TypeScript
- Node.js + Express
- MongoDB
- Python (for LinkedIn scraper)
- Selenium WebDriver
