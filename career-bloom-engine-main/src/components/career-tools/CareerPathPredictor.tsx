import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { BUSINESS_QUESTIONS, CREATIVE_QUESTIONS, EDUCATION_QUESTIONS, HEALTHCARE_QUESTIONS, SCIENCE_QUESTIONS, TECHNOLOGY_QUESTIONS } from '@/data/assessmentQuestions';
import { API } from "@/services/api";
import { ArrowRight, Award, BookOpen, BrainCircuit, Clock, Lightbulb, Youtube } from "lucide-react";
import React, { useEffect, useState } from "react";
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

// Example: dynamically load questions for selected domains
const DOMAIN_QUESTION_MAP: Record<string, any[]> = {
  tech: TECHNOLOGY_QUESTIONS,
  business: BUSINESS_QUESTIONS,
  creative: CREATIVE_QUESTIONS,
  healthcare: HEALTHCARE_QUESTIONS,
  education: EDUCATION_QUESTIONS,
  science: SCIENCE_QUESTIONS,
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

// Default options for domain questions (1-5 scale)
const DEFAULT_DOMAIN_OPTIONS = [
  '1 - Not interested at all',
  '2 - Slightly interested',
  '3 - Moderately interested',
  '4 - Very interested',
  '5 - Extremely interested',
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

// Helper: Get a mixed set of 25 questions from all domains
function getMixedAssessmentQuestions() {
  const allDomains = [
    TECHNOLOGY_QUESTIONS,
    BUSINESS_QUESTIONS,
    CREATIVE_QUESTIONS,
    HEALTHCARE_QUESTIONS,
    EDUCATION_QUESTIONS,
    SCIENCE_QUESTIONS,
  ];
  const questions: any[] = [];
  let i = 0;
  // Round-robin pick one from each domain until 25 or run out
  while (questions.length < 25) {
    for (const domain of allDomains) {
      if (questions.length >= 25) break;
      if (domain[i]) questions.push(domain[i]);
    }
    i++;
    if (allDomains.every(domain => !domain[i])) break; // stop if all domains exhausted
  }
  return questions;
}

const MIXED_QUESTIONS = getMixedAssessmentQuestions();

// Helper: Get 20 representative questions from all major subdomains in the selected domain
function getRepresentativeQuestions(domainQuestions: any[], maxQuestions = 20) {
  // Group questions by subdomain
  const subdomainMap: Record<string, any[]> = {};
  for (const q of domainQuestions) {
    if (!q.subdomain) continue;
    if (!subdomainMap[q.subdomain]) subdomainMap[q.subdomain] = [];
    subdomainMap[q.subdomain].push(q);
  }
  // Step 1: Try to pick one random question from each subdomain
  const subdomains = Object.keys(subdomainMap);
  let selected: any[] = [];
  for (const sub of subdomains) {
    const arr = subdomainMap[sub];
    if (arr.length > 0) {
      selected.push(arr[Math.floor(Math.random() * arr.length)]);
    }
    if (selected.length >= maxQuestions) break;
  }
  // Step 2: If fewer than maxQuestions, fill randomly from remaining questions
  if (selected.length < maxQuestions) {
    // Exclude already selected
    const remaining = domainQuestions.filter(q => !selected.includes(q));
    // Shuffle remaining
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }
    for (const q of remaining) {
      if (selected.length >= maxQuestions) break;
      selected.push(q);
    }
  }
  // If more than maxQuestions (too many subdomains), trim
  return selected.slice(0, maxQuestions);
}



const CareerPathPredictor = () => {
  const [activeTab, setActiveTab] = useState("assessment");
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [roadmapData, setRoadmapData] = useState<CareerPathResponse | null>(null);
  const [detectedSkills, setDetectedSkills] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [domainAssessmentQuestions, setDomainAssessmentQuestions] = useState<any[]>([]);
  const [roadmapFields, setRoadmapFields] = useState<any[]>([]);
  const [isRoadmapLoading, setIsRoadmapLoading] = useState(false);
  const [roadmapError, setRoadmapError] = useState<string | null>(null);
  const [interestedFields, setInterestedFields] = useState<string[]>([]);
  const [isFieldsLoading, setIsFieldsLoading] = useState(false);
  const [fieldsError, setFieldsError] = useState<string | null>(null);

  // When selectedDomain changes, generate and store 20 questions for that domain
  useEffect(() => {
    if (selectedDomain) {
      const domainQuestions = DOMAIN_QUESTION_MAP[selectedDomain] || [];
      setDomainAssessmentQuestions(getRepresentativeQuestions(domainQuestions, 20));
      setCurrentQuestionIndex(0);
    } else {
      setDomainAssessmentQuestions([]);
      setCurrentQuestionIndex(0);
    }
  }, [selectedDomain]);

  const totalAssessmentQuestions = domainAssessmentQuestions.length;
  const currentAssessmentQuestion = domainAssessmentQuestions[currentQuestionIndex];

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
        return DOMAIN_QUESTION_MAP[domain] || [];
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
      // Final step - assessment complete
      toast.success("Assessment completed! Switch to Resume Analysis tab to find missing skills.");
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
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a PDF, DOC, DOCX, or TXT file");
        return;
      }

      setIsLoading(true);
      try {
        // Read file content
        const reader = new FileReader();
        reader.onload = async (event) => {
          const content = event.target?.result as string;

          if (file.type === 'text/plain') {
            // For text files, directly use the content
            setResumeText(content);
          } else {
            // For PDF/DOC files, you would typically send to backend for parsing
            // For now, we'll simulate by setting a placeholder
            setResumeText(`[File uploaded: ${file.name}]\n\nPlease paste your resume text below or use our parsing service.`);
          }

          // File uploaded successfully - analysis will happen when user clicks "Analyze Resume"
          toast.success(`Resume file "${file.name}" uploaded successfully! Click "Analyze Resume" to find missing skills.`);
        };

        reader.onerror = () => {
          toast.error("Failed to read file");
        };

        // Read as text for now (in production, you'd handle different file types appropriately)
        reader.readAsText(file);

      } catch (error) {
        toast.error("Failed to process resume file");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle resume text analysis with Lightning AI
  const handleResumeTextSubmit = async () => {
    if (resumeText.trim()) {
      if (!jobDescription.trim()) {
        toast.error("Please provide a job description for analysis");
        return;
      }

      setIsLoading(true);
      try {
        console.log('🔍 Analyzing resume with Lightning AI...');

        const response = await fetch('http://localhost:5000/api/resume/analyze-missing-skills', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resumeText: resumeText.trim(),
            jobDescription: jobDescription.trim()
          }),
        });

        const data = await response.json();

        if (data.success) {
          console.log('✅ Lightning AI analysis successful:', data.data);

          // Set the missing skills as detected skills for the career path generation
          const missingSkills = data.data.missingSkills || [];
          const existingSkills = data.data.existingSkills || [];

          // For the career path predictor, we'll use missing skills as the skills to focus on
          setDetectedSkills(missingSkills);

          if (missingSkills.length > 0) {
            toast.success(`Found ${missingSkills.length} missing skills that you need to develop!`);
          } else {
            toast.success("Great! You have all the required skills for this job.");
          }

          // Log the analysis for debugging
          console.log('🎯 Missing skills:', missingSkills);
          console.log('✅ Existing skills:', existingSkills);

        } else {
          console.error('❌ Lightning AI analysis failed:', data.error);
          toast.error(data.error || "Failed to analyze resume");
        }
      } catch (error) {
        console.error('❌ Error calling Lightning AI:', error);
        toast.error("Failed to analyze resume. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error("Please provide your resume text");
    }
  };



  // Modern roadmap generation handler
  const handleGenerateModernRoadmap = async () => {
    setIsRoadmapLoading(true);
    setRoadmapError(null);
    try {
      console.log('🎯 Generating career roadmap with assessment answers...');
      console.log('📝 Assessment answers:', answers);

      // Validate that we have answers
      if (!answers || Object.keys(answers).length === 0) {
        throw new Error('No assessment answers found. Please complete the assessment first.');
      }

      // Convert answers to the expected format
      const assessmentAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer: String(answer),
        category: selectedDomain || 'General'
      }));

      console.log('📤 Sending assessment answers:', assessmentAnswers);

      const response = await API.career.generateRoadmap(assessmentAnswers);
      console.log('📥 Received response:', response);

      if (response.success) {
        setRoadmapFields(response.data.careers || []);
        toast.success(`Generated roadmap for ${response.data.totalCareers} career(s)!`);
      } else {
        throw new Error(response.error || 'Failed to generate roadmap');
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to generate roadmap";
      setRoadmapError(errorMessage);
      toast.error(errorMessage);
      console.error('❌ Roadmap generation error:', err);
    } finally {
      setIsRoadmapLoading(false);
    }
  };

  // Generate complete roadmap directly after assessment
  const handleFinishAssessment = async () => {
    console.log('🎯 Starting assessment completion...');
    console.log('📝 Current answers:', answers);
    console.log('🎯 Selected domain:', selectedDomain);

    // Use the existing modern roadmap generation function
    await handleGenerateModernRoadmap();
  };

  // Show roadmap results if we have either modern roadmap fields or legacy roadmap data
  if (roadmapFields.length > 0 || roadmapData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-400" />
              {roadmapData?.title || "Personalized Career Roadmap"}
            </h2>
            <p className="text-muted-foreground">
              {roadmapData ?
                `Based on your assessment and ${detectedSkills.length > 0 ? "skills" : "preferences"}` :
                "AI-generated learning path with YouTube resources"
              }
            </p>
          </div>
          <Button variant="outline" onClick={() => {
            setRoadmapData(null);
            setRoadmapFields([]);
            setInterestedFields([]);
            setCurrentStep(0);
            setAnswers({});
            setSelectedDomain(null);
            setCurrentQuestionIndex(0);
          }}>
            Start Over
          </Button>
        </div>

        {/* Enhanced Career Roadmaps Display */}
        {roadmapFields.length > 0 && (
          <div className="space-y-12">
            {roadmapFields.map((career: any, careerIdx: number) => (
              <Card key={careerIdx} className="p-8 rounded-3xl shadow-2xl bg-gradient-to-br from-[#1a2236] to-[#23263a] border-0">
                {/* Career Header */}
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-extrabold mb-4 text-white flex items-center justify-center gap-3">
                    <span className="inline-block w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
                    {career.career} Roadmap
                    <span className="text-lg font-normal text-gray-400">({career.totalStages} Stages)</span>
                  </h2>
                  <p className="text-gray-300 text-lg max-w-3xl mx-auto">{career.description}</p>
                  {career.estimatedDuration && (
                    <div className="flex items-center justify-center gap-2 mt-4 text-blue-400">
                      <Clock className="h-5 w-5" />
                      <span className="font-semibold">Estimated Duration: {career.estimatedDuration}</span>
                    </div>
                  )}
                </div>

                {/* Career Stages */}
                <div className="space-y-8">
                  {career.stages.map((stage: any, stageIdx: number) => (
                    <div key={stageIdx} className="relative">
                      <div className="flex items-start gap-6">
                        {/* Stage Number */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {stage.stage}
                        </div>

                        {/* Stage Content */}
                        <div className="flex-1 bg-[#2a2f47] rounded-2xl p-6 shadow-lg">
                          <h3 className="text-2xl font-bold text-white mb-3">{stage.title}</h3>
                          <p className="text-gray-300 text-base mb-4">{stage.description}</p>

                          {/* Skills */}
                          {stage.skills && stage.skills.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-blue-400 mb-2">Key Skills:</h4>
                              <div className="flex flex-wrap gap-2">
                                {stage.skills.map((skill: string, skillIdx: number) => (
                                  <Badge
                                    key={skillIdx}
                                    variant="secondary"
                                    className="text-sm px-3 py-1 bg-blue-900/30 text-blue-200 border border-blue-500/30"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Learning Points */}
                          {stage.learningPoints && stage.learningPoints.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-sm font-semibold text-green-400 mb-3">What You'll Learn:</h4>
                              <ul className="space-y-2">
                                {stage.learningPoints.map((point: string, pointIdx: number) => (
                                  <li key={pointIdx} className="flex items-start gap-2 text-gray-300">
                                    <span className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Learning Resources */}
                          <div className="grid md:grid-cols-2 gap-4">
                            {/* YouTube Videos */}
                            {stage.youtubeVideos && stage.youtubeVideos.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                                  <Youtube className="h-4 w-4" />
                                  YouTube Tutorials
                                </h4>
                                <div className="space-y-2">
                                  {stage.youtubeVideos.map((video: any, videoIdx: number) => (
                                    <a
                                      key={videoIdx}
                                      href={video.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block p-3 bg-red-900/20 border border-red-500/30 rounded-lg hover:bg-red-900/30 transition-colors group"
                                    >
                                      <div className="flex items-center gap-2 text-red-300 group-hover:text-red-200">
                                        <span className="text-sm font-medium truncate">{video.title}</span>
                                        <ArrowRight className="h-3 w-3 flex-shrink-0" />
                                      </div>
                                      {video.duration && (
                                        <div className="text-xs text-red-400 mt-1">{video.duration}</div>
                                      )}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Coursera Content */}
                            {stage.courseraContent && stage.courseraContent.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                                  <BookOpen className="h-4 w-4" />
                                  Coursera Courses
                                </h4>
                                <div className="space-y-2">
                                  {stage.courseraContent.map((course: any, courseIdx: number) => (
                                    <a
                                      key={courseIdx}
                                      href={course.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg hover:bg-blue-900/30 transition-colors group"
                                    >
                                      <div className="flex items-center gap-2 text-blue-300 group-hover:text-blue-200">
                                        <span className="text-sm font-medium truncate">{course.title}</span>
                                        <ArrowRight className="h-3 w-3 flex-shrink-0" />
                                      </div>
                                      {course.duration && (
                                        <div className="text-xs text-blue-400 mt-1">{course.duration}</div>
                                      )}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Connecting Line */}
                      {stageIdx < career.stages.length - 1 && (
                        <div className="absolute left-6 top-16 w-0.5 h-16 bg-gradient-to-b from-purple-500/50 to-blue-500/30" />
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {roadmapData && roadmapData.recommendedRoles && roadmapData.recommendedRoles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-lg font-semibold">Recommended Career Paths</h4>
            <div className="flex flex-wrap gap-2">
              {roadmapData.recommendedRoles.map((role, index) => (
                <Badge key={index} variant="secondary" className="text-base py-1.5 px-3">{role}</Badge>
              ))}
            </div>
          </div>
        )}

        {roadmapData && roadmapData.missingSkills && roadmapData.missingSkills.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-lg font-semibold">Skills to Develop</h4>
            <div className="flex flex-wrap gap-2">
              {roadmapData.missingSkills.map((skill, index) => (
                <Badge key={index} variant="destructive">{skill}</Badge>
              ))}
            </div>
          </div>
        )}

        {roadmapData && roadmapData.steps && (
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
        )}

        {roadmapData && roadmapData.learningModules && roadmapData.learningModules.length > 0 && (
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
          <Card className="p-8 rounded-2xl shadow-xl bg-gradient-to-br from-[#181c2b] to-[#23263a] border-0">
            <div className="mb-8">
              <h3 className="text-2xl font-extrabold mb-2 text-white tracking-tight flex items-center gap-2">
                <span>Career Interest Assessment</span>
              </h3>
              <div className="w-full h-3 bg-[#23263a] rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${selectedDomain ? ((currentQuestionIndex + 1) / totalAssessmentQuestions) * 100 : 0}%` }}
                />
              </div>
              <p className="text-base text-gray-400 mt-2 font-medium">
                {selectedDomain ? `Question ${currentQuestionIndex + 1} of ${totalAssessmentQuestions}` : 'Select a domain to begin'}
              </p>
            </div>
            {!selectedDomain ? (
              <div className="space-y-6">
                <p className="text-lg text-gray-200">Select the career domain you're interested in exploring:</p>
                <div className="grid gap-6 md:grid-cols-2">
                  {CAREER_DOMAINS.map(domain => (
                    <div
                      key={domain.id}
                      className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-lg hover:border-blue-500 bg-[#23263a] hover:bg-[#23263a]/80 ${selectedDomain === domain.id ? 'border-blue-500 ring-2 ring-blue-400/30' : 'border-gray-700'}`}
                      onClick={() => setSelectedDomain(domain.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={selectedDomain === domain.id ? 'text-blue-400' : 'text-gray-400'}>
                          {domain.icon}
                        </div>
                        <h4 className="font-semibold text-lg text-white">{domain.name}</h4>
                      </div>
                      <p className="text-sm text-gray-400 mt-2">{domain.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : currentAssessmentQuestion ? (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h4 className="font-semibold text-xl text-white mb-2">{currentAssessmentQuestion.question}</h4>
                  <RadioGroup
                    value={answers[currentAssessmentQuestion.id] || ""}
                    onValueChange={(value) => handleAnswerChange(currentAssessmentQuestion.id, value)}
                  >
                    <div className="space-y-4">
                      {(currentAssessmentQuestion.options || DEFAULT_DOMAIN_OPTIONS).map((option, optIndex) => (
                        <label key={optIndex} className="flex items-center gap-4 cursor-pointer group">
                          <span className="relative flex items-center justify-center">
                            <input
                              type="radio"
                              className="appearance-none w-6 h-6 rounded-full border-2 border-gray-500 checked:border-blue-500 checked:bg-blue-500 transition-all duration-200 focus:ring-2 focus:ring-blue-400 group-hover:border-blue-400"
                              checked={answers[currentAssessmentQuestion.id] === option}
                              onChange={() => handleAnswerChange(currentAssessmentQuestion.id, option)}
                            />
                            {answers[currentAssessmentQuestion.id] === option && (
                              <span className="absolute w-3 h-3 bg-white rounded-full pointer-events-none" />
                            )}
                          </span>
                          <span className="text-lg text-gray-200 group-hover:text-blue-400 transition-colors">{option}</span>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8 text-lg">
                No questions available for the selected domain.
              </div>
            )}
            <div className="flex justify-between mt-10 gap-4">
              <Button
                variant="outline"
                className="rounded-full px-6 py-2 text-base font-semibold border-gray-600 bg-[#23263a] text-gray-300 hover:bg-gray-800 hover:text-white transition-all"
                onClick={() => {
                  if (!selectedDomain) return;
                  setCurrentQuestionIndex(idx => Math.max(0, idx - 1));
                }}
                disabled={!selectedDomain || currentQuestionIndex === 0}
              >
                Previous
              </Button>
              <Button
                className="rounded-full px-8 py-2 text-base font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:from-purple-600 hover:to-blue-600 transition-all"
                onClick={() => {
                  if (!selectedDomain) return;
                  if (currentQuestionIndex < totalAssessmentQuestions - 1) {
                    setCurrentQuestionIndex(idx => idx + 1);
                  } else {
                    handleFinishAssessment();
                  }
                }}
                disabled={!selectedDomain || !answers[currentAssessmentQuestion?.id] || isRoadmapLoading}
              >
                {selectedDomain && currentQuestionIndex === totalAssessmentQuestions - 1 ? (isRoadmapLoading ? "Generating Roadmap..." : "Generate Roadmap") : "Next"}
              </Button>
              <Button
                variant="ghost"
                className="rounded-full px-6 py-2 text-base font-semibold text-gray-400 hover:text-red-400 transition-all"
                onClick={() => {
                  setSelectedDomain(null);
                  setCurrentQuestionIndex(0);
                  setAnswers({});
                }}
                disabled={!selectedDomain}
              >
                Start Over
              </Button>
            </div>
            {fieldsError && <div className="text-red-400 text-center mt-4">{fieldsError}</div>}
            {roadmapError && <div className="text-red-400 text-center mt-4">{roadmapError}</div>}
          </Card>
        </TabsContent>

        <TabsContent value="resume" className="space-y-6 pt-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5" />
                  Resume Analysis
                </CardTitle>
                <p className="text-muted-foreground">
                  Provide your resume and job description to get personalized career insights
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Resume Input */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Your Resume</Label>

                      {/* Upload Option */}
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                        <input
                          type="file"
                          id="resume-upload"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleFileUpload}
                        />
                        <Label htmlFor="resume-upload" className="cursor-pointer">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                              <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium">Upload Resume File</p>
                              <p className="text-xs text-muted-foreground">
                                PDF, DOC, DOCX, TXT (Max 10MB)
                              </p>
                            </div>
                          </div>
                        </Label>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">Or paste text</span>
                        </div>
                      </div>

                      {/* Text Input Option */}
                      <Textarea
                        id="resume-text"
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Paste the content of your resume here..."
                        className="min-h-[200px] resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        Upload a file or copy and paste your complete resume text
                      </p>
                    </div>
                  </div>

                  {/* Job Description Input */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="job-description">Job Description</Label>
                      <Textarea
                        id="job-description"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the job description you're interested in..."
                        className="min-h-[300px] resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        Include the complete job posting with requirements and responsibilities
                      </p>
                    </div>
                  </div>
                </div>

                {/* Analysis Results */}
                {detectedSkills.length > 0 && (
                  <div className="space-y-4 pt-4 border-t">
                    {detectedSkills.length > 0 ? (
                      <div className="space-y-2">
                        <Label className="text-orange-400 font-semibold">⚠️ Missing Skills (Skills you need to develop for this job)</Label>
                        <div className="border rounded-md p-4 bg-orange-50/10 border-orange-200/20">
                          <div className="flex flex-wrap gap-2">
                            {detectedSkills.map((skill, index) => (
                              <Badge key={index} variant="destructive" className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground mt-3">
                            💡 Focus on learning these skills to improve your chances for this position
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label className="text-green-400 font-semibold">✅ Great Match!</Label>
                        <div className="border rounded-md p-4 bg-green-50/10 border-green-200/20">
                          <p className="text-sm text-muted-foreground">
                            🎉 Excellent news! Your resume shows you have the skills needed for this position. You appear to be a strong candidate for this role.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Button */}
                <div className="flex flex-col items-center pt-4 space-y-2">
                  <Button
                    onClick={handleResumeTextSubmit}
                    disabled={!resumeText.trim() || !jobDescription.trim() || isLoading}
                    className="w-full max-w-md"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing with AI...
                      </>
                    ) : (
                      "🔍 Analyze Resume & Find Missing Skills"
                    )}
                  </Button>
                  {(!resumeText.trim() || !jobDescription.trim()) && !isLoading && (
                    <p className="text-sm text-muted-foreground text-center">
                      Please provide both your resume and job description to analyze missing skills
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CareerPathPredictor;