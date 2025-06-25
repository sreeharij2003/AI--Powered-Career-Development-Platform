import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { API } from "@/services/api";
import {
    Award,
    BookOpen,
    Briefcase,
    FileText,
    GraduationCap,
    HelpCircle,
    Languages,
    Move,
    Plus,
    Sparkles,
    Star,
    Trash2,
    User
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Import AI features
import {
    GenerateBulletPointsDialog,
    GenerateSummaryDialog,
    ImproveTextButton
} from "./AIResumeFeatures";

// Define section types to maintain type safety
type ResumeSection = 
  | "contact" 
  | "summary" 
  | "education" 
  | "projects" 
  | "skills" 
  | "certifications" 
  | "interests" 
  | "activities" 
  | "volunteering" 
  | "languages" 
  | "experience" 
  | "awards" 
  | "publications" 
  | "workshops" 
  | "hobbies" 
  | "socialOutreach" 
  | "customSections";

// Add new types for custom/manual sections
interface CustomSection {
  id: string;
  header: string;
  content: string;
}

// Resume structure
interface Resume {
  contact: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    linkedin?: string;
    address?: string;
    website?: string;
  };
  summary: string;
  education: Array<{
    id: string;
    degree: string;
    major: string;
    institution: string;
    year: string;
    gpa?: string;
    details?: string;
  }>;
  projects: Array<{
    id: string;
    title: string;
    description: string;
    technologies: string;
    duration: string;
    link?: string;
  }>;
  skills: Array<{
    id: string;
    name: string;
    category?: string;
    proficiency: "beginner" | "intermediate" | "advanced" | "expert";
  }>;
  certifications: Array<{
    id: string;
    name: string;
    organization: string;
    date: string;
    details?: string;
  }>;
  interests: string[];
  activities: Array<{
    id: string;
    name: string;
    role: string;
    duration: string;
    description: string;
  }>;
  volunteering: Array<{
    id: string;
    organization: string;
    role: string;
    duration: string;
    description: string;
  }>;
  languages: Array<{
    id: string;
    name: string;
    proficiency: "basic" | "intermediate" | "fluent" | "native";
  }>;
  experience: Array<{
    id: string;
    title: string;
    company: string;
    duration: string;
    responsibilities: string;
    location?: string;
    achievements?: string;
  }>;
  awards: Array<{
    id: string;
    name: string;
    organization: string;
    date: string;
    details?: string;
  }>;
  publications: Array<{
    id: string;
    title: string;
    publication: string;
    date: string;
    link?: string;
  }>;
  workshops: Array<{
    id: string;
    title: string;
    organization: string;
    date: string;
    details?: string;
  }>;
  hobbies: string[];
  socialOutreach: Array<{
    id: string;
    title: string;
    date: string;
    description: string;
  }>;
  customSections: CustomSection[];
}

// Define section metadata for UI rendering
interface SectionMetadata {
  id: ResumeSection;
  title: string;
  icon: React.ElementType;
  required: boolean;
  description: string;
  helpText: string;
}

const sectionsList: SectionMetadata[] = [
  {
    id: "summary",
    title: "Profile Summary",
    icon: BookOpen,
    required: true,
    description: "Brief overview of your career goals and strengths",
    helpText: "Keep it concise (2-3 sentences) and highlight your key strengths and career objectives."
  },
  {
    id: "education",
    title: "Education Details",
    icon: GraduationCap,
    required: true,
    description: "Your academic background",
    helpText: "List your most recent education first. Include relevant coursework if applicable."
  },
  {
    id: "projects",
    title: "Projects",
    icon: FileText,
    required: true,
    description: "Showcase your practical skills",
    helpText: "Highlight projects that demonstrate relevant skills for your target roles."
  },
  {
    id: "skills",
    title: "Technical Skills",
    icon: Star,
    required: true,
    description: "Your professional competencies",
    helpText: "Group skills by category and indicate proficiency level."
  },
  {
    id: "interests",
    title: "Areas of Interest",
    icon: Star,
    required: false,
    description: "Professional interests",
    helpText: "List areas in your field that you're particularly passionate about."
  },
  {
    id: "certifications",
    title: "Certifications",
    icon: Award,
    required: false,
    description: "Professional qualifications",
    helpText: "Include relevant certifications that validate your expertise."
  },
  {
    id: "experience",
    title: "Work Experience",
    icon: Briefcase,
    required: false,
    description: "Professional history",
    helpText: "List your most recent positions first. Focus on achievements rather than daily tasks."
  },
  {
    id: "activities",
    title: "Extracurricular Activities",
    icon: Star,
    required: false,
    description: "Beyond academics and work",
    helpText: "Include activities that highlight leadership, teamwork, or other soft skills."
  },
  {
    id: "socialOutreach",
    title: "Social Outreach",
    icon: User,
    required: false,
    description: "Community engagement",
    helpText: "Highlight community outreach activities."
  },
  {
    id: "languages",
    title: "Languages",
    icon: Languages,
    required: false,
    description: "Language proficiencies",
    helpText: "Indicate your level of proficiency for each language."
  },
  {
    id: "customSections",
    title: "Custom Sections",
    icon: Star,
    required: false,
    description: "Custom sections",
    helpText: "Add custom sections to your resume."
  }
];

// Helper function to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Create empty resume template
const createEmptyResume = (): Resume => ({
  contact: {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    linkedin: "",
    address: "",
    website: "",
  },
  summary: "",
  education: [{ 
    id: generateId(),
    degree: "", 
    major: "", 
    institution: "", 
    year: "", 
    gpa: "", 
    details: "" 
  }],
  projects: [{ 
    id: generateId(),
    title: "", 
    description: "", 
    technologies: "", 
    duration: "", 
    link: "" 
  }],
  skills: [{ 
    id: generateId(),
    name: "", 
    proficiency: "intermediate" 
  }],
  certifications: [],
  interests: [],
  activities: [],
  volunteering: [],
  languages: [],
  experience: [],
  awards: [],
  publications: [],
  workshops: [],
  hobbies: [],
  socialOutreach: [],
  customSections: []
});

const ResumeBuilder = () => {
  const [resume, setResume] = useState<Resume>(createEmptyResume());
  const [activeSections, setActiveSections] = useState<ResumeSection[]>([
    "contact", "summary", "education", "projects", "skills"
  ]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<ResumeSection>("contact");
  const [visibleSections, setVisibleSections] = useState<ResumeSection[]>([
    "contact", "summary", "education", "experience", "skills"
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [bulletPointsDialogOpen, setBulletPointsDialogOpen] = useState(false);
  const [improvingText, setImprovingText] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [generationData, setGenerationData] = useState({
    experience: "Entry Level",
    jobTitle: "",
    skills: [] as string[],
    role: "",
    responsibilities: "",
    jobType: "Job",
    currentText: "",
    context: "summary"
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>("classic");
  const [customHeaderInput, setCustomHeaderInput] = useState("");

  // Handle adding a new section
  const addSection = (sectionId: ResumeSection) => {
    if (!activeSections.includes(sectionId)) {
      setActiveSections([...activeSections, sectionId]);
      toast.success(`Added ${sectionId} section to your resume`);
    }
  };

  // Handle removing a section
  const removeSection = (sectionId: ResumeSection) => {
    if (sectionId === "contact" || sectionId === "summary") {
      toast.error("Cannot remove required sections");
      return;
    }
    setActiveSections(activeSections.filter(s => s !== sectionId));
    toast.success(`Removed ${sectionId} section from your resume`);
  };

  // Handle adding a new item to an array section
  const addItem = (sectionKey: keyof Resume) => {
    if (!Array.isArray(resume[sectionKey])) return;
    
    let newItem: any = { id: generateId() };
    
    // Define default structure based on section type
    switch (sectionKey) {
      case "education":
        newItem = { ...newItem, degree: "", major: "", institution: "", year: "", gpa: "", details: "" };
        break;
      case "projects":
        newItem = { ...newItem, title: "", description: "", technologies: "", duration: "", link: "" };
        break;
      case "skills":
        newItem = { ...newItem, name: "", proficiency: "intermediate" };
        break;
      case "certifications":
        newItem = { ...newItem, name: "", organization: "", date: "", details: "" };
        break;
      case "activities":
        newItem = { ...newItem, name: "", role: "", duration: "", description: "" };
        break;
      case "volunteering":
        newItem = { ...newItem, organization: "", role: "", duration: "", description: "" };
        break;
      case "languages":
        newItem = { ...newItem, name: "", proficiency: "intermediate" };
        break;
      case "experience":
        newItem = { ...newItem, title: "", company: "", duration: "", responsibilities: "", location: "", achievements: "" };
        break;
      case "awards":
        newItem = { ...newItem, name: "", organization: "", date: "", details: "" };
        break;
      case "publications":
        newItem = { ...newItem, title: "", publication: "", date: "", link: "" };
        break;
      case "workshops":
        newItem = { ...newItem, title: "", organization: "", date: "", details: "" };
        break;
      case "socialOutreach":
        newItem = { ...newItem, title: "", date: "", description: "" };
        break;
      case "customSections":
        newItem = { ...newItem, id: "", header: "", content: "" };
        break;
      default:
        return;
    }

    setResume({
      ...resume,
      [sectionKey]: [...(resume[sectionKey] as any[]), newItem]
    });
  };

  // Handle removing an item from an array section
  const removeItem = (sectionKey: keyof Resume, itemId: string) => {
    if (!Array.isArray(resume[sectionKey])) return;
    
    const updatedItems = (resume[sectionKey] as any[]).filter(item => item.id !== itemId);
    
    // Ensure we don't remove the last item from required sections
    const isRequired = ["education", "projects", "skills"].includes(sectionKey);
    if (isRequired && updatedItems.length === 0) {
      toast.error(`You must have at least one entry in the ${sectionKey} section`);
      return;
    }
    
    setResume({
      ...resume,
      [sectionKey]: updatedItems
    });
  };

  // Handle input changes
  const handleChange = (
    sectionKey: keyof Resume, 
    field: string, 
    value: string, 
    itemId?: string
  ) => {
    if (itemId) {
      // Update array item
      if (Array.isArray(resume[sectionKey])) {
        setResume({
          ...resume,
          [sectionKey]: (resume[sectionKey] as any[]).map(item => 
            item.id === itemId ? { ...item, [field]: value } : item
          )
        });
      }
    } else {
      // Update direct field or nested object field
      if (field.includes('.')) {
        const [parentField, childField] = field.split('.');
        setResume({
          ...resume,
          [parentField]: {
            ...(resume[parentField] as object),
            [childField]: value
          }
        });
      } else {
        setResume({
          ...resume,
          [field]: value
        });
      }
    }
  };

  // Handle simple array updates (like interests, hobbies)
  const handleSimpleArrayChange = (sectionKey: "interests" | "hobbies", value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(Boolean);
    setResume({
      ...resume,
      [sectionKey]: items
    });
  };

  // Handle drag and drop reordering
  const handleDragStart = (e: React.DragEvent, sectionId: string) => {
    setIsDragging(sectionId);
  };

  const handleDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    if (isDragging !== sectionId) {
      setDragOverSection(sectionId);
    }
  };

  const handleDrop = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    if (!isDragging || isDragging === targetSectionId) return;

    const currentSections = [...activeSections];
    const draggedIndex = currentSections.findIndex(s => s === isDragging);
    const targetIndex = currentSections.findIndex(s => s === targetSectionId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Remove dragged item
      currentSections.splice(draggedIndex, 1);
      // Insert at new position
      currentSections.splice(targetIndex, 0, isDragging as ResumeSection);
      setActiveSections(currentSections);
    }

    setIsDragging(null);
    setDragOverSection(null);
  };

  const handleDragEnd = () => {
    setIsDragging(null);
    setDragOverSection(null);
  };

  // Save resume
  const saveResume = async () => {
    // Validate required fields
    if (!resume.contact.firstName || !resume.contact.lastName || !resume.contact.email) {
      toast.error("Please fill in all required contact fields");
      return;
    }

    if (!resume.summary) {
      toast.error("Please provide a profile summary");
      return;
    }

    setIsSaving(true);
    
    try {
      // This would be an API call in a real application
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Resume saved successfully!");
      
      // In a real app, you might save the ID returned from the backend
      // setResumeId(response.id);
    } catch (error) {
      toast.error("Failed to save resume. Please try again.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Export resume
  const exportResume = (format: 'pdf' | 'docx') => {
    // In a real application, this would generate and download the file
    toast.success(`Exporting resume as ${format.toUpperCase()}...`);
    // Mock download after a short delay
    setTimeout(() => {
      toast.success(`Resume exported as ${format.toUpperCase()}`);
    }, 1500);
  };

  // Toggle preview mode
  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  // AI-powered resume generation functions
  const generateSummary = async () => {
    try {
      setIsGenerating(true);
      const { jobTitle, experience } = generationData;
      const skills = generationData.skills.filter(s => s.trim() !== "");
      
      if (!jobTitle || skills.length === 0) {
        toast.error("Please provide a job title and at least one skill");
        return;
      }
      
      const response = await API.resume.generateSummary({
        experience,
        jobTitle,
        skills
      });
      
      setResume(prev => ({
        ...prev,
        summary: response.summary
      }));
      
      toast.success("Summary generated successfully!");
      setSummaryDialogOpen(false);
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Failed to generate summary. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generateBulletPoints = async () => {
    try {
      setIsGenerating(true);
      const { role, responsibilities, jobType } = generationData;
      
      if (!role || !responsibilities) {
        toast.error("Please provide both role and responsibilities");
        return;
      }
      
      const response = await API.resume.generateBulletPoints({
        role,
        responsibilities,
        jobType
      });
      
      if (activeItemId) {
        const section = activeSection as keyof Resume;
        // Update the selected item with generated bullet points
        if (section === "experience") {
          const item = resume.experience.find(item => item.id === activeItemId);
          if (item) {
            const updatedItem = {
              ...item,
              responsibilities: response.bulletPoints.join("\n")
            };
            
            setResume(prev => ({
              ...prev,
              experience: prev.experience.map(exp => 
                exp.id === activeItemId ? updatedItem : exp
              )
            }));
          }
        } else if (section === "projects") {
          const item = resume.projects.find(item => item.id === activeItemId);
          if (item) {
            const updatedItem = {
              ...item,
              description: response.bulletPoints.join("\n")
            };
            
            setResume(prev => ({
              ...prev,
              projects: prev.projects.map(proj => 
                proj.id === activeItemId ? updatedItem : proj
              )
            }));
          }
        }
      }
      
      toast.success("Bullet points generated successfully!");
      setBulletPointsDialogOpen(false);
    } catch (error) {
      console.error("Error generating bullet points:", error);
      toast.error("Failed to generate bullet points. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const improveText = async (text: string, context: string) => {
    try {
      setImprovingText(true);
      
      if (!text.trim()) {
        toast.error("Please provide text to improve");
        return;
      }
      
      const response = await API.resume.improveText({
        text,
        context
      });
      
      return response.improvedText;
    } catch (error) {
      console.error("Error improving text:", error);
      toast.error("Failed to improve text. Please try again.");
      return null;
    } finally {
      setImprovingText(false);
    }
  };
  
  // Handler for improving any text field
  const handleImproveText = async (sectionKey: keyof Resume, field: string, itemId?: string) => {
    let text = "";
    let context = sectionKey;
    
    // Get the current text based on the section and field
    if (sectionKey === "summary") {
      text = resume.summary;
    } else if (itemId) {
      const section = resume[sectionKey] as Array<any>;
      const item = section.find(item => item.id === itemId);
      if (item) {
        text = item[field];
      }
    }
    
    if (!text.trim()) {
      toast.error("No text to improve. Please add content first.");
      return;
    }
    
    const improvedText = await improveText(text, String(context));
    
    if (improvedText) {
      // Update the resume with improved text
      if (sectionKey === "summary") {
        setResume(prev => ({
          ...prev,
          summary: improvedText
        }));
      } else if (itemId) {
        const sectionArray = resume[sectionKey] as Array<any>;
        const updatedSection = sectionArray.map(item => 
          item.id === itemId ? { ...item, [field]: improvedText } : item
        );
        
        setResume(prev => ({
          ...prev,
          [sectionKey]: updatedSection
        }));
      }
      
      toast.success("Text improved successfully!");
    }
  };

  // Render the form fields for a section
  const renderSection = (sectionId: ResumeSection) => {
    const section = sectionsList.find(s => s.id === sectionId);
    if (!section) return null;
    
    const Icon = section.icon;

    return (
      <div 
        key={section.id}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, section.id)}
        onDragOver={(e) => handleDragOver(e, section.id)}
        onDrop={(e) => handleDrop(e, section.id)}
        onDragEnd={handleDragEnd}
        className={cn(
          "border rounded-lg mb-6 shadow-sm transition-all",
          isDragging === section.id ? "opacity-50" : "opacity-100",
          sectionId === activeSection && !isPreviewMode ? "border-primary" : "border-border"
        )}
      >
        <div 
          className={cn(
            "flex items-center justify-between p-4 rounded-t-lg cursor-pointer",
            sectionId === activeSection && !isPreviewMode ? "bg-primary/10" : "bg-muted/50"
          )}
          onClick={() => setActiveSection(section.id)}
        >
          <div className="flex items-center gap-2">
            <Move className="h-4 w-4 text-muted-foreground" />
            <Icon className="h-5 w-5" />
            <h3 className="font-medium">{section.title}</h3>
            {section.required && <span className="text-xs text-muted-foreground">(Required)</span>}
          </div>
          <div className="flex items-center gap-2">
            {/* Add AI buttons for specific sections */}
            {section.id === "summary" && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setSummaryDialogOpen(true);
                }}
                className="h-8 w-8"
                title="Generate summary with AI"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
            )}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p>{section.helpText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {!section.required && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => {
                  e.stopPropagation();
                  removeSection(section.id);
                }}
                className="h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {(sectionId === activeSection || isPreviewMode) && (
          <div className="p-4">
            {renderSectionFields(section.id)}
          </div>
        )}
      </div>
    );
  };

  // Modify renderSectionFields for 'summary' and 'experience' sections to add AI features
  const renderSectionFields = (sectionId: ResumeSection) => {
    if (sectionId === "summary") {
      return (
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="summary">Professional Summary</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setSummaryDialogOpen(true)}
              >
                <Sparkles className="h-4 w-4" />
                Magic Write
              </Button>
            <ImproveTextButton
              text={resume.summary}
              context="professional summary"
              onImprove={(improvedText) => {
                setResume(prev => ({
                  ...prev,
                  summary: improvedText
                }));
              }}
              className="h-8"
            />
            </div>
          </div>
          <Textarea
            id="summary"
            rows={4}
            placeholder="Write a professional summary highlighting your skills and experience..."
            value={resume.summary}
            onChange={(e) => handleChange("summary", "summary", e.target.value)}
          />
        </div>
      );
    }
    
    if (sectionId === "experience") {
      return (
        <div>
          {resume.experience.map(exp => (
            <div key={exp.id} className="mb-6 border-b pb-6 last:border-b-0 last:pb-0">
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <Label htmlFor={`title-${exp.id}`}>Job Title</Label>
                  <Input
                    id={`title-${exp.id}`}
                    value={exp.title}
                    onChange={(e) => handleChange("experience", "title", e.target.value, exp.id)}
                    placeholder="Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor={`company-${exp.id}`}>Company</Label>
                  <Input
                    id={`company-${exp.id}`}
                    value={exp.company}
                    onChange={(e) => handleChange("experience", "company", e.target.value, exp.id)}
                    placeholder="Company Name"
                  />
                </div>
              </div>
              <div className="mb-2">
                <Label htmlFor={`duration-${exp.id}`}>Duration</Label>
                <Input
                  id={`duration-${exp.id}`}
                  value={exp.duration}
                  onChange={(e) => handleChange("experience", "duration", e.target.value, exp.id)}
                  placeholder="June 2021 - Present"
                />
              </div>
              <div className="mb-2">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor={`responsibilities-${exp.id}`}>Responsibilities & Achievements</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => {
                        setActiveItemId(exp.id);
                        setBulletPointsDialogOpen(true);
                      }}
                    >
                      <Sparkles className="h-4 w-4" />
                      Magic Write
                    </Button>
                    <ImproveTextButton
                      text={exp.responsibilities}
                      context="job responsibilities"
                      onImprove={(improvedText) => {
                        setResume(prev => ({
                          ...prev,
                          experience: prev.experience.map(item => 
                            item.id === exp.id ? { ...item, responsibilities: improvedText } : item
                          )
                        }));
                      }}
                      className="h-8"
                    />
                  </div>
                </div>
                <Textarea
                  id={`responsibilities-${exp.id}`}
                  rows={4}
                  value={exp.responsibilities}
                  onChange={(e) => handleChange("experience", "responsibilities", e.target.value, exp.id)}
                  placeholder="• Developed a new feature that increased user engagement by 25%\n• Led a team of 5 developers to successfully launch a product update\n• Optimized database queries, reducing load time by 40%"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem("experience", exp.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => addItem("experience")}
            className="w-full flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Work Experience
          </Button>
        </div>
      );
    }
    
    // Similarly modify other sections as needed
    
    // Return the existing rendering logic for other sections
    // ... existing code ...
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Label className="font-semibold">Choose Resume Template:</Label>
        <select
          value={selectedTemplate}
          onChange={e => setSelectedTemplate(e.target.value)}
          className="border rounded px-3 py-1"
        >
          <option value="classic">Classic</option>
          <option value="modern">Modern</option>
          <option value="minimal">Minimal</option>
        </select>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Add Custom Section</h3>
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="Section Header (e.g. Achievements)"
            value={customHeaderInput}
            onChange={e => setCustomHeaderInput(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={() => {
              if (customHeaderInput.trim()) {
                setResume(prev => ({
                  ...prev,
                  customSections: [
                    ...prev.customSections,
                    { id: generateId(), header: customHeaderInput.trim(), content: "" }
                  ]
                }));
                setCustomHeaderInput("");
              }
            }}
          >
            Add Section
          </Button>
        </div>
        {resume.customSections.map(section => (
          <div key={section.id} className="mb-4 border rounded p-3 bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{section.header}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setResume(prev => ({
                  ...prev,
                  customSections: prev.customSections.filter(s => s.id !== section.id)
                }))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              rows={3}
              placeholder="Enter content for this section..."
              value={section.content}
              onChange={e => setResume(prev => ({
                ...prev,
                customSections: prev.customSections.map(s =>
                  s.id === section.id ? { ...s, content: e.target.value } : s
                )
              }))}
            />
          </div>
        ))}
      </div>
      
      {/* ... existing rendering code ... */}
      
      {/* Add AI dialogs */}
      <GenerateSummaryDialog
        open={summaryDialogOpen}
        onOpenChange={setSummaryDialogOpen}
        onGenerate={(summary) => {
          setResume(prev => ({
            ...prev,
            summary
          }));
        }}
      />
      
      <GenerateBulletPointsDialog
        open={bulletPointsDialogOpen}
        onOpenChange={setBulletPointsDialogOpen}
        initialRole={activeItemId ? resume.experience.find(exp => exp.id === activeItemId)?.title || "" : ""}
        onGenerate={(bulletPoints) => {
          if (activeItemId) {
            setResume(prev => ({
              ...prev,
              experience: prev.experience.map(exp => 
                exp.id === activeItemId ? { ...exp, responsibilities: bulletPoints.join("\n") } : exp
              )
            }));
          }
        }}
      />
    </div>
  );
};

export default ResumeBuilder;
