import express from 'express';
import { geminiService } from '../services/geminiService';

const router = express.Router();

// Generate content for resume sections
router.post('/generate-content', async (req, res) => {
  try {
    const { section, context } = req.body;

    if (!section || !context) {
      return res.status(400).json({
        success: false,
        error: 'Section and context are required'
      });
    }

    console.log(`🤖 Generating ${section} content with Gemini...`);
    console.log('Context:', context);

    const generatedContent = await geminiService.generateResumeContent(section, context);

    console.log(`✅ Generated ${section} content:`, generatedContent);

    res.json({
      success: true,
      data: {
        section,
        content: generatedContent
      }
    });

  } catch (error: any) {
    console.error('❌ Error generating content:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate content'
    });
  }
});

// Generate summary specifically
router.post('/generate-summary', async (req, res) => {
  try {
    const { dreamJob, personalInfo, skills, education } = req.body;

    if (!dreamJob) {
      return res.status(400).json({
        success: false,
        error: 'Dream job is required'
      });
    }

    const context = {
      dreamJob,
      currentRole: personalInfo?.jobTitle,
      experience: personalInfo?.experience,
      skills: skills?.map((s: any) => s.name) || [],
      education: education?.[0]?.degree
    };

    const summary = await geminiService.generateResumeContent('summary', context);

    res.json({
      success: true,
      data: {
        summary
      }
    });

  } catch (error: any) {
    console.error('❌ Error generating summary:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate summary'
    });
  }
});

// Generate experience description
router.post('/generate-experience', async (req, res) => {
  try {
    const { dreamJob, company, position, responsibilities, achievements } = req.body;

    if (!dreamJob || !company || !position) {
      return res.status(400).json({
        success: false,
        error: 'Dream job, company, and position are required'
      });
    }

    const context = {
      dreamJob,
      company,
      position,
      responsibilities,
      achievements
    };

    const description = await geminiService.generateResumeContent('experience', context);

    res.json({
      success: true,
      data: {
        description
      }
    });

  } catch (error: any) {
    console.error('❌ Error generating experience:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate experience description'
    });
  }
});

// Generate project description
router.post('/generate-project', async (req, res) => {
  try {
    const { dreamJob, projectName, technologies, description, impact } = req.body;

    if (!dreamJob || !projectName) {
      return res.status(400).json({
        success: false,
        error: 'Dream job and project name are required'
      });
    }

    const context = {
      dreamJob,
      projectName,
      technologies,
      description,
      impact
    };

    const projectDescription = await geminiService.generateResumeContent('projects', context);

    res.json({
      success: true,
      data: {
        description: projectDescription
      }
    });

  } catch (error: any) {
    console.error('❌ Error generating project description:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate project description'
    });
  }
});

// Generate skills suggestions
router.post('/generate-skills', async (req, res) => {
  try {
    const { dreamJob, currentSkills, experienceLevel } = req.body;

    if (!dreamJob) {
      return res.status(400).json({
        success: false,
        error: 'Dream job is required'
      });
    }

    const context = {
      dreamJob,
      currentSkills: currentSkills?.map((s: any) => s.name) || [],
      experienceLevel
    };

    const skills = await geminiService.generateResumeContent('skills', context);

    res.json({
      success: true,
      data: {
        skills: skills.split(',').map(skill => skill.trim())
      }
    });

  } catch (error: any) {
    console.error('❌ Error generating skills:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate skills'
    });
  }
});

export default router;
