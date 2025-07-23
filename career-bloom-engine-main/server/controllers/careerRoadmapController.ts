import { Request, Response } from 'express';
import fetch from 'node-fetch';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyA0aFb_12Xtn-qr5iv8hOaoerMV7YxS4qE';
const YOUTUBE_RAPIDAPI_KEY = process.env.YOUTUBE_RAPIDAPI_KEY || '0c187fdd35mshf36ce5f69972f2fp1656f4jsn73130185f98e';
const COURSERA_RAPIDAPI_KEY = process.env.COURSERA_RAPIDAPI_KEY || '0c187fdd35mshf36ce5f69972f2fp1656f4jsn73130185f98e';

interface AssessmentAnswer {
  questionId: string;
  answer: string;
  category?: string;
}

interface LearningResource {
  title: string;
  url: string;
  type: 'youtube' | 'coursera';
  duration?: string;
}

interface CareerStage {
  stage: number;
  title: string;
  description: string;
  skills: string[];
  learningPoints: string[];
  youtubeVideos: LearningResource[];
  courseraContent: LearningResource[];
}

interface CareerRoadmap {
  career: string;
  description: string;
  totalStages: number;
  estimatedDuration: string;
  stages: CareerStage[];
}

interface CareerAnalysisResult {
  careers: CareerRoadmap[];
  totalCareers: number;
}

// Helper: Call Gemini API to analyze answers and generate roadmap using advanced prompting
async function getCareerRoadmapFromGemini(answers: AssessmentAnswer[]): Promise<CareerRoadmap[]> {
  // Advanced Prompting Strategy: Role-Based + Chain-of-Thought + Few-Shot
  const prompt = `
    ROLE: You are a world-class career counselor with 20+ years of experience in career development and roadmap creation.

    TASK: Analyze career assessment answers and create EXACTLY 1 personalized career roadmap for the MOST SUITABLE career.

    CHAIN-OF-THOUGHT REASONING:
    1. First, analyze the assessment answers to understand the person's interests, skills, and preferences
    2. Then, identify the SINGLE most suitable career path based on their responses
    3. Finally, create a detailed 4-stage roadmap for that career

    ASSESSMENT ANSWERS:
    ${answers.map(a => `Question: ${a.questionId}\nAnswer: ${a.answer}\nCategory: ${a.category || 'General'}`).join('\n\n')}

    FEW-SHOT EXAMPLE:
    For someone interested in data and analysis, here's the expected format:

    {
      "career": "Data Analyst",
      "description": "Analyze data to extract insights and support business decisions",
      "totalStages": 4,
      "estimatedDuration": "12-18 months",
      "stages": [
        {
          "stage": 1,
          "title": "Foundations of Data",
          "description": "Build fundamental data skills and understanding",
          "skills": ["Excel/Google Sheets", "SQL", "Basic Statistics"],
          "learningPoints": [
            "Learn Excel/Google Sheets (basic formulas, pivot tables)",
            "Learn SQL (data querying, joins, filtering)",
            "Understand data types, cleaning, and basic statistics"
          ]
        },
        {
          "stage": 2,
          "title": "Programming & Data Handling",
          "description": "Master programming tools for data manipulation",
          "skills": ["Python", "Pandas", "NumPy", "Data Cleaning"],
          "learningPoints": [
            "Learn Python (or R): NumPy, Pandas for data manipulation",
            "Work with CSV, Excel, databases",
            "Learn data cleaning & transformation techniques"
          ]
        },
        {
          "stage": 3,
          "title": "Data Visualization & Tools",
          "description": "Create compelling visualizations and reports",
          "skills": ["Matplotlib", "Seaborn", "Power BI", "Tableau"],
          "learningPoints": [
            "Use visualization libraries: Matplotlib, Seaborn, Plotly",
            "Learn BI Tools: Power BI or Tableau",
            "Create dashboards & reports"
          ]
        },
        {
          "stage": 4,
          "title": "Projects & Career Prep",
          "description": "Build portfolio and prepare for job market",
          "skills": ["Portfolio Building", "GitHub", "Interview Prep"],
          "learningPoints": [
            "Build real-world projects (sales analysis, customer trends, etc.)",
            "Share on GitHub or Kaggle",
            "Prepare for interviews: case studies, SQL & Excel tasks"
          ]
        }
      ]
    }

    CRITICAL INSTRUCTIONS:
    - Analyze the assessment answers carefully
    - Generate EXACTLY 1 career roadmap that BEST matches their interests
    - The career must have EXACTLY 4 stages
    - Each stage should have 3-4 specific learning points
    - Focus on practical, actionable skills
    - Make learning points specific and measurable
    - Return ONLY valid JSON array with 1 career object
    - NO markdown formatting, NO code blocks, NO additional text
    - MUST be valid JSON that can be parsed directly
    - Start response with [ and end with ]

    RESPONSE MUST BE EXACTLY THIS FORMAT:
    [{"career":"Most Suitable Career Name","description":"...","totalStages":4,"estimatedDuration":"...","stages":[...]}]
  `;

  try {
    console.log('🤖 Calling Gemini API for career analysis...');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error('No response content from Gemini');
    }

    console.log('📝 Gemini response received, parsing...');

    // Enhanced JSON parsing with better error handling
    try {
      console.log('📝 Raw Gemini response:', content.substring(0, 500) + '...');

      // Clean the content first
      let cleanContent = content.trim();

      // Remove any markdown formatting
      cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');

      // Try to find JSON array in the response
      const jsonStart = cleanContent.indexOf('[');
      const jsonEnd = cleanContent.lastIndexOf(']') + 1;

      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const jsonString = cleanContent.substring(jsonStart, jsonEnd);
        console.log('🔍 Extracted JSON:', jsonString.substring(0, 200) + '...');
        return JSON.parse(jsonString);
      }

      // If no array found, try parsing the whole content
      return JSON.parse(cleanContent);

    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError);
      console.log('📝 Content that failed to parse:', content.substring(0, 1000));

      // If still can't parse, return fallback data
      console.warn('⚠️ Could not parse Gemini response, using fallback');
      return getFallbackCareerRoadmaps();
    }
  } catch (error) {
    console.error('❌ Error calling Gemini API:', error);
    return getFallbackCareerRoadmaps();
  }
}

// Helper: Fetch YouTube videos for a topic
async function getYouTubeVideosForTopic(topic: string, skills: string[] = []): Promise<LearningResource[]> {
  try {
    const searchQuery = `${topic} ${skills.slice(0, 2).join(' ')} tutorial`;
    const encodedQuery = encodeURIComponent(searchQuery);
    const url = `https://youtube138.p.rapidapi.com/search/?q=${encodedQuery}&hl=en&gl=US`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': YOUTUBE_RAPIDAPI_KEY,
        'x-rapidapi-host': 'youtube138.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    const videos = data.contents?.slice(0, 3) || [];

    return videos.map((video: any) => ({
      title: video.video?.title || `${topic} Tutorial`,
      url: `https://www.youtube.com/watch?v=${video.video?.videoId}`,
      type: 'youtube' as const,
      duration: video.video?.lengthSeconds ? `${Math.ceil(video.video.lengthSeconds / 60)} min` : undefined
    }));
  } catch (error) {
    console.error(`❌ Error fetching YouTube videos for ${topic}:`, error);
    return [{
      title: `${topic} - Complete Tutorial`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' tutorial')}`,
      type: 'youtube' as const
    }];
  }
}

// Helper: Fetch Coursera content for a topic
async function getCourseraContentForTopic(topic: string, skills: string[] = []): Promise<LearningResource[]> {
  try {
    const searchQuery = `${topic} ${skills.slice(0, 2).join(' ')}`;
    const encodedQuery = encodeURIComponent(searchQuery);
    const url = `https://coursera-course-scraper.p.rapidapi.com/search?query=${encodedQuery}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': COURSERA_RAPIDAPI_KEY,
        'x-rapidapi-host': 'coursera-course-scraper.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`Coursera API error: ${response.status}`);
    }

    const data = await response.json();
    const courses = data.courses?.slice(0, 2) || [];

    return courses.map((course: any) => ({
      title: course.title || `${topic} Course`,
      url: course.url || `https://www.coursera.org/search?query=${encodedQuery}`,
      type: 'coursera' as const,
      duration: course.duration || 'Self-paced'
    }));
  } catch (error) {
    console.error(`❌ Error fetching Coursera content for ${topic}:`, error);
    return [{
      title: `${topic} - Professional Course`,
      url: `https://www.coursera.org/search?query=${encodeURIComponent(topic)}`,
      type: 'coursera' as const,
      duration: 'Self-paced'
    }];
  }
}

// Helper: Add learning resources to career roadmaps with rate limiting
async function addLearningResourcesToRoadmaps(careers: CareerRoadmap[]): Promise<CareerRoadmap[]> {
  console.log('📚 Adding YouTube and Coursera content to roadmaps...');

  // Add delay between API calls to avoid rate limiting
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const updatedCareers = [];

  for (const career of careers) {
    const updatedStages = [];

    for (const stage of career.stages) {
      try {
        console.log(`🔍 Fetching resources for: ${stage.title}`);

        // Add delay between requests
        await delay(500);

        // Try to get YouTube videos with fallback
        let youtubeVideos: LearningResource[] = [];
        try {
          youtubeVideos = await getYouTubeVideosForTopic(stage.title, stage.skills);
        } catch (error) {
          console.warn(`⚠️ YouTube API failed for ${stage.title}, using fallback`);
          youtubeVideos = [{
            title: `${stage.title} - Complete Tutorial`,
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(stage.title + ' tutorial')}`,
            type: 'youtube' as const
          }];
        }

        // Add delay before Coursera request
        await delay(500);

        // Try to get Coursera content with fallback
        let courseraContent: LearningResource[] = [];
        try {
          courseraContent = await getCourseraContentForTopic(stage.title, stage.skills);
        } catch (error) {
          console.warn(`⚠️ Coursera API failed for ${stage.title}, using fallback`);
          courseraContent = [{
            title: `${stage.title} - Professional Course`,
            url: `https://www.coursera.org/search?query=${encodeURIComponent(stage.title)}`,
            type: 'coursera' as const,
            duration: 'Self-paced'
          }];
        }

        updatedStages.push({
          ...stage,
          youtubeVideos,
          courseraContent
        });

      } catch (error) {
        console.error(`❌ Error adding resources to stage ${stage.title}:`, error);
        updatedStages.push({
          ...stage,
          youtubeVideos: [{
            title: `${stage.title} - Tutorial`,
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(stage.title)}`,
            type: 'youtube' as const
          }],
          courseraContent: [{
            title: `${stage.title} - Course`,
            url: `https://www.coursera.org/search?query=${encodeURIComponent(stage.title)}`,
            type: 'coursera' as const
          }]
        });
      }
    }

    updatedCareers.push({
      ...career,
      stages: updatedStages
    });
  }

  console.log('✅ Successfully added learning resources to all roadmaps');
  return updatedCareers;
}

function getFallbackCareerRoadmaps(): CareerRoadmap[] {
  return [
    {
      career: "Data Analyst",
      description: "Analyze data to extract insights and support business decisions using statistical methods and visualization tools",
      totalStages: 4,
      estimatedDuration: "12-18 months",
      stages: [
        {
          stage: 1,
          title: "Foundations of Data",
          description: "Build fundamental data skills and understanding",
          skills: ["Excel/Google Sheets", "SQL", "Basic Statistics"],
          learningPoints: [
            "Learn Excel/Google Sheets (basic formulas, pivot tables)",
            "Learn SQL (data querying, joins, filtering)",
            "Understand data types, cleaning, and basic statistics"
          ],
          youtubeVideos: [{
            title: "Excel for Data Analysis - Complete Tutorial",
            url: "https://www.youtube.com/results?search_query=excel+data+analysis+tutorial",
            type: "youtube" as const
          }],
          courseraContent: [{
            title: "Data Analysis with Excel",
            url: "https://www.coursera.org/search?query=excel+data+analysis",
            type: "coursera" as const,
            duration: "4 weeks"
          }]
        },
        {
          stage: 2,
          title: "Programming & Data Handling",
          description: "Master programming tools for data manipulation",
          skills: ["Python", "Pandas", "NumPy", "Data Cleaning"],
          learningPoints: [
            "Learn Python (or R): NumPy, Pandas for data manipulation",
            "Work with CSV, Excel, databases",
            "Learn data cleaning & transformation techniques"
          ],
          youtubeVideos: [{
            title: "Python for Data Science - Complete Course",
            url: "https://www.youtube.com/results?search_query=python+pandas+data+science",
            type: "youtube" as const
          }],
          courseraContent: [{
            title: "Python for Data Science",
            url: "https://www.coursera.org/search?query=python+data+science",
            type: "coursera" as const,
            duration: "6 weeks"
          }]
        },
        {
          stage: 3,
          title: "Data Visualization & Tools",
          description: "Create compelling visualizations and reports",
          skills: ["Matplotlib", "Seaborn", "Power BI", "Tableau"],
          learningPoints: [
            "Use visualization libraries: Matplotlib, Seaborn, Plotly",
            "Learn BI Tools: Power BI or Tableau",
            "Create dashboards & reports"
          ],
          youtubeVideos: [{
            title: "Tableau Complete Tutorial",
            url: "https://www.youtube.com/results?search_query=tableau+tutorial+complete",
            type: "youtube" as const
          }],
          courseraContent: [{
            title: "Data Visualization with Tableau",
            url: "https://www.coursera.org/search?query=tableau+data+visualization",
            type: "coursera" as const,
            duration: "4 weeks"
          }]
        },
        {
          stage: 4,
          title: "Projects & Career Prep",
          description: "Build portfolio and prepare for job market",
          skills: ["Portfolio Building", "GitHub", "Interview Prep"],
          learningPoints: [
            "Build real-world projects (sales analysis, customer trends, etc.)",
            "Share on GitHub or Kaggle",
            "Prepare for interviews: case studies, SQL & Excel tasks"
          ],
          youtubeVideos: [{
            title: "Data Analyst Portfolio Projects",
            url: "https://www.youtube.com/results?search_query=data+analyst+portfolio+projects",
            type: "youtube" as const
          }],
          courseraContent: [{
            title: "Data Analysis Capstone Project",
            url: "https://www.coursera.org/search?query=data+analysis+capstone",
            type: "coursera" as const,
            duration: "8 weeks"
          }]
        }
      ]
    }
  ];
}

// Helper: Fetch a YouTube video for a given topic using youtube138.p.rapidapi.com
async function getYouTubeVideoForTopic(topic: string, skills: string[] = []): Promise<string | undefined> {
  try {
    // Create a more specific search query
    const searchQuery = `${topic} ${skills.join(' ')} tutorial learn`;
    const url = `https://youtube138.p.rapidapi.com/search/?q=${encodeURIComponent(searchQuery)}&hl=en&gl=US`;

    console.log(`🔍 Searching YouTube for: ${searchQuery}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': YOUTUBE_RAPIDAPI_KEY,
        'x-rapidapi-host': 'youtube138.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      console.warn(`⚠️ YouTube API error: ${response.status} ${response.statusText}`);
      return undefined;
    }

    const data = await response.json();

    // Find the first video result
    const video = data.contents?.find((item: any) => item.type === 'video');

    if (video && video.video && video.video.videoId) {
      const videoUrl = `https://www.youtube.com/watch?v=${video.video.videoId}`;
      console.log(`✅ Found video: ${video.video.title}`);
      return videoUrl;
    }

    console.warn(`⚠️ No video found for: ${searchQuery}`);
    return undefined;
  } catch (error) {
    console.error(`❌ Error fetching YouTube video for "${topic}":`, error);
    return undefined;
  }
}



// Main controller: Analyze answers, generate roadmap, attach YouTube videos
export const generateCareerRoadmap = async (req: Request, res: Response) => {
  try {
    console.log('🎯 Starting career roadmap generation...');

    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: 'Assessment answers are required and must be an array'
      });
    }

    console.log(`📝 Processing ${answers.length} assessment answers`);

    // 1. Get career roadmaps from Gemini
    const careers = await getCareerRoadmapFromGemini(answers);
    console.log(`🛤️ Generated ${careers.length} career roadmap(s)`);

    // 2. Add YouTube and Coursera content to each stage
    const careersWithResources = await addLearningResourcesToRoadmaps(careers);

    // 3. Return structured response
    const response = {
      success: true,
      data: {
        careers: careersWithResources,
        totalCareers: careersWithResources.length,
        totalStages: careersWithResources.reduce((total, career) => total + career.stages.length, 0),
        generatedAt: new Date().toISOString()
      }
    };

    console.log('✅ Career roadmap generated successfully');
    res.json(response);

  } catch (error: any) {
    console.error('❌ Career roadmap generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate career roadmap'
    });
  }
};