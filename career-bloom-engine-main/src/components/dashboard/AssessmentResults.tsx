import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    AlertCircle,
    ArrowLeft,
    BookOpen,
    Brain,
    CheckCircle,
    Lightbulb,
    Target,
    TrendingUp,
    XCircle
} from "lucide-react";

interface AssessmentResultsProps {
  result: {
    assessmentTitle: string;
    basicResults: {
      score: number;
      correctAnswers: number;
      totalQuestions: number;
      percentage: number;
    };
    detailedAnalysis: {
      overallAssessment: {
        performanceLevel: string;
        summary: string;
        keyInsights: string[];
      };
      strengths: {
        areas: string[];
        explanation: string;
      };
      weaknesses: {
        areas: string[];
        explanation: string;
      };
      wrongAnswerAnalysis: Array<{
        questionNumber: number;
        question: string;
        yourAnswer: string;
        correctAnswer: string;
        explanation: string;
        learningTip: string;
      }>;
      recommendations: {
        studyTopics: string[];
        practiceAreas: string[];
        nextSteps: string[];
      };
      skillLevel: {
        current: string;
        target: string;
        improvementPath: string;
      };
    };
  };
  onBack: () => void;
}

const AssessmentResults = ({ result, onBack }: AssessmentResultsProps) => {
  const { basicResults, detailedAnalysis } = result;

  const getPerformanceColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'average': return 'text-yellow-600';
      case 'needs improvement': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <Button variant="ghost" className="w-fit -ml-4 mb-4" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessments
          </Button>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {result.assessmentTitle} - Results
          </CardTitle>
          <CardDescription>
            AI-powered analysis of your performance
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(basicResults.score)}`}>
              {basicResults.score}%
            </div>
            <p className="text-muted-foreground">
              {basicResults.correctAnswers} out of {basicResults.totalQuestions} questions correct
            </p>
          </div>
          
          <Progress value={basicResults.score} className="w-full" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className={`text-lg font-semibold ${getPerformanceColor(detailedAnalysis.overallAssessment.performanceLevel)}`}>
                {detailedAnalysis.overallAssessment.performanceLevel}
              </div>
              <p className="text-sm text-muted-foreground">Performance Level</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {detailedAnalysis.skillLevel.current}
              </div>
              <p className="text-sm text-muted-foreground">Current Level</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {detailedAnalysis.skillLevel.target}
              </div>
              <p className="text-sm text-muted-foreground">Target Level</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{detailedAnalysis.overallAssessment.summary}</p>
          <ul className="space-y-2">
            {detailedAnalysis.overallAssessment.keyInsights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{insight}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {detailedAnalysis.strengths.explanation}
            </p>
            <div className="flex flex-wrap gap-2">
              {detailedAnalysis.strengths.areas.map((strength, index) => (
                <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                  {strength}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {detailedAnalysis.weaknesses.explanation}
            </p>
            <div className="flex flex-wrap gap-2">
              {detailedAnalysis.weaknesses.areas.map((weakness, index) => (
                <Badge key={index} variant="secondary" className="bg-red-100 text-red-800">
                  {weakness}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wrong Answer Analysis */}
      {detailedAnalysis.wrongAnswerAnalysis && detailedAnalysis.wrongAnswerAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Detailed Answer Analysis
            </CardTitle>
            <CardDescription>
              Understanding your incorrect answers to improve learning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {detailedAnalysis.wrongAnswerAnalysis.map((analysis, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs">
                    Q{analysis.questionNumber}
                  </Badge>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-2">{analysis.question}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-red-600">Your Answer: </span>
                        <span>{analysis.yourAnswer}</span>
                      </div>
                      <div>
                        <span className="font-medium text-green-600">Correct Answer: </span>
                        <span>{analysis.correctAnswer}</span>
                      </div>
                    </div>
                    <hr className="my-3 border-gray-200" />
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-blue-600">Explanation: </span>
                        <span className="text-sm">{analysis.explanation}</span>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-md">
                        <span className="font-medium text-blue-700">💡 Learning Tip: </span>
                        <span className="text-sm text-blue-700">{analysis.learningTip}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recommendations for Improvement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Study Topics
            </h4>
            <div className="flex flex-wrap gap-2">
              {detailedAnalysis.recommendations.studyTopics.map((topic, index) => (
                <Badge key={index} variant="outline">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Practice Areas</h4>
            <ul className="space-y-1">
              {detailedAnalysis.recommendations.practiceAreas.map((area, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-3 w-3 text-blue-500" />
                  {area}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-3">Next Steps</h4>
            <ol className="space-y-1">
              {detailedAnalysis.recommendations.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Badge variant="outline" className="text-xs min-w-fit">
                    {index + 1}
                  </Badge>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Improvement Path</h4>
            <p className="text-sm text-muted-foreground">
              {detailedAnalysis.skillLevel.improvementPath}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentResults;
