import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, FileText, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const ResumeBuilder = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [resumePreview, setResumePreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Form state
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    portfolio: "",
    linkedin: ""
  });
  
  const [workExperience, setWorkExperience] = useState([
    { 
      title: "", 
      company: "", 
      location: "", 
      startDate: "", 
      endDate: "", 
      current: false,
      description: "" 
    }
  ]);
  
  const [education, setEducation] = useState([
    { 
      degree: "", 
      institution: "", 
      location: "", 
      startDate: "", 
      endDate: "", 
      gpa: "",
      description: "" 
    }
  ]);
  
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const addWorkExperience = () => {
    setWorkExperience([
      ...workExperience, 
      { 
        title: "", 
        company: "", 
        location: "", 
        startDate: "", 
        endDate: "", 
        current: false,
        description: "" 
      }
    ]);
  };

  const removeWorkExperience = (index: number) => {
    setWorkExperience(workExperience.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    setEducation([
      ...education, 
      { 
        degree: "", 
        institution: "", 
        location: "", 
        startDate: "", 
        endDate: "", 
        gpa: "",
        description: "" 
      }
    ]);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleGenerateResume = () => {
    setIsGenerating(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsGenerating(false);
      setResumePreview(true);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {!resumePreview ? (
        <>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">AI Resume Builder</h2>
            <p className="text-muted-foreground">
              Create a professionally formatted resume tailored to your target roles
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
            </TabsList>
            
            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={personalInfo.name}
                    onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                    placeholder="John Doe" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                    placeholder="johndoe@example.com" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                    placeholder="(123) 456-7890" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    value={personalInfo.location}
                    onChange={(e) => setPersonalInfo({...personalInfo, location: e.target.value})}
                    placeholder="San Francisco, CA" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolio">Portfolio/Website</Label>
                  <Input 
                    id="portfolio" 
                    value={personalInfo.portfolio}
                    onChange={(e) => setPersonalInfo({...personalInfo, portfolio: e.target.value})}
                    placeholder="https://yourportfolio.com" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input 
                    id="linkedin" 
                    value={personalInfo.linkedin}
                    onChange={(e) => setPersonalInfo({...personalInfo, linkedin: e.target.value})}
                    placeholder="https://linkedin.com/in/johndoe" 
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setActiveTab("experience")}>Next: Experience</Button>
              </div>
            </TabsContent>

            {/* Work Experience Tab */}
            <TabsContent value="experience" className="space-y-6">
              {workExperience.map((job, index) => (
                <Card key={index} className="relative">
                  {index > 0 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2"
                      onClick={() => removeWorkExperience(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Job Title</Label>
                        <Input 
                          value={job.title}
                          onChange={(e) => {
                            const updated = [...workExperience];
                            updated[index].title = e.target.value;
                            setWorkExperience(updated);
                          }}
                          placeholder="Senior Developer" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Company</Label>
                        <Input 
                          value={job.company}
                          onChange={(e) => {
                            const updated = [...workExperience];
                            updated[index].company = e.target.value;
                            setWorkExperience(updated);
                          }}
                          placeholder="Acme Inc." 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input 
                          value={job.location}
                          onChange={(e) => {
                            const updated = [...workExperience];
                            updated[index].location = e.target.value;
                            setWorkExperience(updated);
                          }}
                          placeholder="San Francisco, CA" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input 
                            type="month" 
                            value={job.startDate}
                            onChange={(e) => {
                              const updated = [...workExperience];
                              updated[index].startDate = e.target.value;
                              setWorkExperience(updated);
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input 
                            type="month" 
                            value={job.endDate}
                            onChange={(e) => {
                              const updated = [...workExperience];
                              updated[index].endDate = e.target.value;
                              setWorkExperience(updated);
                            }}
                            disabled={job.current}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 md:col-span-2">
                        <input
                          type="checkbox"
                          id={`current-job-${index}`}
                          checked={job.current}
                          onChange={(e) => {
                            const updated = [...workExperience];
                            updated[index].current = e.target.checked;
                            setWorkExperience(updated);
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor={`current-job-${index}`}>I currently work here</Label>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Description</Label>
                        <Textarea 
                          value={job.description}
                          onChange={(e) => {
                            const updated = [...workExperience];
                            updated[index].description = e.target.value;
                            setWorkExperience(updated);
                          }}
                          placeholder="Describe your responsibilities and achievements..."
                          rows={4}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button 
                variant="outline" 
                onClick={addWorkExperience}
                className="w-full flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Another Position
              </Button>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("personal")}>Previous: Personal</Button>
                <Button onClick={() => setActiveTab("education")}>Next: Education</Button>
              </div>
            </TabsContent>

            {/* Education Tab */}
            <TabsContent value="education" className="space-y-6">
              {education.map((edu, index) => (
                <Card key={index} className="relative">
                  {index > 0 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2"
                      onClick={() => removeEducation(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Degree/Certificate</Label>
                        <Input 
                          value={edu.degree}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[index].degree = e.target.value;
                            setEducation(updated);
                          }}
                          placeholder="Bachelor of Science in Computer Science" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Institution</Label>
                        <Input 
                          value={edu.institution}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[index].institution = e.target.value;
                            setEducation(updated);
                          }}
                          placeholder="University of Technology" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input 
                          value={edu.location}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[index].location = e.target.value;
                            setEducation(updated);
                          }}
                          placeholder="San Francisco, CA" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>GPA (Optional)</Label>
                        <Input 
                          value={edu.gpa}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[index].gpa = e.target.value;
                            setEducation(updated);
                          }}
                          placeholder="3.8" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input 
                            type="month" 
                            value={edu.startDate}
                            onChange={(e) => {
                              const updated = [...education];
                              updated[index].startDate = e.target.value;
                              setEducation(updated);
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input 
                            type="month" 
                            value={edu.endDate}
                            onChange={(e) => {
                              const updated = [...education];
                              updated[index].endDate = e.target.value;
                              setEducation(updated);
                            }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Additional Information (Optional)</Label>
                        <Textarea 
                          value={edu.description}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[index].description = e.target.value;
                            setEducation(updated);
                          }}
                          placeholder="Relevant coursework, achievements, activities..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button 
                variant="outline" 
                onClick={addEducation}
                className="w-full flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Another Education
              </Button>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("experience")}>Previous: Experience</Button>
                <Button onClick={() => setActiveTab("skills")}>Next: Skills</Button>
              </div>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input 
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill (e.g. JavaScript, Project Management)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                    />
                  </div>
                  <Button onClick={addSkill}>Add</Button>
                </div>
                
                <div className="border rounded-md p-4 min-h-[150px]">
                  <div className="flex flex-wrap gap-2">
                    {skills.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No skills added yet. Add your professional skills above.</p>
                    ) : (
                      skills.map((skill, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          className="flex items-center gap-1 px-3 py-1.5"
                        >
                          {skill}
                          <button 
                            onClick={() => removeSkill(skill)}
                            className="ml-1 rounded-full hover:bg-muted-foreground/20 p-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("education")}>Previous: Education</Button>
                <Button 
                  onClick={handleGenerateResume} 
                  disabled={isGenerating || !personalInfo.name}
                >
                  {isGenerating ? "Generating..." : "Generate Resume"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">Your Generated Resume</h2>
              <p className="text-muted-foreground">
                Optimized for ATS systems and hiring managers
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setResumePreview(false)}>
                Edit Resume
              </Button>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
          
          <Card className="border-2 shadow-md">
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center space-y-2 border-b pb-4">
                  <h1 className="text-2xl font-bold">{personalInfo.name || "John Doe"}</h1>
                  <div className="flex flex-wrap justify-center gap-x-4 text-sm text-muted-foreground">
                    {personalInfo.email && <span>{personalInfo.email}</span>}
                    {personalInfo.phone && <span>{personalInfo.phone}</span>}
                    {personalInfo.location && <span>{personalInfo.location}</span>}
                  </div>
                  <div className="flex flex-wrap justify-center gap-x-4 text-sm text-muted-foreground">
                    {personalInfo.portfolio && <span>{personalInfo.portfolio}</span>}
                    {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
                  </div>
                </div>
                
                {/* Skills */}
                {skills.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold border-b pb-1">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, index) => (
                        <Badge key={index} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Experience */}
                {workExperience.some(job => job.title || job.company) && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold border-b pb-1">Professional Experience</h2>
                    {workExperience.filter(job => job.title || job.company).map((job, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-medium">{job.title || "Position Title"}</h3>
                          <span className="text-sm text-muted-foreground">
                            {job.startDate && new Date(job.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                            {" - "}
                            {job.current ? "Present" : (job.endDate && new Date(job.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }))}
                          </span>
                        </div>
                        <div className="text-muted-foreground">
                          {job.company}
                          {job.location && ` • ${job.location}`}
                        </div>
                        <p className="text-sm mt-2 whitespace-pre-line">{job.description}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Education */}
                {education.some(edu => edu.degree || edu.institution) && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold border-b pb-1">Education</h2>
                    {education.filter(edu => edu.degree || edu.institution).map((edu, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-medium">{edu.degree || "Degree"}</h3>
                          <span className="text-sm text-muted-foreground">
                            {edu.startDate && new Date(edu.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                            {" - "}
                            {edu.endDate && new Date(edu.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <div className="text-muted-foreground">
                          {edu.institution}
                          {edu.location && ` • ${edu.location}`}
                          {edu.gpa && ` • GPA: ${edu.gpa}`}
                        </div>
                        {edu.description && <p className="text-sm mt-2">{edu.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="border rounded-md p-6 bg-muted/20 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">AI Enhancement Applied</h3>
                <p className="text-sm text-muted-foreground">
                  Your resume has been optimized with industry-specific keywords and formatting best practices.
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="border rounded-md p-3 bg-background">
                <h4 className="text-sm font-medium">ATS Optimization</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Resume is formatted to pass through applicant tracking systems
                </p>
              </div>
              <div className="border rounded-md p-3 bg-background">
                <h4 className="text-sm font-medium">Keyword Enhancement</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Industry-specific terms added for better matching
                </p>
              </div>
              <div className="border rounded-md p-3 bg-background">
                <h4 className="text-sm font-medium">Layout Optimization</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Professional formatting with consistent spacing and hierarchy
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder; 