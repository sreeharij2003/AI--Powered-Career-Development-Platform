import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Assessment } from "@/data/assessmentQuestions";
import { ArrowLeft, Timer } from "lucide-react";
import { useState } from "react";

interface AssessmentQuizProps {
  assessment: Assessment;
  onComplete: (analysisResult: any) => void;
  onBack: () => void;
}

const AssessmentQuiz = ({ assessment, onComplete, onBack }: AssessmentQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(assessment.questions.length).fill(-1));
  const [selectedOption, setSelectedOption] = useState<number>(-1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleNext = async () => {
    if (selectedOption !== -1) {
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = selectedOption;
      setAnswers(newAnswers);
      setSelectedOption(-1);

      if (currentQuestion < assessment.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // Assessment completed - analyze with Gemini API
        setIsAnalyzing(true);

        try {
          // Prepare assessment data for analysis
          const assessmentData = {
            assessmentId: assessment.id,
            assessmentTitle: assessment.title,
            answers: assessment.questions.map((question, index) => ({
              questionId: question.id,
              selectedOption: newAnswers[index],
              question: question.question,
              options: question.options,
              correctAnswer: question.correctAnswer,
              explanation: question.explanation
            })),
            completedAt: new Date().toISOString()
          };

          // Send to backend for Gemini analysis
          const response = await fetch('/api/skill-assessment/analyze', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(assessmentData),
          });

          if (!response.ok) {
            throw new Error('Failed to analyze assessment');
          }

          const analysisResult = await response.json();
          onComplete(analysisResult);

        } catch (error) {
          console.error('Error analyzing assessment:', error);
          // Fallback to basic analysis
          const correctAnswers = newAnswers.filter((answer, index) =>
            answer === assessment.questions[index].correctAnswer
          ).length;
          const score = Math.round((correctAnswers / assessment.questions.length) * 100);

          onComplete({
            success: true,
            data: {
              assessmentId: assessment.id,
              assessmentTitle: assessment.title,
              basicResults: {
                score,
                correctAnswers,
                totalQuestions: assessment.questions.length,
                percentage: score
              },
              detailedAnalysis: {
                overallAssessment: {
                  performanceLevel: score >= 80 ? 'Good' : score >= 60 ? 'Average' : 'Needs Improvement',
                  summary: `You scored ${score}% on the ${assessment.title} assessment.`,
                  keyInsights: [`Answered ${correctAnswers} out of ${assessment.questions.length} questions correctly`]
                },
                error: 'Detailed analysis unavailable'
              }
            }
          });
        } finally {
          setIsAnalyzing(false);
        }
      }
    }
  };

  const question = assessment.questions[currentQuestion];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <Button variant="ghost" className="w-fit -ml-4 mb-4" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assessments
        </Button>
        <CardTitle>{assessment.title}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground mt-2">
          <Timer className="h-4 w-4 mr-2" />
          Question {currentQuestion + 1} of {assessment.questions.length}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium">{question.question}</h3>
          <RadioGroup 
            value={selectedOption.toString()} 
            onValueChange={(value) => setSelectedOption(parseInt(value))}
          >
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <label htmlFor={`option-${index}`} className="text-sm">
                  {option}
                </label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleNext}
          disabled={selectedOption === -1 || isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Analyzing with AI...
            </>
          ) : (
            currentQuestion === assessment.questions.length - 1 ? "Complete Assessment" : "Next Question"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AssessmentQuiz; 