import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { assessments } from "@/data/assessmentQuestions";
import { Brain, Check, Timer } from "lucide-react";
import { useState } from "react";
import AssessmentQuiz from "./AssessmentQuiz";

interface CompletedAssessment {
  id: number;
  title: string;
  completedDate: string;
  score: number;
  strengths: string[];
  improvements: string[];
}

const SkillsAssessment = () => {
  const [activeTab, setActiveTab] = useState("available");
  const [selectedAssessment, setSelectedAssessment] = useState<number | null>(null);
  const [completedAssessments, setCompletedAssessments] = useState<CompletedAssessment[]>([]);

  const handleStartAssessment = (id: number) => {
    setSelectedAssessment(id);
  };

  const handleCompleteAssessment = (score: number, feedback: { strengths: string[]; improvements: string[] }) => {
    const assessment = assessments.find(a => a.id === selectedAssessment);
    if (assessment) {
      const completedAssessment: CompletedAssessment = {
        id: assessment.id,
        title: assessment.title,
        completedDate: new Date().toLocaleDateString(),
        score,
        strengths: feedback.strengths,
        improvements: feedback.improvements,
      };
      setCompletedAssessments([...completedAssessments, completedAssessment]);
      setSelectedAssessment(null);
      setActiveTab("completed");
    }
  };

  const handleBack = () => {
    setSelectedAssessment(null);
  };

  if (selectedAssessment) {
    const assessment = assessments.find(a => a.id === selectedAssessment);
    if (assessment) {
      return (
        <AssessmentQuiz
          assessment={assessment}
          onComplete={handleCompleteAssessment}
          onBack={handleBack}
        />
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Skills Assessment</h2>
          <p className="text-muted-foreground">
            Evaluate your skills and discover opportunities for growth
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={activeTab === "available" ? "default" : "outline"}
            onClick={() => setActiveTab("available")}
          >
            Available
          </Button>
          <Button
            variant={activeTab === "completed" ? "default" : "outline"}
            onClick={() => setActiveTab("completed")}
          >
            Completed
          </Button>
        </div>
      </div>

      {activeTab === "available" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assessments.map((assessment) => (
            <Card key={assessment.id} className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {assessment.title}
                  <Badge variant="outline">{assessment.difficulty}</Badge>
                </CardTitle>
                <CardDescription>{assessment.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <Timer className="h-4 w-4 mr-2" />
                  {assessment.estimatedTime}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Skills Covered:</p>
                  <div className="flex flex-wrap gap-1">
                    {assessment.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleStartAssessment(assessment.id)}
                >
                  Start Assessment
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {completedAssessments.map((assessment) => (
            <Card key={assessment.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{assessment.title}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Completed {assessment.completedDate}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <div className="text-sm font-medium">Your Score</div>
                    <div className="text-sm font-medium">{assessment.score}%</div>
                  </div>
                  <Progress value={assessment.score} className="h-2" />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Strengths
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1 pl-6 list-disc">
                      {assessment.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium">
                      <Brain className="h-4 w-4 mr-2 text-amber-500" />
                      Areas for Improvement
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1 pl-6 list-disc">
                      {assessment.improvements.map((improvement, index) => (
                        <li key={index}>{improvement}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View Detailed Results
                </Button>
              </CardFooter>
            </Card>
          ))}

          {completedAssessments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No completed assessments yet.</p>
              <Button
                variant="link"
                className="mt-2"
                onClick={() => setActiveTab("available")}
              >
                Start an Assessment
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillsAssessment; 