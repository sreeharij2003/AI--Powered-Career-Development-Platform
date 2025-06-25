import CareerPathPredictor from "@/components/career-tools/CareerPathPredictor";
import ConnectionRecommender from "@/components/career-tools/ConnectionRecommender";
import CoverLetterGenerator from "@/components/career-tools/CoverLetterGenerator";
import ResumeBuilder from "@/components/career-tools/ResumeBuilder";
import ResumeCustomizer from "@/components/career-tools/ResumeCustomizer";
import ResumeJobRecommendations from "@/components/dashboard/ResumeJobRecommendations";
import SalaryFilter from "@/components/dashboard/SalaryFilter";
import SkillsAssessment from "@/components/dashboard/SkillsAssessment";
import MainLayout from "@/components/layout/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClerkAuthContext } from "@/contexts/ClerkAuthContext";
import { BookmarkIcon, BriefcaseIcon, Building2Icon, Clock4Icon, FileTextIcon, FilterIcon, LineChartIcon, MapPinIcon, MoreHorizontalIcon, SearchIcon, StarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

// Mock data
const mockJobs = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA (Remote)",
    salary: "$120,000 - $150,000",
    posted: "2 days ago",
    logo: "/placeholder.svg",
    matchPercentage: 95,
    tags: ["React", "TypeScript", "UI/UX"],
    description: "Join our team to build cutting-edge user interfaces for enterprise applications."
  },
  {
    id: 2,
    title: "Full Stack Engineer",
    company: "InnovateSoft Solutions",
    location: "New York, NY",
    salary: "$110,000 - $140,000",
    posted: "1 week ago",
    logo: "/placeholder.svg",
    matchPercentage: 87,
    tags: ["Node.js", "React", "MongoDB"],
    description: "Looking for a skilled full-stack developer to work on our SaaS platform."
  },
  {
    id: 3,
    title: "Product Manager",
    company: "GlobalTech Industries",
    location: "Austin, TX (Hybrid)",
    salary: "$130,000 - $160,000",
    posted: "3 days ago",
    logo: "/placeholder.svg",
    matchPercentage: 82,
    tags: ["Product Development", "Agile", "B2B"],
    description: "Drive product strategy and roadmap for our enterprise solutions."
  }
];

const recentApplications = [
  {
    id: 1,
    position: "Software Engineer",
    company: "TechCorp Inc.",
    date: "2 days ago",
    status: "Application submitted"
  },
  {
    id: 2,
    position: "UX Designer",
    company: "InnovateSoft Solutions",
    date: "5 days ago",
    status: "Interview scheduled"
  },
  {
    id: 3,
    position: "Data Analyst",
    company: "GlobalTech Industries",
    date: "1 week ago",
    status: "Skills assessment completed"
  }
];

const savedJobs = [
  {
    id: 4,
    title: "DevOps Engineer",
    company: "CloudServe Technologies",
    location: "Boston, MA",
    posted: "5 days ago"
  },
  {
    id: 5,
    title: "Machine Learning Engineer",
    company: "DataInsight Analytics",
    location: "Seattle, WA",
    posted: "3 days ago"
  }
];

const Dashboard = () => {
  const { user } = useClerkAuthContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeJobFilter, setActiveJobFilter] = useState("recommended");
  const [activeTab, setActiveTab] = useState("jobs");
  const [activeCareerTool, setActiveCareerTool] = useState("path-predictor");
  
  // Get tool parameter from URL
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const toolParam = params.get('tool');
  
  // Set active tab and tool based on URL parameter
  useEffect(() => {
    if (toolParam) {
      setActiveTab('career-tools');
      switch (toolParam) {
        case 'resume-builder':
          setActiveCareerTool('resume-builder');
          break;
        case 'cover-letter':
          setActiveCareerTool('cover-letter');
          break;
        case 'career-path':
          setActiveCareerTool('path-predictor');
          break;
        case 'resume-customizer':
          setActiveCareerTool('resume-customizer');
          break;
        default:
          setActiveCareerTool('path-predictor');
      }
    }
  }, [toolParam]);

  // User profile with skills for job recommendations
  const userProfile = {
    skills: ["JavaScript", "React", "TypeScript", "Node.js", "CSS", "HTML"],
    location: "San Francisco, CA",
    jobTitle: "Software Developer",
    experience: "5",
    interests: ["Frontend Development", "UI/UX Design", "Web Applications"]
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-4 md:px-6">
        <h1 className="text-3xl font-bold mb-2">Career Dashboard</h1>
        <p className="text-muted-foreground mb-6">
          Find your dream job with personalized recommendations
        </p>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full border-b bg-transparent p-0 justify-start">
            <TabsTrigger 
              value="jobs" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
            >
              Job Recommendations
            </TabsTrigger>
            <TabsTrigger 
              value="skills" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
            >
              Skills Assessment
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="career-tools" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
            >
              Career Tools
            </TabsTrigger>
          </TabsList>
          
          {/* Jobs Tab */}
          <TabsContent value="jobs" className="m-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left sidebar - User profile and filters */}
              <div className="lg:col-span-3 space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>Profile</CardTitle>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to="/settings">
                          <MoreHorizontalIcon className="h-5 w-5" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Avatar className="h-20 w-20 mx-auto">
                      <AvatarImage src={user?.imageUrl || ""} alt={user?.firstName || "User"} />
                      <AvatarFallback>{(user?.firstName?.[0] || "U") + (user?.lastName?.[0] || "")}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-medium text-lg mt-2">{user?.firstName} {user?.lastName}</h3>
                    <p className="text-muted-foreground text-sm">{userProfile.jobTitle}</p>
                    <div className="flex justify-center gap-2 mt-2">
                      <Badge variant="outline" className="flex items-center">
                        <MapPinIcon className="h-3 w-3 mr-1" />
                        {userProfile.location}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col items-stretch gap-2 pt-0">
                    <Button asChild variant="secondary">
                      <Link to="/profile">Profile Completeness</Link>
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Job Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Industry</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="secondary">Technology</Badge>
                        <Badge variant="secondary">Software</Badge>
                        <Badge variant="secondary">Web Development</Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Job Type</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="secondary">Full-time</Badge>
                        <Badge variant="secondary">Remote</Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Salary Expectation</p>
                      <p className="text-sm">$100,000 - $150,000 / year</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Location Preference</p>
                      <p className="text-sm">San Francisco, Remote</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      Edit Preferences
                    </Button>
                  </CardFooter>
                </Card>

                {/* Filters moved to left side */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Job Filters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Job Type</p>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant={activeJobFilter === "recommended" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveJobFilter("recommended")}
                        >
                          <StarIcon className="h-4 w-4 mr-2" />
                          Recommended
                        </Button>
                        <Button 
                          variant={activeJobFilter === "recent" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveJobFilter("recent")}
                        >
                          <Clock4Icon className="h-4 w-4 mr-2" />
                          Recent
                        </Button>
                        <Button 
                          variant={activeJobFilter === "nearby" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveJobFilter("nearby")}
                        >
                          <MapPinIcon className="h-4 w-4 mr-2" />
                          Nearby
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Search</p>
                      <div className="relative">
                        <SearchIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <input 
                          type="text" 
                          placeholder="Search jobs..." 
                          className="pl-9 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-full"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Button variant="outline" size="sm" className="w-full">
                        <FilterIcon className="h-4 w-4 mr-2" />
                        More Filters
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <SalaryFilter />
              </div>
              
              {/* Main content - Job recommendations */}
              <div className="lg:col-span-6 space-y-6">
                <ResumeJobRecommendations />
              </div>
              
              {/* Right sidebar - Recent Applications and Saved Jobs */}
              <div className="lg:col-span-3 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Applications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentApplications.map((app) => (
                      <div key={app.id} className="border-b pb-3 last:border-0 last:pb-0">
                        <p className="font-medium">{app.position}</p>
                        <p className="text-sm text-muted-foreground">{app.company}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground">{app.date}</span>
                          <Badge variant="outline" className="text-xs">{app.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      View All Applications
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Saved Jobs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {savedJobs.map((job) => (
                      <div key={job.id} className="border-b pb-3 last:border-0 last:pb-0">
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground">{job.location}</span>
                          <span className="text-xs text-muted-foreground">{job.posted}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      View All Saved Jobs
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Skills Assessment Tab */}
          <TabsContent value="skills" className="pt-6">
            <SkillsAssessment />
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics" className="pt-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Job Application Analytics</h2>
                  <p className="text-muted-foreground">
                    Track your application progress and performance
                  </p>
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    Last 30 Days
                  </Button>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500">↑ 12%</span> from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Interviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">7</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500">↑ 16%</span> from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Response Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">29%</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500">↑ 5%</span> from last month
                    </p>
                  </CardContent>
                </Card>
            <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Time to Interview</CardTitle>
              </CardHeader>
              <CardContent>
                    <div className="text-2xl font-bold">4.2 days</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-red-500">↓ 1.5 days</span> from last month
                    </p>
              </CardContent>
            </Card>
              </div>
          
            <Card>
              <CardHeader>
                  <CardTitle>Application Status Breakdown</CardTitle>
              </CardHeader>
                <CardContent className="h-96 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <p>Chart visualization would be displayed here</p>
                    <p className="text-sm">Showing application status distribution</p>
                  </div>
              </CardContent>
            </Card>
              
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Most Applied Job Categories</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <p>Chart visualization would be displayed here</p>
                      <p className="text-sm">Showing top job categories</p>
                    </div>
                  </CardContent>
                </Card>
            <Card>
              <CardHeader>
                    <CardTitle>Application Activity Over Time</CardTitle>
              </CardHeader>
                  <CardContent className="h-64 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <p>Chart visualization would be displayed here</p>
                      <p className="text-sm">Showing activity trends</p>
                    </div>
              </CardContent>
            </Card>
              </div>
            </div>
          </TabsContent>

          {/* Career Tools Tab */}
          <TabsContent value="career-tools" className="pt-6">
            <div className="space-y-6">
              <Tabs value={activeCareerTool} onValueChange={setActiveCareerTool} className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">Career Development Tools</h2>
                    <p className="text-muted-foreground">
                      Advanced tools to accelerate your career growth
                    </p>
                  </div>
                  <div>
                    {/* Could add an export/share/help button here */}
                  </div>
                </div>

                <TabsList className="w-full grid grid-cols-5 h-auto">
                  <TabsTrigger value="path-predictor" className="py-3 data-[state=active]:bg-muted">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <LineChartIcon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-xs">Career Path</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="resume-builder" className="py-3 data-[state=active]:bg-muted">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <BriefcaseIcon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-xs">Resume Builder</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="connections" className="py-3 data-[state=active]:bg-muted">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2Icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-xs">Connections</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="resume-customizer" className="py-3 data-[state=active]:bg-muted">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileTextIcon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-xs">Resume Customizer</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="cover-letter" className="py-3 data-[state=active]:bg-muted">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <BookmarkIcon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-xs">Cover Letter</span>
                    </div>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="path-predictor" className="pt-6">
                  <CareerPathPredictor />
                </TabsContent>
                
                <TabsContent value="resume-builder" className="pt-6">
                  <ResumeBuilder />
                </TabsContent>
                
                <TabsContent value="connections" className="pt-6">
                  <ConnectionRecommender />
                </TabsContent>
                
                <TabsContent value="resume-customizer" className="pt-6">
                  <ResumeCustomizer />
                </TabsContent>
                
                <TabsContent value="cover-letter" className="pt-6">
                  <CoverLetterGenerator />
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
