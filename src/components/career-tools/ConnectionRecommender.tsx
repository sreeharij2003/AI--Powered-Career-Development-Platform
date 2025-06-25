import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, BriefcaseIcon, Building, MessageSquare, Search, Shield, ThumbsUp, UserPlus, Users } from "lucide-react";
import { useState } from "react";

// Mock data for recommended connections
const mockConnections = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Senior Engineering Manager",
    company: "TechCorp Inc.",
    avatar: "/placeholder.svg",
    mutualConnections: 3,
    skills: ["Engineering Leadership", "Product Development", "Agile"],
    bio: "Leading engineering teams building innovative products. Always looking to connect with passionate developers.",
    activity: "Posted about hiring frontend developers 2 days ago"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Technical Recruiter",
    company: "InnovateSoft Solutions",
    avatar: "/placeholder.svg",
    mutualConnections: 5,
    skills: ["Technical Recruiting", "Talent Acquisition", "HR"],
    bio: "I help connect top tech talent with great opportunities. Specializing in dev and product roles.",
    activity: "Shared an article: 'Top Skills for 2023' last week"
  },
  {
    id: 3,
    name: "Alex Rivera",
    role: "Product Manager",
    company: "GlobalTech Industries",
    avatar: "/placeholder.svg",
    mutualConnections: 2,
    skills: ["Product Strategy", "User Research", "Roadmapping"],
    bio: "Product leader with 8+ years experience in B2B SaaS. Previously at Microsoft and Salesforce.",
    activity: "Commented on your recent post yesterday"
  },
  {
    id: 4,
    name: "Jessica Wong",
    role: "Engineering Director",
    company: "CloudServe Technologies",
    avatar: "/placeholder.svg",
    mutualConnections: 0,
    skills: ["Cloud Architecture", "Team Building", "Strategic Planning"],
    bio: "Building and scaling engineering teams. Passionate about mentorship and diversity in tech.",
    activity: "Looking for senior developers this month"
  },
  {
    id: 5,
    name: "David Miller",
    role: "VP of Engineering",
    company: "DataInsight Analytics",
    avatar: "/placeholder.svg",
    mutualConnections: 1,
    skills: ["Engineering Leadership", "Scaling Teams", "Technical Strategy"],
    bio: "Helping companies build and scale engineering organizations. 15+ years in the industry.",
    activity: "Published an article on engineering culture"
  }
];

// Mock data for company insiders
const mockCompanies = [
  {
    id: 1,
    name: "TechCorp Inc.",
    logo: "/placeholder.svg",
    industry: "Software Development",
    size: "1000-5000 employees",
    insiders: [
      {
        id: 101,
        name: "Sarah Johnson",
        role: "Senior Engineering Manager",
        department: "Engineering",
        avatar: "/placeholder.svg"
      },
      {
        id: 102,
        name: "Robert Zhang",
        role: "Principal Engineer",
        department: "Platform",
        avatar: "/placeholder.svg"
      },
      {
        id: 103,
        name: "Maria Garcia",
        role: "Director of Product",
        department: "Product",
        avatar: "/placeholder.svg"
      }
    ]
  },
  {
    id: 2,
    name: "InnovateSoft Solutions",
    logo: "/placeholder.svg",
    industry: "Enterprise Software",
    size: "500-1000 employees",
    insiders: [
      {
        id: 201,
        name: "Michael Chen",
        role: "Technical Recruiter",
        department: "HR",
        avatar: "/placeholder.svg"
      },
      {
        id: 202,
        name: "Emily Wilson",
        role: "Frontend Lead",
        department: "Engineering",
        avatar: "/placeholder.svg"
      }
    ]
  },
  {
    id: 3,
    name: "GlobalTech Industries",
    logo: "/placeholder.svg",
    industry: "Technology Services",
    size: "5000+ employees",
    insiders: [
      {
        id: 301,
        name: "Alex Rivera",
        role: "Product Manager",
        department: "Product",
        avatar: "/placeholder.svg"
      },
      {
        id: 302,
        name: "James Smith",
        role: "Senior Software Engineer",
        department: "Engineering",
        avatar: "/placeholder.svg"
      },
      {
        id: 303,
        name: "Priya Patel",
        role: "UX Designer",
        department: "Design",
        avatar: "/placeholder.svg"
      }
    ]
  }
];

const ConnectionRecommender = () => {
  const [activeTab, setActiveTab] = useState("people");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  
  const filteredConnections = mockConnections.filter((connection) => 
    connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.company.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredCompanies = mockCompanies.filter((company) => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Connection Recommender</h2>
        <p className="text-muted-foreground">
          Build your professional network with personalized connection recommendations
        </p>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, role, company..."
          className="pl-9 pr-4"
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="people">Recommended People</TabsTrigger>
          <TabsTrigger value="companies">Company Insiders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="people" className="space-y-4 pt-4">
          {filteredConnections.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No connections found matching your search.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredConnections.map((connection) => (
                <Card key={connection.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={connection.avatar} alt={connection.name} />
                          <AvatarFallback>{connection.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{connection.name}</CardTitle>
                          <CardDescription>{connection.role}</CardDescription>
                        </div>
                      </div>
                      <Button size="sm" variant="secondary" className="h-8">
                        <UserPlus className="h-4 w-4 mr-1" />
                        Connect
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <Building className="h-4 w-4 mr-1" />
                      {connection.company}
                      {connection.mutualConnections > 0 && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {connection.mutualConnections} mutual
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm mb-2">{connection.bio}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {connection.skills.map((skill, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground border-t pt-2">
                      <ThumbsUp className="h-3 w-3 inline mr-1" />
                      {connection.activity}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex gap-2 w-full justify-end">
                      <Button variant="ghost" size="sm" className="h-8">
                        <MessageSquare className="h-3.5 w-3.5 mr-1" />
                        Message
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="companies" className="space-y-4 pt-4">
          {selectedCompany === null ? (
            <>
              {filteredCompanies.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No companies found matching your search.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredCompanies.map((company) => (
                    <Card key={company.id} className="cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setSelectedCompany(company.id)}>
                      <CardHeader className="pb-2">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 rounded-md border flex items-center justify-center">
                            <img src={company.logo} alt={company.name} className="w-8 h-8" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{company.name}</CardTitle>
                            <CardDescription>{company.industry}</CardDescription>
                            <p className="text-xs text-muted-foreground mt-1">{company.size}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{company.insiders.length} connections inside</span>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Button variant="ghost" size="sm" className="w-full">
                          View Company Insiders
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedCompany(null)}>
                    <span className="sr-only">Back</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m15 18-6-6 6-6"/></svg>
                  </Button>
                  
                  {(() => {
                    const company = mockCompanies.find(c => c.id === selectedCompany);
                    if (!company) return null;
                    
                    return (
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-md border flex items-center justify-center">
                          <img src={company.logo} alt={company.name} className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-medium">{company.name}</h3>
                          <p className="text-xs text-muted-foreground">{company.industry}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <Button variant="outline" size="sm">
                  <span className="sr-only">Follow company</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><line x1="12" x2="12" y1="10" y2="16"/><line x1="9" x2="15" y1="13" y2="13"/></svg>
                  Follow
                </Button>
              </div>
              
              <div className="space-y-1 mb-4">
                <h3 className="text-sm font-medium">Insiders at this company</h3>
                <p className="text-xs text-muted-foreground">Connect with people who can help you get your foot in the door</p>
              </div>
              
              {(() => {
                const company = mockCompanies.find(c => c.id === selectedCompany);
                if (!company) return null;
                
                return (
                  <div className="space-y-3">
                    {company.insiders.map((insider) => (
                      <Card key={insider.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex gap-3">
                              <Avatar>
                                <AvatarImage src={insider.avatar} alt={insider.name} />
                                <AvatarFallback>{insider.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium text-sm">{insider.name}</h4>
                                <p className="text-xs text-muted-foreground">{insider.role}</p>
                                <div className="flex items-center mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    <BriefcaseIcon className="h-3 w-3 mr-1" />
                                    {insider.department}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <Button size="sm" variant="secondary" className="h-8">
                              <UserPlus className="h-4 w-4 mr-1" />
                              Connect
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                );
              })()}
              
              <div className="border rounded-md p-4 space-y-3 bg-muted/20">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Connection Insights</h3>
                    <p className="text-xs text-muted-foreground">
                      Employees in the engineering department are most likely to respond to your connection requests.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Connecting Tips</h3>
                    <p className="text-xs text-muted-foreground">
                      Mention specific skills or interests you share when sending a connection request for higher acceptance rates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConnectionRecommender; 