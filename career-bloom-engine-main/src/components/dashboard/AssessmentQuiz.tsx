import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Assessment } from "@/data/assessmentQuestions";
import { ArrowLeft, Timer } from "lucide-react";
import { useState } from "react";

interface AssessmentQuizProps {
  assessment: Assessment;
  onComplete: (score: number, feedback: { strengths: string[]; improvements: string[] }) => void;
  onBack: () => void;
}

const AssessmentQuiz = ({ assessment, onComplete, onBack }: AssessmentQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(assessment.questions.length).fill(-1));
  const [selectedOption, setSelectedOption] = useState<number>(-1);

  const handleNext = () => {
    if (selectedOption !== -1) {
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = selectedOption;
      setAnswers(newAnswers);
      setSelectedOption(-1);

      if (currentQuestion < assessment.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // Calculate score and generate feedback
        const correctAnswers = answers.filter((answer, index) => 
          answer === assessment.questions[index].correctAnswer
        ).length;
        const score = Math.round((correctAnswers / assessment.questions.length) * 100);

        // Generate feedback based on answers
        const strengths: string[] = [];
        const improvements: string[] = [];

        assessment.questions.forEach((question, index) => {
          if (answers[index] === question.correctAnswer) {
            strengths.push(...assessment.skills);
          } else {
            improvements.push(...assessment.skills);
          }
        });

        onComplete(score, {
          strengths: [...new Set(strengths)],
          improvements: [...new Set(improvements)]
        });
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
          disabled={selectedOption === -1}
        >
          {currentQuestion === assessment.questions.length - 1 ? "Complete Assessment" : "Next Question"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AssessmentQuiz; 