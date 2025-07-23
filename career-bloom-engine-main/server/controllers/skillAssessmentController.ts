import { Request, Response } from 'express';
import { GeminiService } from '../src/services/geminiService';

const geminiService = new GeminiService();

interface AssessmentAnswer {
  questionId: number;
  selectedOption: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface AssessmentSubmission {
  assessmentId: number;
  assessmentTitle: string;
  answers: AssessmentAnswer[];
  completedAt: string;
}

/**
 * Analyze skill assessment results using Gemini API
 */
export const analyzeAssessmentResults = async (req: Request, res: Response) => {
  try {
    console.log('🧠 Starting skill assessment analysis with Gemini...');

    const { assessmentId, assessmentTitle, answers }: AssessmentSubmission = req.body;

    if (!assessmentId || !assessmentTitle || !answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: 'Assessment ID, title, and answers array are required'
      });
    }

    if (answers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one answer is required'
      });
    }

    console.log(`📊 Analyzing ${answers.length} answers for assessment: ${assessmentTitle}`);

    // Calculate basic score
    const correctAnswers = answers.filter(answer => 
      answer.selectedOption === answer.correctAnswer
    ).length;
    const totalQuestions = answers.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    console.log(`📈 Basic score calculated: ${score}% (${correctAnswers}/${totalQuestions})`);

    // Prepare data for Gemini analysis
    const analysisData = {
      assessmentTitle,
      totalQuestions,
      correctAnswers,
      score,
      answers: answers.map(answer => ({
        question: answer.question,
        selectedOption: answer.options[answer.selectedOption],
        correctOption: answer.options[answer.correctAnswer],
        isCorrect: answer.selectedOption === answer.correctAnswer,
        explanation: answer.explanation
      }))
    };

    // Get detailed analysis from Gemini
    const geminiAnalysis = await analyzeWithGemini(analysisData);

    // Prepare final response
    const response = {
      success: true,
      data: {
        assessmentId,
        assessmentTitle,
        basicResults: {
          score,
          correctAnswers,
          totalQuestions,
          percentage: score
        },
        detailedAnalysis: geminiAnalysis,
        completedAt: new Date().toISOString()
      }
    };

    console.log('✅ Assessment analysis completed successfully');
    res.json(response);

  } catch (error: any) {
    console.error('❌ Error analyzing assessment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze assessment results',
      details: error.message
    });
  }
};

/**
 * Use Gemini API to provide detailed analysis of assessment results
 */
async function analyzeWithGemini(data: any): Promise<any> {
  try {
    console.log('🤖 Sending assessment data to Gemini for analysis...');

    const prompt = `
You are an expert skill assessment analyzer. Analyze the following assessment results and provide detailed feedback.

Assessment: ${data.assessmentTitle}
Score: ${data.score}% (${data.correctAnswers}/${data.totalQuestions} correct)

Detailed Answers:
${data.answers.map((answer: any, index: number) => `
Question ${index + 1}: ${answer.question}
Selected Answer: ${answer.selectedOption}
Correct Answer: ${answer.correctOption}
Result: ${answer.isCorrect ? '✅ Correct' : '❌ Incorrect'}
Explanation: ${answer.explanation}
`).join('\n')}

Please provide a comprehensive analysis in the following JSON format:
{
  "overallAssessment": {
    "performanceLevel": "Excellent|Good|Average|Needs Improvement",
    "summary": "Brief overall summary of performance",
    "keyInsights": ["insight1", "insight2", "insight3"]
  },
  "strengths": {
    "areas": ["strength1", "strength2", "strength3"],
    "explanation": "Detailed explanation of strengths"
  },
  "weaknesses": {
    "areas": ["weakness1", "weakness2", "weakness3"],
    "explanation": "Detailed explanation of areas needing improvement"
  },
  "wrongAnswerAnalysis": [
    {
      "questionNumber": 1,
      "question": "question text",
      "yourAnswer": "selected option",
      "correctAnswer": "correct option",
      "explanation": "Why the correct answer is right and why the selected answer was wrong",
      "learningTip": "Specific tip to understand this concept better"
    }
  ],
  "recommendations": {
    "studyTopics": ["topic1", "topic2", "topic3"],
    "practiceAreas": ["area1", "area2", "area3"],
    "nextSteps": ["step1", "step2", "step3"]
  },
  "skillLevel": {
    "current": "Beginner|Intermediate|Advanced",
    "target": "Intermediate|Advanced|Expert",
    "improvementPath": "Specific path to reach target level"
  }
}

Focus especially on providing detailed explanations for wrong answers and actionable recommendations for improvement.
`;

    const result = await geminiService.generateContent(prompt);
    
    if (!result || typeof result !== 'string') {
      throw new Error('Invalid response from Gemini API');
    }

    // Try to extract JSON from the response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      console.log('✅ Gemini analysis completed successfully');
      return analysis;
    } else {
      // Fallback if JSON parsing fails
      console.log('⚠️ Could not parse JSON from Gemini, using fallback analysis');
      return createFallbackAnalysis(data);
    }

  } catch (error: any) {
    console.error('❌ Error in Gemini analysis:', error);
    console.log('🔄 Using fallback analysis...');
    return createFallbackAnalysis(data);
  }
}

/**
 * Create fallback analysis when Gemini API is unavailable
 */
function createFallbackAnalysis(data: any): any {
  const wrongAnswers = data.answers.filter((answer: any) => !answer.isCorrect);
  
  return {
    overallAssessment: {
      performanceLevel: data.score >= 80 ? 'Good' : data.score >= 60 ? 'Average' : 'Needs Improvement',
      summary: `You scored ${data.score}% on the ${data.assessmentTitle} assessment.`,
      keyInsights: [
        `Answered ${data.correctAnswers} out of ${data.totalQuestions} questions correctly`,
        wrongAnswers.length > 0 ? `Need to review ${wrongAnswers.length} concepts` : 'Strong performance across all areas',
        'Continue practicing to improve your skills'
      ]
    },
    strengths: {
      areas: data.score >= 70 ? ['Good foundational knowledge', 'Problem-solving skills'] : ['Effort and dedication'],
      explanation: data.score >= 70 ? 'You demonstrate solid understanding of key concepts.' : 'You show commitment to learning and improvement.'
    },
    weaknesses: {
      areas: wrongAnswers.length > 0 ? ['Concept clarity', 'Practice needed'] : ['Minor areas for refinement'],
      explanation: wrongAnswers.length > 0 ? 'Some concepts need additional study and practice.' : 'Overall strong performance with room for minor improvements.'
    },
    wrongAnswerAnalysis: wrongAnswers.map((answer: any, index: number) => ({
      questionNumber: data.answers.indexOf(answer) + 1,
      question: answer.question,
      yourAnswer: answer.selectedOption,
      correctAnswer: answer.correctOption,
      explanation: answer.explanation,
      learningTip: 'Review the explanation and practice similar problems.'
    })),
    recommendations: {
      studyTopics: wrongAnswers.length > 0 ? ['Review incorrect concepts', 'Practice more problems'] : ['Advanced topics', 'Real-world applications'],
      practiceAreas: ['Hands-on exercises', 'Mock assessments', 'Peer discussions'],
      nextSteps: ['Study recommended topics', 'Take practice tests', 'Seek additional resources']
    },
    skillLevel: {
      current: data.score >= 80 ? 'Advanced' : data.score >= 60 ? 'Intermediate' : 'Beginner',
      target: data.score >= 80 ? 'Expert' : data.score >= 60 ? 'Advanced' : 'Intermediate',
      improvementPath: 'Focus on weak areas, practice regularly, and seek mentorship.'
    }
  };
}

/**
 * Get available skill assessments
 */
export const getSkillAssessments = async (req: Request, res: Response) => {
  try {
    // This will be populated with 15-question assessments
    const assessments = [
      {
        id: 1,
        title: "Frontend Development Skills",
        description: "Comprehensive test covering React, JavaScript, HTML, CSS, and modern frontend practices",
        difficulty: "Intermediate",
        estimatedTime: "25 minutes",
        questionCount: 15,
        skills: ["React", "JavaScript", "CSS", "HTML", "Frontend Architecture"]
      },
      {
        id: 2,
        title: "Backend Development Skills", 
        description: "In-depth assessment of Node.js, Express, databases, and server-side development",
        difficulty: "Advanced",
        estimatedTime: "30 minutes",
        questionCount: 15,
        skills: ["Node.js", "Express", "MongoDB", "SQL", "API Development"]
      },
      {
        id: 3,
        title: "Data Structures & Algorithms",
        description: "Comprehensive evaluation of fundamental computer science concepts and problem-solving",
        difficulty: "Advanced", 
        estimatedTime: "35 minutes",
        questionCount: 15,
        skills: ["Algorithms", "Data Structures", "Problem Solving", "Complexity Analysis"]
      }
    ];

    res.json({
      success: true,
      data: assessments
    });

  } catch (error: any) {
    console.error('❌ Error fetching assessments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch skill assessments'
    });
  }
};
