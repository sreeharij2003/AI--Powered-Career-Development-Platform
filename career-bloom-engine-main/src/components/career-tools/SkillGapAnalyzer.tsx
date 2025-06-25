import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Check, Circle, Clock, FileText, LucideIcon, Plus, Search, Star, Upload, X } from "lucide-react";
import { useState } from "react";

// Types for the component
interface JobRequirement {
  id: number;
  skill: string;
  importance: "required" | "preferred" | "bonus";
  experience: string;
  yourLevel: number;
}

interface LearningResource {
  id: number;
  title: string;
  type: "course" | "book" | "tutorial" | "documentation" | "video";
  provider: string;
  url: string;
  duration: string;
  level: "beginner" | "intermediate" | "advanced";
}

// Mock data
const mockJobRequirements: JobRequirement[] = [
  {
    id: 1,
    skill: "React",
    importance: "required",
    experience: "3+ years",
    yourLevel: 85
  },
  {
    id: 2,
    skill: "TypeScript",
    importance: "required",
    experience: "2+ years",
    yourLevel: 70
  },
  {
    id: 3,
    skill: "Redux",
    importance: "required",
    experience: "2+ years",
    yourLevel: 50
  },
  {
    id: 4,
    skill: "NextJS",
    importance: "preferred",
    experience: "1+ years",
    yourLevel: 30
  },
  {
    id: 5,
    skill: "GraphQL",
    importance: "preferred",
    experience: "1+ years",
    yourLevel: 20
  },
  {
    id: 6,
    skill: "Jest/Testing",
    importance: "required",
    experience: "2+ years",
    yourLevel: 65
  },
  {
    id: 7,
    skill: "CSS/SASS",
    importance: "required",
    experience: "3+ years",
    yourLevel: 80
  },
  {
    id: 8,
    skill: "AWS",
    importance: "bonus",
    experience: "1+ years",
    yourLevel: 40
  }
];

const mockLearningResources: LearningResource[] = [
  {
    id: 1,
    title: "Advanced React Patterns",
    type: "course",
    provider: "Frontend Masters",
    url: "#",
    duration: "8 hours",
    level: "advanced"
  },
  {
    id: 2,
    title: "TypeScript Deep Dive",
    type: "book",
    provider: "basarat.gitbook.io",
    url: "#",
    duration: "Self-paced",
    level: "intermediate"
  },
  {
    id: 3,
    title: "Redux Toolkit Crash Course",
    type: "video",
    provider: "YouTube",
    url: "#",
    duration: "2 hours",
    level: "intermediate"
  },
  {
    id: 4,
    title: "Next.js Foundations",
    type: "documentation",
    provider: "Next.js Docs",
    url: "#",
    duration: "Self-paced",
    level: "beginner"
  },
  {
    id: 5,
    title: "GraphQL Fundamentals",
    type: "tutorial",
    provider: "GraphQL.org",
    url: "#",
    duration: "4 hours",
    level: "beginner"
  },
  {
    id: 6,
    title: "Testing React Applications",
    type: "course",
    provider: "TestingJavaScript.com",
    url: "#",
    duration: "10 hours",
    level: "intermediate"
  },
  {
    id: 7,
    title: "AWS for Frontend Developers",
    type: "course",
    provider: "egghead.io",
    url: "#",
    duration: "5 hours",
    level: "beginner"
  }
];

// Helper function to get level color
const getLevelColor = (level: number): string => {
  if (level >= 80) return "text-green-500";
  if (level >= 60) return "text-blue-500";
  if (level >= 40) return "text-amber-500";
  return "text-red-500";
};

// Helper function to get progress color
const getProgressColor = (level: number): string => {
  if (level >= 80) return "bg-green-500";
  if (level >= 60) return "bg-blue-500";
  if (level >= 40) return "bg-amber-500";
  return "bg-red-500";
};

// Icon mapping for resource types
const resourceTypeIcons: Record<string, LucideIcon> = {
  course: Clock,
  book: BookOpen,
  tutorial: FileText,
  documentation: FileText,
  video: Circle
};

const SkillGapAnalyzer = () => {
  const [activeTab, setActiveTab] = useState("analyze");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [skillFilter, setSkillFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  
  // Sort requirements by skill gap (lowest level first)
  const sortedRequirements = [...mockJobRequirements].sort((a, b) => {
    // Sort required skills with lower levels first
    if (a.importance === "required" && b.importance === "required") {
      return a.yourLevel - b.yourLevel;
    }
    // Required skills come before preferred
    if (a.importance === "required" && b.importance !== "required") return -1;
    if (a.importance !== "required" && b.importance === "required") return 1;
    // Preferred skills come before bonus
    if (a.importance === "preferred" && b.importance === "bonus") return -1;
    if (a.importance === "bonus" && b.importance === "preferred") return 1;
    // Default to sorting by level
    return a.yourLevel - b.yourLevel;
  });
  
  // Filter requirements by search
  const filteredRequirements = sortedRequirements.filter(req => 
    req.skill.toLowerCase().includes(skillFilter.toLowerCase())
  );
  
  // Filter resources by search
  const filteredResources = mockLearningResources.filter(resource => 
    resource.title.toLowerCase().includes(resourceFilter.toLowerCase()) ||
    resource.type.toLowerCase().includes(resourceFilter.toLowerCase()) ||
    resource.provider.toLowerCase().includes(resourceFilter.toLowerCase())
  );
  
  // Analyze handler
  const handleAnalyze = () => {
    if (jobTitle.trim() && jobDescription.trim()) {
      setIsAnalyzing(true);
      
      // Simulate analysis delay
      setTimeout(() => {
        setIsAnalyzing(false);
        setIsAnalyzed(true);
      }, 2000);
    }
  };
  
  // Get match percentage
  const getMatchPercentage = (): number => {
    const requiredSkills = mockJobRequirements.filter(req => req.importance === "required");
    const totalRequiredPoints = requiredSkills.length * 100;
    const yourRequiredPoints = requiredSkills.reduce((sum, req) => sum + req.yourLevel, 0);
    return Math.round((yourRequiredPoints / totalRequiredPoints) * 100);
  };
  
  // Get skill gap summary
  const getSkillGapSummary = () => {
    const criticalGaps = sortedRequirements
      .filter(req => req.importance === "required" && req.yourLevel < 60)
      .map(req => req.skill);
    
    const significantGaps = sortedRequirements
      .filter(req => (req.importance === "required" && req.yourLevel >= 60 && req.yourLevel < 80) || 
                    (req.importance === "preferred" && req.yourLevel < 50))
      .map(req => req.skill);
    
    return { criticalGaps, significantGaps };
  };
  
  const { criticalGaps, significantGaps } = getSkillGapSummary();
  const matchPercentage = getMatchPercentage();
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Skill Gap Analyzer</h2>
        <p className="text-muted-foreground">
          Identify skill gaps between your profile and job requirements
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="analyze">Analyze Job</TabsTrigger>
          <TabsTrigger value="skills" disabled={!isAnalyzed}>Skill Analysis</TabsTrigger>
          <TabsTrigger value="resources" disabled={!isAnalyzed}>Learning Resources</TabsTrigger>
        </TabsList>
        
        {/* Analyze Job Tab */}
        <TabsContent value="analyze" className="space-y-4">
          {!isAnalyzed ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="job-title">Job Title</Label>
                <Input 
                  id="job-title" 
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Senior Frontend Developer" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="job-description">Job Description</Label>
                <Textarea 
                  id="job-description" 
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here..."
                  className="min-h-[200px]"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={handleAnalyze}
                  disabled={!jobTitle.trim() || !jobDescription.trim() || isAnalyzing}
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze Skills"}
                </Button>
                <p className="text-sm text-muted-foreground">
                  or
                </p>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Job Posting PDF
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{jobTitle}</h3>
                  <p className="text-muted-foreground">Skills analysis complete</p>
                </div>
                <Button variant="outline" onClick={() => {
                  setIsAnalyzed(false);
                  setJobTitle("");
                  setJobDescription("");
                }}>
                  Analyze New Job
                </Button>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Match Score</CardTitle>
                    <CardDescription>How well your skills match the job requirements</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-col items-center justify-center py-6">
                      <div className="relative w-40 h-40 mb-4">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-muted"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            strokeDasharray="251.2"
                            strokeDashoffset={251.2 - (251.2 * matchPercentage) / 100}
                            className={matchPercentage >= 70 ? "text-green-500" : matchPercentage >= 50 ? "text-amber-500" : "text-red-500"}
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                          <span className="text-4xl font-bold">{matchPercentage}%</span>
                          <span className="text-sm text-muted-foreground">Match</span>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        {matchPercentage >= 80 ? (
                          <Badge className="bg-green-500">Strong Match</Badge>
                        ) : matchPercentage >= 60 ? (
                          <Badge className="bg-blue-500">Good Match</Badge>
                        ) : matchPercentage >= 40 ? (
                          <Badge className="bg-amber-500">Potential Match</Badge>
                        ) : (
                          <Badge className="bg-red-500">Significant Gaps</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Skill Gap Summary</CardTitle>
                    <CardDescription>Key areas to focus on for improvement</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {criticalGaps.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-red-500 flex items-center">
                            <X className="h-4 w-4 mr-1" />
                            Critical Gaps
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {criticalGaps.map((skill, i) => (
                              <Badge key={i} variant="outline" className="border-red-200 bg-red-50 text-red-600">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {significantGaps.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-amber-500 flex items-center">
                            <Circle className="h-4 w-4 mr-1" />
                            Significant Gaps
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {significantGaps.map((skill, i) => (
                              <Badge key={i} variant="outline" className="border-amber-200 bg-amber-50 text-amber-600">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {criticalGaps.length === 0 && significantGaps.length === 0 && (
                        <div className="flex items-center justify-center h-20 text-green-500">
                          <Check className="h-5 w-5 mr-2" />
                          <span>Great job! No significant skill gaps detected.</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Button onClick={() => setActiveTab("skills")} className="w-full">
                      View Detailed Analysis
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Next Steps</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Review Learning Resources</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Explore curated learning resources to address your skill gaps
                          </p>
                          <Button variant="link" className="p-0 h-auto mt-1" onClick={() => setActiveTab("resources")}>
                            View Resources
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <Star className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Enhance Your Resume</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Optimize your resume to highlight relevant skills for this role
                          </p>
                          <Button variant="link" className="p-0 h-auto mt-1">
                            Resume Builder
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Create Cover Letter</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Generate a tailored cover letter addressing your relevant experience
                          </p>
                          <Button variant="link" className="p-0 h-auto mt-1">
                            Cover Letter Generator
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
        
        {/* Skills Analysis Tab */}
        <TabsContent value="skills" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Required Skills Analysis</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                placeholder="Filter skills..."
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            {filteredRequirements.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No skills found matching your filter.</p>
              </div>
            ) : (
              filteredRequirements.map((requirement) => (
                <Card key={requirement.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{requirement.skill}</h4>
                          {requirement.importance === "required" ? (
                            <Badge>Required</Badge>
                          ) : requirement.importance === "preferred" ? (
                            <Badge variant="outline">Preferred</Badge>
                          ) : (
                            <Badge variant="secondary">Bonus</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">Experience: {requirement.experience}</p>
                      </div>
                      
                      <div className="flex-1 max-w-sm space-y-1">
                        <div className="flex justify-between items-center text-sm">
                          <span>Your Level</span>
                          <span className={getLevelColor(requirement.yourLevel)}>
                            {requirement.yourLevel}%
                          </span>
                        </div>
                        <Progress 
                          value={requirement.yourLevel} 
                          className="h-2"
                          indicatorClassName={getProgressColor(requirement.yourLevel)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        {/* Learning Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Recommended Learning Resources</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={resourceFilter}
                onChange={(e) => setResourceFilter(e.target.value)}
                placeholder="Search resources..."
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {filteredResources.length === 0 ? (
              <div className="text-center py-8 md:col-span-2">
                <p className="text-muted-foreground">No resources found matching your search.</p>
              </div>
            ) : (
              filteredResources.map((resource) => {
                const IconComponent = resourceTypeIcons[resource.type] || FileText;
                
                return (
                  <Card key={resource.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <IconComponent className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="space-y-2">
                          <div>
                            <h4 className="font-medium">{resource.title}</h4>
                            <p className="text-sm text-muted-foreground">{resource.provider}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs">
                              {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {resource.level.charAt(0).toUpperCase() + resource.level.slice(1)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {resource.duration}
                            </Badge>
                          </div>
                          <Button asChild size="sm" className="w-full">
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              View Resource
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
          
          <div className="flex justify-center mt-4">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Show More Resources
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SkillGapAnalyzer; 