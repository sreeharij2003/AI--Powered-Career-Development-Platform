import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, LineChart, Line } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart4, Layers, Award, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const progressData = [
  { milestone: "Network Growth", completed: 85, total: 100 },
  { milestone: "Skill Development", completed: 62, total: 100 },
  { milestone: "Career Path Progress", completed: 45, total: 100 },
  { milestone: "Application Success", completed: 30, total: 100 },
];

const skillData = [
  { name: "Python", user: 85, industry: 75 },
  { name: "Cloud Architecture", user: 35, industry: 80 },
  { name: "Machine Learning", user: 65, industry: 70 },
  { name: "Management", user: 90, industry: 65 },
  { name: "Data Analysis", user: 75, industry: 60 },
];

const applicationData = [
  { name: "Jan", applications: 12, interviews: 3, offers: 1 },
  { name: "Feb", applications: 15, interviews: 4, offers: 0 },
  { name: "Mar", applications: 8, interviews: 5, offers: 2 },
  { name: "Apr", applications: 20, interviews: 7, offers: 1 },
  { name: "May", applications: 14, interviews: 4, offers: 1 },
  { name: "Jun", applications: 18, interviews: 6, offers: 2 },
];

const opportunityData = [
  { 
    title: "Quantum Computing Roles", 
    location: "Berlin",
    growth: "+30%",
    description: "Senior roles in quantum computing have increased significantly this month.",
    matchScore: 78 
  },
  { 
    title: "AI Product Management", 
    location: "Remote",
    growth: "+25%",
    description: "Companies are actively hiring AI product managers with technical backgrounds.",
    matchScore: 92 
  },
  { 
    title: "Cloud Security Specialists", 
    location: "London",
    growth: "+18%",
    description: "Growing demand for security specialists with cloud expertise.",
    matchScore: 65 
  }
];

const ProgressDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  const chartConfig = {
    user: { label: "Your skills" },
    industry: { label: "Industry benchmark" },
    applications: { label: "Applications" },
    interviews: { label: "Interviews" },
    offers: { label: "Offers" },
  };

  return (
    <div>
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <Award size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CTO Readiness</p>
                    <p className="text-2xl font-bold">67%</p>
                    <p className="text-sm text-green-600">+12% from last quarter</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <Layers size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Skills Acquired</p>
                    <p className="text-2xl font-bold">24/35</p>
                    <p className="text-sm text-amber-600">3 learning now</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <BarChart4 size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Interview Rate</p>
                    <p className="text-2xl font-bold">28%</p>
                    <p className="text-sm text-green-600">+5% from average</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time to Milestone</p>
                    <p className="text-2xl font-bold">1.5 yrs</p>
                    <p className="text-sm text-muted-foreground">Estimated</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Career Milestone Progress</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={progressData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis type="category" dataKey="milestone" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" fill="#8884d8" name="Completed" />
                      <Bar dataKey="total" fill="#eaeaea" name="Total Required" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="skills" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Skills Heatmap</h3>
              <p className="text-muted-foreground mb-6">
                Compare your skills against industry benchmarks for CTO roles
              </p>
              <div className="h-80">
                <ChartContainer 
                  className="h-80"
                  config={chartConfig}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={skillData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="user" fill="#8884d8" name="Your Skills" />
                      <Bar dataKey="industry" fill="#82ca9d" name="Industry Benchmark" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="applications" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Application Performance</h3>
              <div className="h-80">
                <ChartContainer 
                  className="h-80"
                  config={chartConfig}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={applicationData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="applications" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="interviews" stroke="#82ca9d" />
                      <Line type="monotone" dataKey="offers" stroke="#ffc658" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="opportunities" className="mt-6">
          <div className="grid gap-4">
            {opportunityData.map((opportunity, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{opportunity.title}</h4>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                          {opportunity.growth}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{opportunity.location}</p>
                      <p className="mt-2">{opportunity.description}</p>
                    </div>
                    <div className="sm:text-right">
                      <div className="text-2xl font-bold">{opportunity.matchScore}%</div>
                      <p className="text-xs text-muted-foreground">Match Score</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Explore
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressDashboard;
