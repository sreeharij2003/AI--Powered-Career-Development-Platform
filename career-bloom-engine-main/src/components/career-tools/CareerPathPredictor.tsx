import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { API } from "@/services/api";
import { ArrowRight, Award, BookOpen, BrainCircuit, Clock, Lightbulb, Upload } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

// Career domains for assessment
const CAREER_DOMAINS = [
  {
    id: "tech",
    name: "Technology",
    description: "Computer science, software development, IT infrastructure, data science, cybersecurity",
    icon: <BrainCircuit className="h-5 w-5" />
  },
  {
    id: "business",
    name: "Business",
    description: "Management, finance, marketing, entrepreneurship, consulting",
    icon: <Lightbulb className="h-5 w-5" />
  },
  {
    id: "creative",
    name: "Creative",
    description: "Design, writing, art, music, film, architecture",
    icon: <Lightbulb className="h-5 w-5" />
  },
  {
    id: "healthcare",
    name: "Healthcare",
    description: "Medicine, nursing, pharmacy, public health, medical research",
    icon: <Lightbulb className="h-5 w-5" />
  },
  {
    id: "education",
    name: "Education",
    description: "Teaching, academic research, educational administration, training",
    icon: <Lightbulb className="h-5 w-5" />
  },
  {
    id: "science",
    name: "Science",
    description: "Research, laboratory work, environmental science, physics, chemistry, biology",
    icon: <Lightbulb className="h-5 w-5" />
  }
];

// Assessment questions by domain
const ASSESSMENT_QUESTIONS = {
  tech: [
    {
      id: "tech_1",
      question: "How much do you enjoy solving complex logical problems?",
      options: ["Not at all", "Somewhat", "Moderately", "Very much", "Extremely"]
    },
    {
      id: "tech_2",
      question: "How comfortable are you learning new technologies?",
      options: ["Not comfortable", "Slightly comfortable", "Moderately comfortable", "Very comfortable", "Extremely comfortable"]
    },
    {
      id: "tech_3",
      question: "Do you prefer working with data, interfaces, or systems?",
      options: ["Data", "Interfaces", "Systems", "A mix of them", "Not sure"]
    },
    {
      id: "tech_4",
      question: "How interested are you in understanding how things work under the hood?",
      options: ["Not interested", "Slightly interested", "Moderately interested", "Very interested", "Extremely interested"]
    }
  ],
  business: [
    {
      id: "business_1",
      question: "How comfortable are you making decisions that affect others?",
      options: ["Not comfortable", "Slightly comfortable", "Moderately comfortable", "Very comfortable", "Extremely comfortable"]
    },
    {
      id: "business_2",
      question: "Do you enjoy analyzing financial data and market trends?",
      options: ["Not at all", "Somewhat", "Moderately", "Very much", "Extremely"]
    },
    {
      id: "business_3",
      question: "How important is leadership to you in your career?",
      options: ["Not important", "Slightly important", "Moderately important", "Very important", "Extremely important"]
    },
    {
      id: "business_4",
      question: "Are you interested in developing business strategies?",
      options: ["Not interested", "Slightly interested", "Moderately interested", "Very interested", "Extremely interested"]
    }
  ],
  creative: [
    {
      id: "creative_1",
      question: "How often do you engage in creative activities?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Very often"]
    },
    {
      id: "creative_2",
      question: "How important is artistic expression to you?",
      options: ["Not important", "Slightly important", "Moderately important", "Very important", "Extremely important"]
    },
    {
      id: "creative_3",
      question: "Do you prefer structured or free-form creative work?",
      options: ["Highly structured", "Somewhat structured", "Balanced", "Somewhat free-form", "Highly free-form"]
    },
    {
      id: "creative_4",
      question: "How comfortable are you receiving feedback on creative work?",
      options: ["Not comfortable", "Slightly comfortable", "Moderately comfortable", "Very comfortable", "Extremely comfortable"]
    }
  ],
  healthcare: [
    {
      id: "healthcare_1",
      question: "How important is helping others directly to you?",
      options: ["Not important", "Slightly important", "Moderately important", "Very important", "Extremely important"]
    },
    {
      id: "healthcare_2",
      question: "Are you comfortable working in high-pressure situations?",
      options: ["Not comfortable", "Slightly comfortable", "Moderately comfortable", "Very comfortable", "Extremely comfortable"]
    },
    {
      id: "healthcare_3",
      question: "How interested are you in human biology and health?",
      options: ["Not interested", "Slightly interested", "Moderately interested", "Very interested", "Extremely interested"]
    },
    {
      id: "healthcare_4",
      question: "Would you prefer research or direct patient care?",
      options: ["Definitely research", "Leaning toward research", "Equal interest", "Leaning toward patient care", "Definitely patient care"]
    }
  ],
  education: [
    {
      id: "education_1",
      question: "How much do you enjoy explaining concepts to others?",
      options: ["Not at all", "Somewhat", "Moderately", "Very much", "Extremely"]
    },
    {
      id: "education_2",
      question: "Are you patient when others don't understand something quickly?",
      options: ["Not patient", "Slightly patient", "Moderately patient", "Very patient", "Extremely patient"]
    },
    {
      id: "education_3",
      question: "How important is continuous learning to you?",
      options: ["Not important", "Slightly important", "Moderately important", "Very important", "Extremely important"]
    },
    {
      id: "education_4",
      question: "Would you prefer teaching children or adults?",
      options: ["Definitely children", "Leaning toward children", "No preference", "Leaning toward adults", "Definitely adults"]
    }
  ],
  science: [
    {
      id: "science_1",
      question: "How curious are you about how the natural world works?",
      options: ["Not curious", "Slightly curious", "Moderately curious", "Very curious", "Extremely curious"]
    },
    {
      id: "science_2",
      question: "Do you enjoy conducting experiments and analyzing results?",
      options: ["Not at all", "Somewhat", "Moderately", "Very much", "Extremely"]
    },
    {
      id: "science_3",
      question: "How comfortable are you with mathematical concepts?",
      options: ["Not comfortable", "Slightly comfortable", "Moderately comfortable", "Very comfortable", "Extremely comfortable"]
    },
    {
      id: "science_4",
      question: "Do you prefer theoretical or applied science?",
      options: ["Strongly theoretical", "Somewhat theoretical", "Balanced", "Somewhat applied", "Strongly applied"]
    }
  ]
};

// General questions about work preferences
const GENERAL_QUESTIONS = [
  {
    id: "general_1",
    question: "Do you prefer working alone or in teams?",
    options: ["Strongly prefer alone", "Somewhat prefer alone", "No preference", "Somewhat prefer teams", "Strongly prefer teams"]
  },
  {
    id: "general_2",
    question: "How important is work-life balance to you?",
    options: ["Not important", "Slightly important", "Moderately important", "Very important", "Extremely important"]
  },
  {
    id: "general_3",
    question: "Do you prefer stable, predictable work or variety and change?",
    options: ["Strongly prefer stability", "Somewhat prefer stability", "Balanced", "Somewhat prefer variety", "Strongly prefer variety"]
  },
  {
    id: "general_4",
    question: "How comfortable are you with public speaking or presentations?",
    options: ["Not comfortable", "Slightly comfortable", "Moderately comfortable", "Very comfortable", "Extremely comfortable"]
  },
  {
    id: "general_5",
    question: "What's more important to you: high income or meaningful work?",
    options: ["Definitely income", "Somewhat income", "Equally important", "Somewhat meaning", "Definitely meaning"]
  }
];

interface CareerStep {
  year: number;
  title: string;
  description: string;
  skills: string[];
  resources?: { name: string; url: string; }[];
}

interface CareerPathResponse {
  _id?: string;
  title: string;
  query: string;
  steps: CareerStep[];
  missingSkills: string[];
  learningModules: { name: string; url: string; type: string; }[];
  createdAt?: string;
  recommendedRoles?: string[];
}

const CareerPathPredictor = () => {
  const [activeTab, setActiveTab] = useState("assessment");
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [targetRole, setTargetRole] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [roadmapData, setRoadmapData] = useState<CareerPathResponse | null>(null);
  const [detectedSkills, setDetectedSkills] = useState<string[]>([]);

  // Calculate which questions to show based on selected domains
  const getQuestionsForStep = (step: number) => {
    if (step === 0) {
      // Domain selection step
      return [];
    } else if (step === selectedDomains.length + 1) {
      // General questions step
      return GENERAL_QUESTIONS;
    } else {
      // Domain-specific questions
      const domainIndex = step - 1;
      if (domainIndex < selectedDomains.length) {
        const domain = selectedDomains[domainIndex];
        return ASSESSMENT_QUESTIONS[domain as keyof typeof ASSESSMENT_QUESTIONS] || [];
      }
      return [];
    }
  };

  const getCurrentStepTitle = () => {
    if (currentStep === 0) {
      return "Select Career Domains";
    } else if (currentStep === selectedDomains.length + 1) {
      return "General Work Preferences";
    } else {
      const domainIndex = currentStep - 1;
      if (domainIndex < selectedDomains.length) {
        const domain = selectedDomains[domainIndex];
        const domainInfo = CAREER_DOMAINS.find(d => d.id === domain);
        return `${domainInfo?.name} Assessment`;
      }
      return "Assessment";
    }
  };

  const getTotalSteps = () => {
    // Domain selection + domain-specific questions + general questions
    return 1 + selectedDomains.length + 1;
  };

  const handleDomainToggle = (domainId: string) => {
    setSelectedDomains(prev => {
      if (prev.includes(domainId)) {
        return prev.filter(id => id !== domainId);
      } else {
        return [...prev, domainId];
      }
    });
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextStep = () => {
    const nextStep = currentStep + 1;
    if (nextStep < getTotalSteps()) {
      setCurrentStep(nextStep);
    } else {
      // Final step - generate career path
      generateCareerPath();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isNextButtonDisabled = () => {
    if (currentStep === 0) {
      // Domain selection step - need at least one domain
      return selectedDomains.length === 0;
    } else {
      // Question steps - check if all questions for current step are answered
      const questions = getQuestionsForStep(currentStep);
      return questions.some(q => !answers[q.id]);
    }
  };

  // Handle resume upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      try {
        // In a real implementation, you would send the file to the backend for parsing
        // For now, we'll simulate skill detection
        const mockSkills = ["JavaScript", "React", "HTML/CSS", "Git", "Responsive Design"];
        setDetectedSkills(mockSkills);
        toast.success("Resume analyzed successfully!");
      } catch (error) {
        toast.error("Failed to analyze resume");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle resume text analysis
  const handleResumeTextSubmit = async () => {
    if (resumeText.trim()) {
      setIsLoading(true);
      try {
        // In a real implementation, you would send the text to the backend for parsing
        // For now, we'll simulate skill detection
        const mockSkills = ["JavaScript", "React", "HTML/CSS", "Git", "Responsive Design"];
        setDetectedSkills(mockSkills);
        toast.success("Resume analyzed successfully!");
      } catch (error) {
        toast.error("Failed to analyze resume");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Generate career roadmap
  const generateCareerPath = async () => {
    setIsLoading(true);
    try {
      // First, assess interests based on answers
      const interestsResponse = await API.career.assessInterests(answers);
      
      // Use detected skills or empty array if none
      const skills = detectedSkills.length > 0 ? detectedSkills : [];
      
      // If target role is not set, use the recommended role from interests assessment
      const effectiveTargetRole = targetRole || interestsResponse.recommendedRoles[0] || "";
      
      // Generate career path
      const response = await API.career.predictAndPlan(skills, effectiveTargetRole);
      
      // Combine the responses
      const combinedResponse = {
        ...response,
        recommendedRoles: interestsResponse.recommendedRoles
      };
      
      setRoadmapData(combinedResponse);
      toast.success("Career plan generated successfully!");
    } catch (error) {
      toast.error("Failed to generate career plan");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (roadmapData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{roadmapData.title}</h2>
            <p className="text-muted-foreground">
              Based on your assessment and {detectedSkills.length > 0 ? "skills" : "preferences"}
            </p>
          </div>
          <Button variant="outline" onClick={() => {
            setRoadmapData(null);
            setCurrentStep(0);
            setAnswers({});
          }}>
            Start Over
          </Button>
        </div>

        {roadmapData.recommendedRoles && roadmapData.recommendedRoles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-lg font-semibold">Recommended Career Paths</h4>
            <div className="flex flex-wrap gap-2">
              {roadmapData.recommendedRoles.map((role, index) => (
                <Badge key={index} variant="secondary" className="text-base py-1.5 px-3">{role}</Badge>
              ))}
            </div>
          </div>
        )}

        {roadmapData.missingSkills && roadmapData.missingSkills.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-lg font-semibold">Skills to Develop</h4>
            <div className="flex flex-wrap gap-2">
              {roadmapData.missingSkills.map((skill, index) => (
                <Badge key={index} variant="destructive">{skill}</Badge>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-8">
          {roadmapData.steps.map((step, index) => (
            <div key={index} className="relative pl-8 pb-8 border-l border-muted last:border-0">
              <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-primary -translate-x-[13px] flex items-center justify-center text-xs text-white font-medium">
                {index + 1}
              </div>
              <div className="space-y-3">
                <div>
                  <Badge variant="outline" className="mb-2">
                    <Clock className="h-3 w-3 mr-1" />
                    Year {step.year}
                  </Badge>
                  <h3 className="text-lg font-bold">{step.title}</h3>
                  <p className="text-muted-foreground mt-1">{step.description}</p>
                </div>

                {step.skills && step.skills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium flex items-center">
                      <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                      Focus Skills
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {step.skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {step.resources && step.resources.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium flex items-center">
                      <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                      Learning Resources
                    </h4>
                    <ul className="mt-2 space-y-1">
                      {step.resources.map((resource, idx) => (
                        <li key={idx} className="text-sm">
                          <a href={resource.url} className="text-primary hover:underline flex items-center" target="_blank" rel="noopener noreferrer">
                            <ArrowRight className="h-3 w-3 mr-1" />
                            {resource.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {roadmapData.learningModules && roadmapData.learningModules.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-lg font-semibold">Suggested Learning Modules</h4>
            <div className="grid gap-4 md:grid-cols-2">
              {roadmapData.learningModules.map((module, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-medium">{module.name}</h5>
                      <p className="text-sm text-muted-foreground">{module.type}</p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={module.url} target="_blank" rel="noopener noreferrer">
                        View Module
                      </a>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Career Path Predictor</h2>
        <p className="text-muted-foreground">
          Discover your ideal career path through a comprehensive assessment
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assessment">Career Assessment</TabsTrigger>
          <TabsTrigger value="resume">Resume Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="space-y-6 pt-4">
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{getCurrentStepTitle()}</h3>
              <Progress value={(currentStep / (getTotalSteps() - 1)) * 100} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                Step {currentStep + 1} of {getTotalSteps()}
              </p>
            </div>

            {currentStep === 0 ? (
              <div className="space-y-4">
                <p>Select the career domains you're interested in exploring (choose at least one):</p>
                <div className="grid gap-4 md:grid-cols-2">
                  {CAREER_DOMAINS.map(domain => (
                    <div 
                      key={domain.id} 
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedDomains.includes(domain.id) 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:border-muted-foreground'
                      }`}
                      onClick={() => handleDomainToggle(domain.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`${selectedDomains.includes(domain.id) ? 'text-primary' : 'text-muted-foreground'}`}>
                          {domain.icon}
                        </div>
                        <h4 className="font-medium">{domain.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{domain.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {getQuestionsForStep(currentStep).map((question, index) => (
                  <div key={question.id} className="space-y-3">
                    <h4 className="font-medium">{question.question}</h4>
                    <RadioGroup 
                      value={answers[question.id] || ""}
                      onValueChange={(value) => handleAnswerChange(question.id, value)}
                    >
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`${question.id}-${optIndex}`} />
                            <Label htmlFor={`${question.id}-${optIndex}`}>{option}</Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button 
                variant="outline" 
                onClick={handlePreviousStep}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              <Button 
                onClick={handleNextStep}
                disabled={isNextButtonDisabled()}
              >
                {currentStep === getTotalSteps() - 1 ? "Generate Career Path" : "Next"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="resume" className="space-y-6 pt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload Resume</TabsTrigger>
                  <TabsTrigger value="paste">Paste Resume</TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-4 pt-4">
                  <Card className="border-dashed border-2 py-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <Input 
                      type="file" 
                      id="resume-upload" 
                      className="hidden" 
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx"
                    />
                    <Label htmlFor="resume-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-10 w-10 text-muted-foreground" />
                        <p className="font-medium">Click to upload your resume</p>
                        <p className="text-xs text-muted-foreground">
                          Supports PDF, DOC, DOCX files
                        </p>
                      </div>
                    </Label>
                  </Card>
                </TabsContent>

                <TabsContent value="paste" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="resume-text">Paste your resume text</Label>
                    <Textarea 
                      id="resume-text" 
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste the content of your resume here..."
                      className="min-h-[200px]"
                    />
                  </div>
                  <Button onClick={handleResumeTextSubmit} disabled={!resumeText.trim() || isLoading}>
                    {isLoading ? "Analyzing..." : "Analyze Resume"}
                  </Button>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="target-role">Target Role (Optional)</Label>
                <Input 
                  id="target-role" 
                  value={targetRole} 
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g., Senior Frontend Developer, Full Stack Engineer"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to get recommendations based on your skills
                </p>
              </div>

              <div className="space-y-2">
                <Label>Detected Skills</Label>
                <div className="min-h-[100px] border rounded-md p-4 bg-muted/30">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                      <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                      <p className="text-sm text-muted-foreground">Analyzing your resume...</p>
                    </div>
                  ) : detectedSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {detectedSkills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">
                      No skills detected yet. Please upload or paste your resume.
                    </p>
                  )}
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={generateCareerPath}
                disabled={detectedSkills.length === 0 || isLoading}
              >
                {isLoading ? "Generating..." : "Generate Career Roadmap"}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CareerPathPredictor; 