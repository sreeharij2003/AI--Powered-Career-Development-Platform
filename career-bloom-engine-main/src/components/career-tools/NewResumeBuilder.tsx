import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { API } from "@/services/api";
import {
    AlignLeft,
    ArrowRight,
    Bold,
    Download,
    Edit3,
    Eye,
    FileText,
    Home,
    Italic,
    List,
    MoreVertical,
    Plus,
    Trash2,
    Underline
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface Resume {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  template: 'modern' | 'classic' | 'creative';
}

interface PersonalInfo {
  firstName: string;
  lastName: string;
  jobTitle: string;
  address: string;
  phone: string;
  email: string;
  linkedin: string;
  summary: string;
  profileImage?: File | null;
}

interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  rating: number; // 1-5 stars
}

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string;
  startDate: string;
  endDate: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  description: string;
}

interface Language {
  id: string;
  name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Native';
}

interface Interest {
  id: string;
  name: string;
}

interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Activity {
  id: string;
  name: string;
  description: string;
  date: string;
}

interface Outreach {
  id: string;
  name: string;
  description: string;
  date: string;
}

const NewResumeBuilder = () => {
  // State for AI loading
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [dreamJob, setDreamJob] = useState('');

  // Add CSS for page breaks
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        .break-inside-avoid {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .page-break-before {
          page-break-before: always;
        }
        .page-break-after {
          page-break-after: always;
        }
      }
      @page {
        size: A4;
        margin: 0.5in;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);

  const [newResumeTitle, setNewResumeTitle] = useState('');

  // Load resumes from API
  useEffect(() => {
    const loadResumes = async () => {
      setIsLoadingResumes(true);
      try {
        // Try to load from backend API first
        try {
          const resumeData = await API.resumeBuilder.getResumes();
          setResumes(resumeData);
          // Also save to localStorage as backup
          localStorage.setItem('resumes', JSON.stringify(resumeData));
          return;
        } catch (networkError) {
          console.log('Backend API not available, loading from localStorage');
        }

        // Fallback to localStorage
        const savedResumes = JSON.parse(localStorage.getItem('resumes') || '[]');
        setResumes(savedResumes);

      } catch (error) {
        console.error('Error loading resumes:', error);
        setResumes([]);
      } finally {
        setIsLoadingResumes(false);
      }
    };

    loadResumes();
  }, []);
  // Template selection - Based on your provided templates
  const [selectedTemplate, setSelectedTemplate] = useState<'template1' | 'template2' | 'template3' | 'template4' | 'template5' | 'template6'>('template1');
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);

  // Multi-step workflow states - Start with list view
  const [buildStep, setBuildStep] = useState<'list' | 'template-selection' | 'build-method' | 'upload' | 'builder'>('list');
  const [buildMethod, setBuildMethod] = useState<'new' | 'upload'>('new');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [currentStep, setCurrentStep] = useState<'list' | 'builder'>('list');
  const [activeTab, setActiveTab] = useState('personal');

  // Form states for resume builder
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    jobTitle: '',
    address: '',
    phone: '',
    email: '',
    linkedin: '',
    summary: '',
    profileImage: null
  });

  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [outreach, setOutreach] = useState<Outreach[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const handleCreateResume = async () => {
    console.log('Create button clicked!');
    console.log('Title:', newResumeTitle);
    console.log('Template:', selectedTemplate);

    if (newResumeTitle.trim()) {
      const newResume: Resume = {
        id: Date.now().toString(),
        title: newResumeTitle,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        template: selectedTemplate
      };

      try {
        // Save to backend API
        const savedResume = await API.resumeBuilder.saveResume(newResume);
        console.log('Resume saved to backend:', savedResume);

        // Update local state
        const updatedResumes = [...resumes, savedResume];
        setResumes(updatedResumes);

        // Update localStorage as backup
        localStorage.setItem('resumes', JSON.stringify(updatedResumes));

        setSelectedResume(savedResume);
      } catch (error) {
        console.error('Error saving resume to backend:', error);

        // If API fails, still update local state
        const updatedResumes = [...resumes, newResume];
        setResumes(updatedResumes);
        localStorage.setItem('resumes', JSON.stringify(updatedResumes));
        setSelectedResume(newResume);
      }

      setBuildStep('template-selection');
      setNewResumeTitle('');
    } else {
      console.log('Title is empty, not creating resume');
      alert('Please enter a title for your resume');
    }
  };

  const handleEditResume = (resume: Resume) => {
    setSelectedResume(resume);
    setBuildStep('builder');
  };

  const handleDeleteResume = async (resumeId: string) => {
    try {
      // Delete from backend API
      await API.resumeBuilder.deleteResume(resumeId);

      // Update local state
      const updatedResumes = resumes.filter(r => r.id !== resumeId);
      setResumes(updatedResumes);

      // Update localStorage as backup
      localStorage.setItem('resumes', JSON.stringify(updatedResumes));

      console.log(`Resume ${resumeId} deleted successfully`);
    } catch (error) {
      console.error('Error deleting resume:', error);

      // If API fails, still update local state and localStorage
      const updatedResumes = resumes.filter(r => r.id !== resumeId);
      setResumes(updatedResumes);
      localStorage.setItem('resumes', JSON.stringify(updatedResumes));
    }
  };

  const addWorkExperience = () => {
    const newExp: WorkExperience = {
      id: Date.now().toString(),
      jobTitle: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    setWorkExperience([...workExperience, newExp]);
  };

  const updateWorkExperience = (id: string, field: keyof WorkExperience, value: any) => {
    setWorkExperience(workExperience.map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const removeWorkExperience = (id: string) => {
    setWorkExperience(workExperience.filter(exp => exp.id !== id));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      degree: '',
      institution: '',
      location: '',
      startDate: '',
      endDate: '',
      gpa: ''
    };
    setEducation([...education, newEdu]);
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    setEducation(education.map(edu =>
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter(edu => edu.id !== id));
  };

  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: '',
      level: 'Intermediate',
      rating: 3
    };
    setSkills([...skills, newSkill]);
  };

  const updateSkill = (id: string, field: keyof Skill, value: any) => {
    setSkills(skills.map(skill =>
      skill.id === id ? { ...skill, [field]: value } : skill
    ));
  };

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: 'New Project',
      description: '',
      technologies: '',
      startDate: '',
      endDate: ''
    };
    setProjects([...projects, newProject]);
  };

  const removeProject = (id: string) => {
    setProjects(projects.filter(project => project.id !== id));
  };

  const updateProject = (id: string, field: keyof Project, value: any) => {
    setProjects(projects.map(project =>
      project.id === id ? { ...project, [field]: value } : project
    ));
  };

  const addCertification = () => {
    const newCert: Certification = {
      id: Date.now().toString(),
      name: '',
      issuer: '',
      date: '',
      description: ''
    };
    setCertifications([...certifications, newCert]);
  };

  const removeCertification = (id: string) => {
    setCertifications(certifications.filter(cert => cert.id !== id));
  };

  const updateCertification = (id: string, field: keyof Certification, value: any) => {
    setCertifications(certifications.map(cert =>
      cert.id === id ? { ...cert, [field]: value } : cert
    ));
  };

  const addLanguage = () => {
    const newLang: Language = {
      id: Date.now().toString(),
      name: '',
      proficiency: 'Beginner'
    };
    setLanguages([...languages, newLang]);
  };

  const removeLanguage = (id: string) => {
    setLanguages(languages.filter(lang => lang.id !== id));
  };

  const updateLanguage = (id: string, field: keyof Language, value: any) => {
    setLanguages(languages.map(lang =>
      lang.id === id ? { ...lang, [field]: value } : lang
    ));
  };

  // Interest management
  const addInterest = () => {
    const newInterest: Interest = {
      id: Date.now().toString(),
      name: ''
    };
    setInterests([...interests, newInterest]);
  };

  const removeInterest = (id: string) => {
    setInterests(interests.filter(interest => interest.id !== id));
  };

  const updateInterest = (id: string, field: keyof Interest, value: any) => {
    setInterests(interests.map(interest =>
      interest.id === id ? { ...interest, [field]: value } : interest
    ));
  };

  // Internship management
  const addInternship = () => {
    const newInternship: Internship = {
      id: Date.now().toString(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    setInternships([...internships, newInternship]);
  };

  const removeInternship = (id: string) => {
    setInternships(internships.filter(internship => internship.id !== id));
  };

  const updateInternship = (id: string, field: keyof Internship, value: any) => {
    setInternships(internships.map(internship =>
      internship.id === id ? { ...internship, [field]: value } : internship
    ));
  };

  // Activity management
  const addActivity = () => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      name: '',
      description: '',
      date: ''
    };
    setActivities([...activities, newActivity]);
  };

  const removeActivity = (id: string) => {
    setActivities(activities.filter(activity => activity.id !== id));
  };

  const updateActivity = (id: string, field: keyof Activity, value: any) => {
    setActivities(activities.map(activity =>
      activity.id === id ? { ...activity, [field]: value } : activity
    ));
  };

  // Outreach management
  const addOutreach = () => {
    const newOutreach: Outreach = {
      id: Date.now().toString(),
      name: '',
      description: '',
      date: ''
    };
    setOutreach([...outreach, newOutreach]);
  };

  const removeOutreach = (id: string) => {
    setOutreach(outreach.filter(item => item.id !== id));
  };

  const updateOutreach = (id: string, field: keyof Outreach, value: any) => {
    setOutreach(outreach.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter(skill => skill.id !== id));
  };

  const handleSave = () => {
    // Save resume data
    console.log('Saving resume...', {
      personalInfo,
      workExperience,
      education,
      skills
    });
    // TODO: Implement actual save functionality
  };

  const handleDownloadPDF = () => {
    try {
      // Get the exact preview content
      const previewContainer = document.querySelector('.page-container');
      if (!previewContainer) {
        alert('Resume content not found');
        return;
      }

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to download PDF');
        return;
      }

      // Clone the preview content to avoid modifying the original
      const clonedContent = previewContainer.cloneNode(true) as HTMLElement;

      // Remove any interactive elements that shouldn't be in PDF
      const buttonsToRemove = clonedContent.querySelectorAll('button, .pagination-controls');
      buttonsToRemove.forEach(btn => btn.remove());

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${personalInfo.firstName || 'Resume'}_${personalInfo.lastName || 'Document'}</title>
          <meta charset="utf-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              background: white;
              color: black;
              line-height: 1.4;
            }
            .page-container {
              width: 8.5in;
              min-height: 11in;
              margin: 0 auto;
              background: white;
              padding: 0.5in;
              box-sizing: border-box;
            }
            /* Template 1 Styles */
            h1 {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 8px;
              text-align: center;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            h2 {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 6px;
              margin-top: 20px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 2px solid #333;
              padding-bottom: 4px;
            }
            h3 {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 4px;
            }
            p, div {
              font-size: 14px;
              margin-bottom: 8px;
            }
            .text-center { text-align: center; }
            .text-justify { text-align: justify; }
            .mb-2 { margin-bottom: 8px; }
            .mb-4 { margin-bottom: 16px; }
            .mb-6 { margin-bottom: 24px; }
            .mb-8 { margin-bottom: 32px; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .justify-center { justify-content: center; }
            .items-center { align-items: center; }
            .items-start { align-items: flex-start; }
            .space-x-4 > * + * { margin-left: 16px; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
            .gap-4 { gap: 16px; }
            .border-b { border-bottom: 1px solid #ccc; }
            .border-b-2 { border-bottom: 2px solid #333; }
            .pb-2 { padding-bottom: 8px; }
            .pb-6 { padding-bottom: 24px; }
            .text-sm { font-size: 12px; }
            .text-base { font-size: 14px; }
            .text-lg { font-size: 16px; }
            .text-xl { font-size: 18px; }
            .text-3xl { font-size: 24px; }
            .font-bold { font-weight: bold; }
            .font-medium { font-weight: 500; }
            .uppercase { text-transform: uppercase; }
            .tracking-wide { letter-spacing: 0.05em; }
            .leading-relaxed { line-height: 1.6; }

            @media print {
              body { margin: 0; padding: 0; }
              .page-container {
                margin: 0;
                padding: 0.5in;
                box-shadow: none;
              }
              .break-inside-avoid {
                break-inside: avoid;
                page-break-inside: avoid;
              }
            }
            @page {
              size: A4;
              margin: 0.5in;
            }
          </style>
        </head>
        <body>
          ${clonedContent.outerHTML}
        </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();

      // Wait for content to load then print
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 1000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleSaveResume = async () => {
    try {
      console.log('Starting resume save...');

      const resumeData = {
        id: selectedResume?.id || Date.now().toString(),
        title: selectedResume?.title || `${personalInfo.firstName || 'New'} ${personalInfo.lastName || 'Resume'}`,
        template: selectedTemplate,
        personalInfo,
        workExperience,
        education,
        skills,
        projects,
        certifications,
        languages,
        interests,
        internships,
        activities,
        outreach,
        createdAt: selectedResume?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Resume data to save:', resumeData);

      // Save to backend - try multiple endpoints
      let response;
      try {
        response = await fetch('http://localhost:5000/api/resumes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(resumeData),
        });
      } catch (networkError) {
        console.error('Network error, trying to save locally:', networkError);
        // Fallback to local storage if backend is not available
        const savedResumes = JSON.parse(localStorage.getItem('resumes') || '[]');
        const newResume = { ...resumeData, id: Date.now().toString() };
        savedResumes.push(newResume);
        localStorage.setItem('resumes', JSON.stringify(savedResumes));

        // Update local state
        setResumes([...resumes, newResume]);
        setSelectedResume(newResume);
        alert('Resume saved locally (backend not available)');
        return;
      }

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const savedResume = await response.json();
        console.log('Saved resume:', savedResume);

        // Update local state
        if (selectedResume) {
          setResumes(resumes.map(r => r.id === selectedResume.id ? savedResume : r));
        } else {
          setResumes([...resumes, savedResume]);
          setSelectedResume(savedResume);
        }

        alert('Resume saved successfully!');
      } else {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error(`Failed to save resume: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      alert(`Failed to save resume: ${error.message}`);
    }
  };

  const handlePreview = (resume: Resume) => {
    setSelectedResume(resume);
    setBuildStep('builder');
    // Load resume data if needed
    console.log('Previewing resume:', resume);
  };



  const handleDownloadResume = async (resume: Resume) => {
    try {
      // For now, just trigger the same download function
      // In a real implementation, you'd load the specific resume data first
      handleDownloadPDF();
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume. Please try again.');
    }
  };

  // AI Helper Functions
  const handleAIGenerateSummary = async () => {
    if (!dreamJob.trim()) {
      alert('Please enter your dream job first!');
      return;
    }

    setAiLoading('summary');
    try {
      const response = await fetch('http://localhost:5000/api/gemini/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dreamJob,
          personalInfo,
          skills,
          education
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.summary) {
        setPersonalInfo({...personalInfo, summary: data.data.summary});
      } else {
        alert('Failed to generate summary. Please try again.');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Failed to generate summary. Please try again.');
    } finally {
      setAiLoading(null);
    }
  };

  const handleAIGenerateExperience = async (expId: string, company: string, position: string) => {
    if (!dreamJob.trim()) {
      alert('Please enter your dream job first!');
      return;
    }

    setAiLoading(`experience-${expId}`);
    try {
      const response = await fetch('http://localhost:5000/api/gemini/generate-experience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dreamJob,
          company,
          position,
          responsibilities: '',
          achievements: ''
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.description) {
        updateWorkExperience(expId, 'description', data.data.description);
      } else {
        alert('Failed to generate experience description. Please try again.');
      }
    } catch (error) {
      console.error('Error generating experience:', error);
      alert('Failed to generate experience description. Please try again.');
    } finally {
      setAiLoading(null);
    }
  };

  const handleAIGenerateProject = async (projId: string, projectName: string, technologies: string) => {
    if (!dreamJob.trim()) {
      alert('Please enter your dream job first!');
      return;
    }

    setAiLoading(`project-${projId}`);
    try {
      const response = await fetch('http://localhost:5000/api/gemini/generate-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dreamJob,
          projectName,
          technologies,
          description: '',
          impact: ''
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.description) {
        updateProject(projId, 'description', data.data.description);
      } else {
        alert('Failed to generate project description. Please try again.');
      }
    } catch (error) {
      console.error('Error generating project description:', error);
      alert('Failed to generate project description. Please try again.');
    } finally {
      setAiLoading(null);
    }
  };

  const handleAIGenerateInternship = async (internshipId: string, title: string, company: string) => {
    if (!dreamJob.trim()) {
      alert('Please enter your dream job first!');
      return;
    }

    setAiLoading(`internship-${internshipId}`);
    try {
      const response = await fetch('http://localhost:5000/api/gemini/generate-experience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dreamJob,
          company,
          position: title,
          responsibilities: '',
          achievements: ''
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.description) {
        updateInternship(internshipId, 'description', data.data.description);
      } else {
        alert('Failed to generate internship description. Please try again.');
      }
    } catch (error) {
      console.error('Error generating internship description:', error);
      alert('Failed to generate internship description. Please try again.');
    } finally {
      setAiLoading(null);
    }
  };

  // Star Rating Component
  const StarRating = ({ rating, onRatingChange }: { rating: number; onRatingChange: (rating: number) => void }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const handleNext = () => {
    const tabs = ['personal', 'summary', 'education', 'projects', 'skills', 'experience', 'interests', 'internships', 'certifications', 'activities', 'outreach', 'languages'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const tabs = ['personal', 'summary', 'education', 'projects', 'skills', 'experience', 'interests', 'internships', 'certifications', 'activities', 'outreach', 'languages'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  // Function to check which sections should be visible in preview
  const getSectionsToShow = () => {
    const tabs = ['personal', 'summary', 'education', 'projects', 'skills', 'experience', 'interests', 'internships', 'certifications', 'activities', 'outreach', 'languages'];
    const currentIndex = tabs.indexOf(activeTab);

    // Always show personal info, and show sections up to current tab + any sections with content
    const baseSections = tabs.slice(0, Math.max(currentIndex + 1, 2)); // At least show personal and summary

    // Add sections that have content even if not reached yet
    const sectionsWithContent = [];
    if (personalInfo.summary) sectionsWithContent.push('summary');
    if (education.length > 0) sectionsWithContent.push('education');
    if (projects.length > 0 && projects.some(p => p.title.trim())) sectionsWithContent.push('projects');
    if (skills.length > 0) sectionsWithContent.push('skills');
    if (workExperience.length > 0) sectionsWithContent.push('experience');
    if (interests.length > 0) sectionsWithContent.push('interests');
    if (internships.length > 0) sectionsWithContent.push('internships');
    if (certifications.length > 0) sectionsWithContent.push('certifications');
    if (activities.length > 0) sectionsWithContent.push('activities');
    if (outreach.length > 0) sectionsWithContent.push('outreach');
    if (languages.length > 0) sectionsWithContent.push('languages');

    return [...new Set([...baseSections, ...sectionsWithContent])];
  };

  // Function to format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString + '-01'); // Add day to make it a valid date
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  // Template configurations - Based on your provided images
  const templates = {
    template1: {
      name: "Professional Classic",
      description: "Clean professional layout with centered header",
      colors: { primary: "#000000", secondary: "#FFFFFF", text: "#333333" }
    },
    template2: {
      name: "Clean Minimalist",
      description: "Clean white layout with blue accents",
      colors: { primary: "#4A90E2", secondary: "#F8F9FA", text: "#333333" }
    },
    template3: {
      name: "Professional Portrait",
      description: "Right sidebar with profile photo and skills",
      colors: { primary: "#4A90E2", secondary: "#F5F5F5", text: "#333333" }
    },
    template4: {
      name: "Clean Dual Column",
      description: "Two-column layout with blue header",
      colors: { primary: "#4A90E2", secondary: "#FFFFFF", text: "#333333" }
    },
    template5: {
      name: "Modern Blue Accent",
      description: "Clean layout with blue section headers",
      colors: { primary: "#4A90E2", secondary: "#F8F9FA", text: "#333333" }
    },
    template6: {
      name: "Executive Professional",
      description: "Professional layout with blue highlights",
      colors: { primary: "#4A90E2", secondary: "#FFFFFF", text: "#333333" }
    }
  };

  // File upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // TODO: Implement resume parsing logic here
      console.log('File uploaded:', file.name);
    }
  };

  const getTemplateColor = (template: string) => {
    switch (template) {
      case 'modern': return 'bg-blue-500';
      case 'classic': return 'bg-purple-500';
      case 'creative': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Template preview components - Based on your provided templates
  const TemplatePreview = ({ templateId }: { templateId: string }) => {
    // Template 1: Professional Classic (matching your resume image)
    if (templateId === 'template1') {
      return (
        <div className="w-full h-48 bg-white border rounded-lg overflow-hidden shadow-sm">
          <div className="p-3 space-y-2">
            {/* Header with name and contact */}
            <div className="text-center border-b border-gray-200 pb-2">
              <div className="w-20 h-3 bg-gray-800 rounded mx-auto mb-1"></div>
              <div className="flex justify-center space-x-2 text-xs">
                <div className="w-8 h-1 bg-gray-400 rounded"></div>
                <div className="w-8 h-1 bg-gray-400 rounded"></div>
                <div className="w-8 h-1 bg-gray-400 rounded"></div>
              </div>
            </div>
            {/* Profile Summary */}
            <div className="w-16 h-2 bg-gray-800 rounded"></div>
            <div className="space-y-1">
              <div className="w-full h-1 bg-gray-200 rounded"></div>
              <div className="w-3/4 h-1 bg-gray-200 rounded"></div>
            </div>
            {/* Education */}
            <div className="w-12 h-2 bg-gray-800 rounded"></div>
            <div className="space-y-1">
              <div className="w-full h-1 bg-gray-200 rounded"></div>
              <div className="w-2/3 h-1 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      );
    }

    // Template 2: Clean Minimalist (from your second image)
    if (templateId === 'template2') {
      return (
        <div className="w-full h-48 bg-white border rounded-lg overflow-hidden shadow-sm">
          <div className="p-3 space-y-2">
            <div className="text-center">
              <div className="w-16 h-3 bg-gray-800 rounded mx-auto mb-1"></div>
              <div className="w-20 h-1 bg-gray-400 rounded mx-auto"></div>
            </div>
            <div className="w-12 h-2 bg-blue-500 rounded"></div>
            <div className="space-y-1">
              <div className="w-full h-1 bg-gray-200 rounded"></div>
              <div className="w-3/4 h-1 bg-gray-200 rounded"></div>
            </div>
            <div className="w-10 h-2 bg-blue-500 rounded"></div>
            <div className="space-y-1">
              <div className="w-full h-1 bg-gray-200 rounded"></div>
              <div className="w-2/3 h-1 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      );
    }

    // Template 3: Professional Portrait (from your third image)
    if (templateId === 'template3') {
      return (
        <div className="w-full h-48 bg-white border rounded-lg overflow-hidden shadow-sm flex">
          <div className="flex-1 p-3 space-y-2">
            <div className="w-16 h-3 bg-gray-800 rounded"></div>
            <div className="w-12 h-2 bg-blue-500 rounded"></div>
            <div className="space-y-1">
              <div className="w-full h-1 bg-gray-200 rounded"></div>
              <div className="w-3/4 h-1 bg-gray-200 rounded"></div>
            </div>
            <div className="w-10 h-2 bg-blue-500 rounded"></div>
            <div className="space-y-1">
              <div className="w-full h-1 bg-gray-200 rounded"></div>
              <div className="w-2/3 h-1 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="w-16 bg-gray-50 p-2 border-l">
            <div className="w-10 h-10 bg-gray-300 rounded mx-auto mb-2"></div>
            <div className="space-y-1">
              <div className="w-full h-1 bg-blue-300 rounded"></div>
              <div className="w-3/4 h-1 bg-blue-300 rounded"></div>
              <div className="w-full h-1 bg-blue-300 rounded"></div>
            </div>
          </div>
        </div>
      );
    }

    // Template 4: Clean Dual Column (from your fourth image)
    if (templateId === 'template4') {
      return (
        <div className="w-full h-48 bg-white border rounded-lg overflow-hidden shadow-sm">
          <div className="h-8 bg-blue-500 flex items-center px-3">
            <div className="w-16 h-2 bg-white rounded"></div>
          </div>
          <div className="flex p-3 space-x-3">
            <div className="flex-1 space-y-2">
              <div className="w-12 h-2 bg-blue-500 rounded"></div>
              <div className="space-y-1">
                <div className="w-full h-1 bg-gray-200 rounded"></div>
                <div className="w-3/4 h-1 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="w-10 h-2 bg-blue-500 rounded"></div>
              <div className="space-y-1">
                <div className="w-full h-1 bg-gray-200 rounded"></div>
                <div className="w-2/3 h-1 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Template 5: Modern Blue Accent (from your fifth image)
    if (templateId === 'template5') {
      return (
        <div className="w-full h-48 bg-white border rounded-lg overflow-hidden shadow-sm">
          <div className="p-3 space-y-2">
            <div className="w-16 h-3 bg-gray-800 rounded"></div>
            <div className="w-20 h-1 bg-gray-400 rounded"></div>
            <div className="w-12 h-2 bg-blue-500 rounded"></div>
            <div className="space-y-1">
              <div className="w-full h-1 bg-gray-200 rounded"></div>
              <div className="w-3/4 h-1 bg-gray-200 rounded"></div>
            </div>
            <div className="w-10 h-2 bg-blue-500 rounded"></div>
            <div className="space-y-1">
              <div className="w-full h-1 bg-gray-200 rounded"></div>
              <div className="w-2/3 h-1 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      );
    }

    // Template 6: Executive Professional (from your sixth image)
    if (templateId === 'template6') {
      return (
        <div className="w-full h-48 bg-white border rounded-lg overflow-hidden shadow-sm">
          <div className="p-3 space-y-2">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-16 h-3 bg-gray-800 rounded"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
            <div className="w-20 h-1 bg-gray-400 rounded"></div>
            <div className="w-12 h-2 bg-blue-500 rounded"></div>
            <div className="space-y-1">
              <div className="w-full h-1 bg-gray-200 rounded"></div>
              <div className="w-3/4 h-1 bg-gray-200 rounded"></div>
            </div>
            <div className="w-10 h-2 bg-blue-500 rounded"></div>
            <div className="space-y-1">
              <div className="w-full h-1 bg-gray-200 rounded"></div>
              <div className="w-2/3 h-1 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      );
    }

    return <div className="w-full h-48 bg-gray-100 border rounded-lg flex items-center justify-center">
      <span className="text-gray-500">Template {templateId.slice(-1)}</span>
    </div>;
  };

  // Template Selection Component
  const TemplateSelection = () => (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back button - only show if we're coming from builder */}
        {buildStep === 'template-selection' && selectedTemplate && (
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBuildStep('builder')}
              className="text-gray-400 hover:text-white"
            >
              ← Back to Resume Builder
            </Button>
          </div>
        )}

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Templates we recommend for you</h1>
          <p className="text-gray-400">You can always change your template later.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Object.entries(templates).map(([key, template]) => (
            <div
              key={key}
              className={`bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer transition-all duration-200 border ${
                selectedTemplate === key ? 'ring-4 ring-blue-500 transform scale-105 border-blue-500' : 'border-gray-700 hover:shadow-xl hover:border-gray-600'
              }`}
              onClick={() => setSelectedTemplate(key as any)}
            >
              <div className="p-4">
                <TemplatePreview templateId={key} />
                <div className="mt-3 text-center">
                  <h3 className="font-semibold text-white">{template.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                </div>
              </div>
              <div className="p-4">
                <button
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    selectedTemplate === key
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTemplate(key as any);
                    setBuildStep('builder');
                    setCurrentStep('builder');
                  }}
                >
                  Choose template
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Build Method Selection Component
  const BuildMethodSelection = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => setBuildStep('template-selection')}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            ← Back to templates
          </button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">How would you like to build your resume?</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Start New */}
          <div className="bg-white rounded-lg p-8 shadow-lg text-center">
            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">📝</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Start with a new resume</h2>
            <p className="text-gray-600 mb-6">Get step-by-step support with expert content suggestions at your fingertips!</p>
            <button
              onClick={() => {
                setBuildMethod('new');
                setBuildStep('template-selection');
              }}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create new
            </button>
          </div>

          {/* Upload Existing */}
          <div className="bg-white rounded-lg p-8 shadow-lg text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">📤</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload an existing resume</h2>
            <p className="text-gray-600 mb-6">Edit your resume using expertly generated content in a fresh, new design.</p>
            <label className="w-full bg-orange-400 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-500 transition-colors cursor-pointer inline-block">
              Choose file
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <p className="text-sm text-gray-500 mt-4">Acceptable file types: DOC, DOCX, PDF, HTML, RTF, TXT</p>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setBuildStep('template-selection')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={() => {
              setBuildStep('builder');
              setCurrentStep('builder');
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );

  // Template 1: Professional Classic (matching your resume image)
  const Template1Preview = () => (
    <div className="bg-white break-inside-avoid">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 uppercase tracking-wide">
          {personalInfo.firstName && personalInfo.lastName
            ? `${personalInfo.firstName} ${personalInfo.lastName}`
            : 'SREEHARI J'}
        </h1>
        <div className="flex justify-center items-center space-x-4 text-sm text-gray-600 mb-2">
          <span className="flex items-center">
            📍 {personalInfo.address || 'Kottayam, India'}
          </span>
          <span className="flex items-center">
            ✉️ {personalInfo.email || 'sreeharij642@gmail.com'}
          </span>
          <span className="flex items-center">
            📞 {personalInfo.phone || '+91 6282569756'}
          </span>
        </div>
        {personalInfo.linkedin && (
          <div className="text-sm text-blue-600">
            🔗 {personalInfo.linkedin}
          </div>
        )}
      </div>

      {/* Profile Summary */}
      {getSectionsToShow().includes('summary') && personalInfo.summary && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-2 mb-4 uppercase tracking-wide">PROFILE SUMMARY</h2>
          <p className="text-sm text-gray-700 leading-relaxed text-justify">
            {personalInfo.summary}
          </p>
        </div>
      )}

      {/* Education */}
      {getSectionsToShow().includes('education') && education.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-2 mb-4 uppercase tracking-wide">EDUCATION</h2>
          {education.map(edu => (
            <div key={edu.id} className="mb-4 flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-bold text-base">{edu.degree}</h3>
                <p className="text-gray-700 text-sm font-medium">{edu.institution}{edu.location && `, ${edu.location}`}</p>
                {edu.gpa && <p className="text-gray-600 text-sm">CGPA: {edu.gpa}/10</p>}
              </div>
              <div className="text-right">
                <p className="text-gray-600 text-sm font-medium">
                  {edu.startDate && edu.endDate
                    ? `${new Date(edu.startDate).getFullYear()}-${new Date(edu.endDate).getFullYear().toString().slice(-2)}`
                    : edu.endDate
                    ? new Date(edu.endDate).getFullYear()
                    : ''
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {getSectionsToShow().includes('projects') && projects.filter(p => p.title.trim()).length > 0 && (
        <div className="mb-8 break-inside-avoid">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-2 mb-4 uppercase tracking-wide">PROJECTS</h2>
          <div className="space-y-4">
            {projects.filter(p => p.title.trim()).map(project => (
              <div key={project.id} className="flex justify-between items-start break-inside-avoid">
                <div className="flex-1">
                  <h3 className="font-bold text-base">{project.title}</h3>
                  {project.description && (
                    <p className="text-sm text-gray-700 mt-2">{project.description}</p>
                  )}
                  {project.technologies && (
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Technologies:</span> {project.technologies}
                    </p>
                  )}
                </div>
                <div className="text-right ml-4">
                  {(project.startDate || project.endDate) && (
                    <p className="text-gray-600 text-sm font-medium">
                      {formatDate(project.startDate)} {project.startDate && project.endDate ? ' - ' : ''} {formatDate(project.endDate)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {getSectionsToShow().includes('skills') && skills.length > 0 && (
        <div className="mb-8 break-inside-avoid">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-2 mb-4 uppercase tracking-wide">SKILLS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map(skill => (
              <div key={skill.id} className="text-sm text-gray-700">
                • {skill.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Work Experience */}
      {getSectionsToShow().includes('experience') && workExperience.length > 0 && (
        <div className="mb-8 break-inside-avoid">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-2 mb-4 uppercase tracking-wide">WORK EXPERIENCE</h2>
          <div className="space-y-4">
            {workExperience.map(exp => (
              <div key={exp.id} className="flex justify-between items-start break-inside-avoid">
                <div className="flex-1">
                  <h3 className="font-bold text-base">{exp.jobTitle} | {exp.company}</h3>
                  {exp.location && <p className="text-gray-600 text-sm">{exp.location}</p>}
                  {exp.description && (
                    <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                  )}
                </div>
                <div className="text-right ml-4">
                  <p className="text-gray-600 text-sm font-medium">
                    {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} -
                    {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {getSectionsToShow().includes('certifications') && certifications.length > 0 && (
        <div className="mb-8 break-inside-avoid">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-2 mb-4 uppercase tracking-wide">CERTIFICATIONS</h2>
          <div className="space-y-3">
            {certifications.map(cert => (
              <div key={cert.id} className="flex justify-between items-start break-inside-avoid">
                <div className="flex-1">
                  <h3 className="font-bold text-base">{cert.name}</h3>
                  {cert.issuer && <p className="text-gray-600 text-sm">{cert.issuer}</p>}
                  {cert.description && <p className="text-sm text-gray-700 mt-1">{cert.description}</p>}
                </div>
                <div className="text-right ml-4">
                  {cert.date && (
                    <p className="text-gray-600 text-sm font-medium">
                      {new Date(cert.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {getSectionsToShow().includes('languages') && languages.length > 0 && (
        <div className="mb-8 break-inside-avoid">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-2 mb-4 uppercase tracking-wide">LANGUAGES</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
            {languages.map(lang => (
              <div key={lang.id}>{lang.name} - {lang.proficiency}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Template 2: Clean Minimalist (matching your second template image)
  const Template2Preview = () => (
    <div className="bg-white p-8">
      {/* Header */}
      {(personalInfo.firstName || personalInfo.lastName || personalInfo.jobTitle || personalInfo.phone || personalInfo.email || personalInfo.address) && (
        <div className="text-center mb-8 pb-6">
          {(personalInfo.firstName || personalInfo.lastName) && (
            <h1 className="text-3xl font-bold text-gray-900 mb-4 uppercase tracking-wide">
              {personalInfo.firstName} {personalInfo.lastName}
            </h1>
          )}
          {(personalInfo.phone || personalInfo.email || personalInfo.address || personalInfo.linkedin) && (
            <div className="flex justify-center items-center space-x-8 text-sm text-gray-700">
              {personalInfo.address && (
                <div className="flex items-center space-x-1">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span>{personalInfo.address}</span>
                </div>
              )}
              {personalInfo.email && (
                <div className="flex items-center space-x-1">
                  <span className="w-3 h-3 bg-gray-400 rounded-sm"></span>
                  <span className="text-red-600">{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center space-x-1">
                  <span className="w-3 h-3 bg-green-500 rounded-sm"></span>
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.linkedin && (
                <div className="flex items-center space-x-1">
                  <span className="w-3 h-3 bg-blue-600 rounded-sm"></span>
                  <span className="text-blue-600">{personalInfo.linkedin}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {getSectionsToShow().includes('summary') && personalInfo.summary && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-blue-500 mb-4">PROFILE SUMMARY</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            {personalInfo.summary}
          </p>
        </div>
      )}

      {/* Education */}
      {getSectionsToShow().includes('education') && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-blue-500 mb-4">EDUCATION</h2>
          {education.length > 0 ? education.map(edu => (
            <div key={edu.id} className="mb-4">
              <h3 className="font-bold text-lg">{edu.degree}</h3>
              <p className="text-gray-600">{edu.institution}</p>
              <p className="text-gray-500">{edu.location} | {new Date(edu.endDate).getFullYear()}</p>
              {edu.gpa && <p className="text-gray-500">GPA: {edu.gpa}</p>}
            </div>
          )) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg">B.Tech Computer Science & Engineering</h3>
                <p className="text-gray-600">Amrita Vishwa Vidyapeetham</p>
                <p className="text-gray-500">Kollam | 2022-2026</p>
                <p className="text-gray-500">CGPA: 8.35/10</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Skills */}
      {getSectionsToShow().includes('skills') && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-blue-500 mb-4">SKILLS</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {skills.length > 0 ? skills.map(skill => (
              <div key={skill.id}>• {skill.name}</div>
            )) : (
              <>
                <div>• Programming: Python, Java, C++</div>
                <div>• Web Development: React.js, Node.js</div>
                <div>• Database: MySQL, MongoDB</div>
                <div>• Machine Learning & AI</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Projects */}
      {getSectionsToShow().includes('projects') && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-blue-500 mb-4">PROJECTS</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg">Heart Disease Prediction Model</h3>
              <p className="text-gray-600 mb-2">Dec 2024</p>
              <ul className="text-sm space-y-1">
                <li>• Developed a machine learning model using Random Forest</li>
                <li>• Applied GridSearchCV for hyperparameter tuning</li>
                <li>• Achieved high accuracy using ROC-AUC evaluation</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Template 3: Blue header with initials box
  const Template3Preview = () => (
    <div className="bg-white">
      {/* Blue Header */}
      <div className="bg-blue-600 text-white p-6 flex items-center">
        <div className="w-16 h-16 border-2 border-white flex items-center justify-center mr-6 overflow-hidden">
          {personalInfo.profileImage ? (
            <img
              src={URL.createObjectURL(personalInfo.profileImage)}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (personalInfo.firstName && personalInfo.lastName) ? (
            <span className="text-xl font-bold">
              {personalInfo.firstName[0]}{personalInfo.lastName[0]}
            </span>
          ) : null}
        </div>
        <div>
          {(personalInfo.firstName || personalInfo.lastName) && (
            <h1 className="text-xl font-bold">
              {personalInfo.firstName} {personalInfo.lastName}
            </h1>
          )}
          {(personalInfo.address || personalInfo.email || personalInfo.phone || personalInfo.linkedin) && (
            <p className="text-blue-100 text-sm">
              {[personalInfo.address, personalInfo.email, personalInfo.phone, personalInfo.linkedin].filter(Boolean).join(' | ')}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Summary */}
        {getSectionsToShow().includes('summary') && personalInfo.summary && (
          <div className="mb-6">
            <h2 className="text-base font-bold text-blue-600 border-b border-blue-600 pb-1 mb-3">SUMMARY</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Skills */}
        {getSectionsToShow().includes('skills') && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-blue-600 border-b border-blue-600 pb-1 mb-3">SKILLS</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {skills.length > 0 ? skills.map(skill => (
                <div key={skill.id}>• {skill.name}</div>
              )) : (
                <>
                  <div>• Cash register operation</div>
                  <div>• Inventory management</div>
                  <div>• POS system operation</div>
                  <div>• Accurate money handling</div>
                  <div>• Sales expertise</div>
                  <div>• Documentation and recordkeeping</div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Experience */}
        {getSectionsToShow().includes('experience') && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-blue-600 border-b border-blue-600 pb-1 mb-3">EXPERIENCE</h2>
            {workExperience.length > 0 ? workExperience.map(exp => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm">{exp.jobTitle}</h3>
                    <p className="text-sm text-gray-600">{exp.company}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {exp.startDate} - {exp.current ? 'Current' : exp.endDate}
                  </span>
                </div>
                {exp.description && <p className="text-sm mt-2">{exp.description}</p>}
              </div>
            )) : (
              <div className="text-sm space-y-4">
                <div>
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold">Retail Sales Associate</h3>
                      <p className="text-gray-600">ZARA - New Delhi, India</p>
                    </div>
                    <span className="text-gray-500">02/2017 - Current</span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    <li>• Increased monthly sales 10% by effectively upselling and cross-selling products to maximize profitability.</li>
                    <li>• Prevented store losses by leveraging awareness, attention to detail, and integrity to identify and investigate concerns.</li>
                    <li>• Processed payments and maintained accurate drawers to meet financial targets.</li>
                  </ul>
                </div>
                <div>
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold">Barista</h3>
                      <p className="text-gray-600">Dunkin' Donuts - New Delhi, India</p>
                    </div>
                    <span className="text-gray-500">03/2015 - 01/2017</span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    <li>• Upsold seasonal drinks and pastries, boosting average store sales by $1500 weekly.</li>
                    <li>• Managed morning rush of over 300 customers daily with efficient, levelheaded customer service.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Education */}
        {getSectionsToShow().includes('education') && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-blue-600 border-b border-blue-600 pb-1 mb-3">EDUCATION AND TRAINING</h2>
            {education.length > 0 ? education.map(edu => (
              <div key={edu.id} className="mb-2">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-sm">{edu.degree}</h3>
                    <p className="text-sm text-gray-600">{edu.institution} - {edu.location}</p>
                  </div>
                  <span className="text-sm text-gray-500">{new Date(edu.endDate).getFullYear()}</span>
                </div>
              </div>
            )) : (
              <div className="text-sm">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">Diploma in Financial Accounting</h3>
                    <p className="text-gray-600">Oxford Software Institute & Oxford School of English - New Delhi, India</p>
                  </div>
                  <span className="text-gray-500">2016</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Template 4: Executive Black with sidebar
  const Template4Preview = () => (
    <div className="bg-white flex min-h-screen">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-6">
        {/* Profile */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto">
            {personalInfo.firstName && personalInfo.lastName
              ? `${personalInfo.firstName[0]}${personalInfo.lastName[0]}`
              : 'J'}
          </div>
          <h1 className="text-xl font-bold">
            {personalInfo.firstName && personalInfo.lastName
              ? `${personalInfo.firstName} ${personalInfo.lastName}`
              : 'SREEHARI J'}
          </h1>
          <div className="text-sm text-gray-300 mt-2 space-y-1">
            <div>{personalInfo.phone || '+91 6282569756'}</div>
            <div>{personalInfo.email || 'sreeharij642@gmail.com'}</div>
            <div>{personalInfo.address || 'Kottayam India'}</div>
            {personalInfo.linkedin && <div>{personalInfo.linkedin}</div>}
          </div>
        </div>

        {/* Skills */}
        {getSectionsToShow().includes('skills') && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 text-white">SKILLS</h2>
            <div className="space-y-2 text-sm">
              {skills.length > 0 ? skills.map(skill => (
                <div key={skill.id} className="text-gray-300">• {skill.name}</div>
              )) : (
                <>
                  <div className="text-gray-300">• Programming Languages: Python, C, C++, Java</div>
                  <div className="text-gray-300">• Web Development: HTML, CSS, JavaScript, Bootstrap, React.js</div>
                  <div className="text-gray-300">• Backend Development: Spring Boot, RESTful API, Node.js, Express</div>
                  <div className="text-gray-300">• Database Management: MySQL, PostgreSQL, MongoDB</div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Education */}
        {getSectionsToShow().includes('education') && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 text-white">EDUCATION</h2>
            {education.length > 0 ? education.map(edu => (
              <div key={edu.id} className="mb-4">
                <h3 className="font-bold text-sm text-white">{edu.degree}</h3>
                <p className="text-sm text-gray-300">{edu.institution}</p>
                <p className="text-sm text-gray-400">{edu.location}</p>
                {edu.gpa && <p className="text-sm text-gray-400">GPA: {edu.gpa}</p>}
                <p className="text-sm text-gray-400">{new Date(edu.endDate).getFullYear()}</p>
              </div>
            )) : (
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-bold text-white">B.Tech: Computer Science & Engineering</h3>
                  <p className="text-gray-300">Amrita Vishwa Vidyapeetham Expected in Jan 2026</p>
                  <p className="text-gray-400">Vallikkavu, Kollam</p>
                  <p className="text-gray-400">GPA: 8.35/10</p>
                </div>
                <div>
                  <h3 className="font-bold text-white">Senior Secondary (XII)</h3>
                  <p className="text-gray-300">Jawahar Navodaya Vidyalaya Jan 2021</p>
                  <p className="text-gray-400">Kottayam</p>
                  <p className="text-gray-400">GPA: 94.20</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Profile Summary */}
        {getSectionsToShow().includes('summary') && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">PROFILE SUMMARY</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {personalInfo.summary || 'A dedicated Computer Science student with expertise in developing deep-learning models, analyzing network data, and building web applications. Proficient in programming languages and tools such as Python, SQL, Java, HTML, CSS, and JavaScript, with editorial strengths in database management (MySQL, PostgreSQL) and frameworks like Bootstrap. Demonstrates strong problem-solving abilities, analytical thinking, and a detail-oriented approach to tackling technical challenges.'}
            </p>
          </div>
        )}

        {/* Internships */}
        {getSectionsToShow().includes('internships') && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">INTERNSHIPS</h2>
            <div className="mb-6">
              <h3 className="font-bold text-lg">Full Stack Development Intern</h3>
              <p className="text-gray-600">Kottayam</p>
              <p className="text-gray-600">Nexospark | Mar 2022 to May 2025</p>
              <ul className="mt-3 space-y-1 text-sm">
                <li>• Designed and developed full-stack web applications using Node.js, Express, and MongoDB, creating RESTful APIs to enable seamless frontend-backend integration.</li>
                <li>• Developed and integrated RESTful APIs with backend services and databases.</li>
                <li>• Collaborated with cross-functional teams to conceptualize and deliver full-stack web solutions.</li>
                <li>• Learned and applied best practices in version control, debugging, and deployment workflows.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Projects */}
        {getSectionsToShow().includes('projects') && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">PROJECTS</h2>
            <div className="space-y-6 text-sm">
              <div>
                <h3 className="font-bold">Heart Disease Prediction Model</h3>
                <p className="text-gray-600 mb-2">Dec 2024</p>
                <ul className="space-y-1">
                  <li>• Developed a machine learning model to predict heart disease using Random Forest on a Kaggle dataset.</li>
                  <li>• Applied GridSearchCV to fine-tune hyperparameters, enhancing overall model performance.</li>
                  <li>• Evaluated predictions using accuracy, precision, recall, and ROC-AUC to ensure robustness.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Certifications */}
        {getSectionsToShow().includes('certifications') && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">CERTIFICATIONS</h2>
            <div className="text-sm">
              <p>• Certification in Data Science and Technology Awareness Training (START) Sep 2024. Completed specialized courses at Amrita Learning (ML) and Cisco Networking Academy.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Template 5: Blue Sidebar Classic
  const Template5Preview = () => (
    <div className="bg-white flex min-h-screen">
      {/* Left Sidebar */}
      <div className="w-64 bg-blue-500 text-white p-6">
        {/* Contact Info */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 text-white">CONTACT</h2>
          <div className="text-sm space-y-2">
            <div>📞 {personalInfo.phone || '+91 6282569756'}</div>
            <div>✉️ {personalInfo.email || 'sreeharij642@gmail.com'}</div>
            <div>📍 {personalInfo.address || 'Kottayam, India'}</div>
            {personalInfo.linkedin && <div>🔗 {personalInfo.linkedin}</div>}
          </div>
        </div>

        {/* Skills */}
        {getSectionsToShow().includes('skills') && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 text-white">SKILLS</h2>
            <div className="space-y-2 text-sm">
              {skills.length > 0 ? skills.map(skill => (
                <div key={skill.id} className="text-blue-100">• {skill.name}</div>
              )) : (
                <>
                  <div className="text-blue-100">• Python, Java, C++</div>
                  <div className="text-blue-100">• React.js, Node.js</div>
                  <div className="text-blue-100">• MySQL, MongoDB</div>
                  <div className="text-blue-100">• Machine Learning</div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Languages */}
        {getSectionsToShow().includes('languages') && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 text-white">LANGUAGES</h2>
            <div className="space-y-2 text-sm">
              {languages.length > 0 ? languages.map(lang => (
                <div key={lang.id} className="text-blue-100">• {lang.name} - {lang.proficiency}</div>
              )) : (
                <>
                  <div className="text-blue-100">• English - Fluent</div>
                  <div className="text-blue-100">• Hindi - Intermediate</div>
                  <div className="text-blue-100">• Malayalam - Native</div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {personalInfo.firstName && personalInfo.lastName
              ? `${personalInfo.firstName} ${personalInfo.lastName}`
              : 'SREEHARI J'}
          </h1>
          <p className="text-lg text-gray-600">Computer Science Student</p>
        </div>

        {/* Summary */}
        {getSectionsToShow().includes('summary') && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-blue-500 border-b-2 border-blue-500 pb-2 mb-4">PROFILE SUMMARY</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {personalInfo.summary || 'A dedicated Computer Science student with expertise in developing deep-learning models, analyzing network data, and building web applications. Proficient in programming languages and tools such as Python, SQL, Java, HTML, CSS, and JavaScript.'}
            </p>
          </div>
        )}

        {/* Education */}
        {getSectionsToShow().includes('education') && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-blue-500 border-b-2 border-blue-500 pb-2 mb-4">EDUCATION</h2>
            {education.length > 0 ? education.map(edu => (
              <div key={edu.id} className="mb-4">
                <h3 className="font-bold text-lg">{edu.degree}</h3>
                <p className="text-gray-600">{edu.institution}</p>
                <p className="text-gray-500">{edu.location} | {new Date(edu.endDate).getFullYear()}</p>
                {edu.gpa && <p className="text-gray-500">GPA: {edu.gpa}</p>}
              </div>
            )) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg">B.Tech Computer Science & Engineering</h3>
                  <p className="text-gray-600">Amrita Vishwa Vidyapeetham</p>
                  <p className="text-gray-500">Kollam | 2022-2026</p>
                  <p className="text-gray-500">CGPA: 8.35/10</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Projects */}
        {getSectionsToShow().includes('projects') && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-blue-500 border-b-2 border-blue-500 pb-2 mb-4">PROJECTS</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg">Heart Disease Prediction Model</h3>
                <p className="text-gray-600 mb-2">Dec 2024</p>
                <ul className="text-sm space-y-1">
                  <li>• Developed a machine learning model using Random Forest on Kaggle dataset</li>
                  <li>• Applied GridSearchCV to fine-tune hyperparameters</li>
                  <li>• Evaluated using accuracy, precision, recall, and ROC-AUC</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Template 6: Modern Minimalist
  const Template6Preview = () => (
    <div className="bg-white p-8">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {personalInfo.firstName && personalInfo.lastName
            ? `${personalInfo.firstName} ${personalInfo.lastName}`
            : 'SREEHARI J'}
        </h1>
        <p className="text-lg text-gray-600 mb-4">Computer Science Student</p>
        <div className="flex justify-center space-x-6 text-sm text-gray-600">
          <span>📞 {personalInfo.phone || '+91 6282569756'}</span>
          <span>✉️ {personalInfo.email || 'sreeharij642@gmail.com'}</span>
          <span>📍 {personalInfo.address || 'Kottayam, India'}</span>
          {personalInfo.linkedin && <span>🔗 {personalInfo.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {getSectionsToShow().includes('summary') && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-blue-500 mb-4">PROFILE SUMMARY</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            {personalInfo.summary || 'A dedicated Computer Science student with expertise in developing deep-learning models, analyzing network data, and building web applications. Proficient in programming languages and tools such as Python, SQL, Java, HTML, CSS, and JavaScript.'}
          </p>
        </div>
      )}

      {/* Education */}
      {getSectionsToShow().includes('education') && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-blue-500 mb-4">EDUCATION</h2>
          {education.length > 0 ? education.map(edu => (
            <div key={edu.id} className="mb-4">
              <h3 className="font-bold text-lg">{edu.degree}</h3>
              <p className="text-gray-600">{edu.institution}</p>
              <p className="text-gray-500">{edu.location} | {new Date(edu.endDate).getFullYear()}</p>
              {edu.gpa && <p className="text-gray-500">GPA: {edu.gpa}</p>}
            </div>
          )) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg">B.Tech Computer Science & Engineering</h3>
                <p className="text-gray-600">Amrita Vishwa Vidyapeetham</p>
                <p className="text-gray-500">Kollam | 2022-2026</p>
                <p className="text-gray-500">CGPA: 8.35/10</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Skills */}
      {getSectionsToShow().includes('skills') && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-blue-500 mb-4">SKILLS</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {skills.length > 0 ? skills.map(skill => (
              <div key={skill.id}>• {skill.name}</div>
            )) : (
              <>
                <div>• Programming: Python, Java, C++</div>
                <div>• Web Development: React.js, Node.js</div>
                <div>• Database: MySQL, MongoDB</div>
                <div>• Machine Learning & AI</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Projects */}
      {getSectionsToShow().includes('projects') && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-blue-500 mb-4">PROJECTS</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg">Heart Disease Prediction Model</h3>
              <p className="text-gray-600 mb-2">Dec 2024</p>
              <ul className="text-sm space-y-1">
                <li>• Developed a machine learning model using Random Forest</li>
                <li>• Applied GridSearchCV for hyperparameter tuning</li>
                <li>• Achieved high accuracy using ROC-AUC evaluation</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (buildStep === 'list') {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-3xl font-bold text-white">My Resume</h1>
              {resumes.length > 2 && (
                <button
                  className="text-blue-400 hover:text-blue-300 text-sm underline"
                  onClick={() => {/* TODO: Navigate to full resume history */}}
                >
                  View All ({resumes.length})
                </button>
              )}
            </div>
            <p className="text-gray-400">Start Creating AI resume to your next Job role</p>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Create New Resume Card */}
          <Card
            className="border-2 border-dashed border-gray-600 hover:border-gray-500 cursor-pointer transition-colors bg-gray-800 flex flex-col h-full"
            onClick={() => setBuildStep('template-selection')}
          >
            <CardContent className="p-0 flex flex-col h-full">
              <div className="h-40 flex flex-col items-center justify-center p-6">
                <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Create New Resume</h3>
              </div>
              <div className="p-4 flex-grow flex items-center justify-center">
                <p className="text-gray-400 text-sm text-center">Click to start building your resume</p>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoadingResumes && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-gray-400">Loading resumes...</div>
              </CardContent>
            </Card>
          )}

          {/* Recent Resumes (limit to 2) */}
          {resumes.slice(0, 2).map((resume) => (
            <Card key={resume.id} className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow flex flex-col h-full">
              <CardContent className="p-0 flex flex-col h-full">
                <div className="relative">
                  <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                    <div className="text-white text-center">
                      <FileText className="w-8 h-8 mx-auto mb-2" />
                      <div className="text-xs opacity-75">Resume Preview</div>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      {resume.template}
                    </span>
                  </div>
                </div>
                <div className="p-4 h-24 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-white mb-1">{resume.title}</h3>
                    <p className="text-sm text-gray-400 mb-3">Updated {resume.updatedAt}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => handleEditResume(resume)}
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => handlePreview(resume)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${resume.title}"? This action cannot be undone.`)) {
                          handleDeleteResume(resume.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        </div>
      </div>
    );
  }

  if (buildStep === 'template-selection') {
    return <TemplateSelection />;
  }

  if (buildStep === 'build-method') {
    return <BuildMethodSelection />;
  }

  // Builder View - handled by return statement below
  if (false && buildStep === 'builder') {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-white">My Resume</h1>
            <p className="text-gray-400">Start Creating AI resume to your next Job role</p>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create New Resume Card */}
          <Card
            className="border-2 border-dashed border-gray-600 hover:border-gray-500 cursor-pointer transition-colors bg-gray-800"
            onClick={() => setBuildStep('template-selection')}
          >
            <CardContent className="flex flex-col items-center justify-center h-64 p-6">
              <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-400 text-center">Create New Resume</p>
            </CardContent>
          </Card>


          {/* Loading State */}
          {isLoadingResumes && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-gray-400">Loading resumes...</div>
              </CardContent>
            </Card>
          )}

          {/* Recent Resumes (limit to 2) */}
          {resumes.slice(0, 2).map((resume) => (
            <Card key={resume.id} className="relative group hover:shadow-lg transition-shadow bg-gray-800 border-gray-700">
              <CardContent className="p-0">
                <div className={`h-48 bg-gradient-to-br ${resume.template === 'modern' ? 'from-blue-900 to-blue-800' : resume.template === 'classic' ? 'from-purple-900 to-purple-800' : 'from-green-900 to-green-800'} rounded-t-lg relative overflow-hidden`}>
                  <div className="absolute top-4 left-4">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <FileText className={`w-4 h-4 ${resume.template === 'modern' ? 'text-blue-600' : resume.template === 'classic' ? 'text-purple-600' : 'text-green-600'}`} />
                    </div>
                  </div>

                  {/* Resume Preview Mockup */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      {/* Header mockup */}
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-6 h-6 ${resume.template === 'modern' ? 'bg-blue-100' : resume.template === 'classic' ? 'bg-purple-100' : 'bg-green-100'} rounded-full`}></div>
                        <div className="flex-1">
                          <div className="h-2 bg-gray-200 rounded mb-1"></div>
                          <div className="h-1.5 bg-gray-100 rounded w-3/4"></div>
                        </div>
                      </div>

                      {/* Content mockup */}
                      <div className="space-y-1">
                        <div className="h-1 bg-gray-100 rounded"></div>
                        <div className="h-1 bg-gray-100 rounded w-5/6"></div>
                        <div className="h-1 bg-gray-100 rounded w-4/6"></div>
                        <div className="h-0.5 bg-gray-50 rounded w-full my-1"></div>
                        <div className="h-1 bg-gray-100 rounded w-3/4"></div>
                        <div className="h-1 bg-gray-100 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>

                  {/* Template badge */}
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {resume.template}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg text-white">{resume.title}</h3>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                    <span>Updated {new Date(resume.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => handleEditResume(resume)}
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => handlePreview(resume)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => handlePreview(resume)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                      onClick={() => handleDownloadResume(resume)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          .resume-preview {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .resume-section {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
        .resume-preview {
          font-size: 14px;
          line-height: 1.4;
        }
        .resume-preview h1 {
          font-size: 20px;
        }
        .resume-preview h2 {
          font-size: 16px;
        }
        .resume-preview h3 {
          font-size: 14px;
        }
        .resume-preview p, .resume-preview div {
          font-size: 12px;
        }
        .page-container {
          min-height: 800px;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          background: white;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          overflow: visible;
          page-break-after: always;
          position: relative;
        }
        @media print {
          .page-container {
            min-height: 11in;
            max-height: 11in;
            width: 8.5in;
            overflow: hidden;
          }
        }
        .page-number {
          position: absolute;
          bottom: 20px;
          right: 20px;
          font-size: 10px;
          color: #666;
        }
        .page-break {
          page-break-before: always;
          break-before: page;
        }
      `}</style>
      <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setBuildStep('template-selection')}
          >
            <Home className="w-4 h-4 mr-2" />
            Change Template
          </Button>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{selectedResume?.title}</span>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={activeTab === 'personal'}
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            ← Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={activeTab === 'languages'}
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            Next →
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Remove the TabsList - no navigation bar */}

            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Detail</CardTitle>
                  <p className="text-sm text-gray-600">Get Started with the basic information</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={personalInfo.firstName}
                        onChange={(e) => setPersonalInfo({...personalInfo, firstName: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={personalInfo.lastName}
                        onChange={(e) => setPersonalInfo({...personalInfo, lastName: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={personalInfo.jobTitle}
                      onChange={(e) => setPersonalInfo({...personalInfo, jobTitle: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="profileImage">Profile Image</Label>
                    <Input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setPersonalInfo({...personalInfo, profileImage: file});
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={personalInfo.address}
                      onChange={(e) => setPersonalInfo({...personalInfo, address: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={personalInfo.email}
                        onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn Profile</Label>
                    <Input
                      id="linkedin"
                      value={personalInfo.linkedin}
                      onChange={(e) => setPersonalInfo({...personalInfo, linkedin: e.target.value})}
                      placeholder="https://www.linkedin.com/in/your-profile"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleSave} className="flex-1">
                      Save
                    </Button>
                    <Button
                      onClick={() => {
                        if (!dreamJob.trim()) {
                          alert('Please enter your dream job first!');
                          return;
                        }
                        alert('AI assistance for personal info coming soon!');
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      🤖 AI Help
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="experience" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Work Experience</CardTitle>
                  <p className="text-sm text-gray-600">Add your work experience</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {workExperience.map((exp) => (
                    <div key={exp.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Experience {workExperience.indexOf(exp) + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWorkExperience(exp.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Job Title</Label>
                          <Input
                            value={exp.jobTitle}
                            onChange={(e) => updateWorkExperience(exp.id, 'jobTitle', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Company</Label>
                          <Input
                            value={exp.company}
                            onChange={(e) => updateWorkExperience(exp.id, 'company', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input
                          value={exp.location}
                          onChange={(e) => updateWorkExperience(exp.id, 'location', e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={exp.startDate}
                            onChange={(e) => updateWorkExperience(exp.id, 'startDate', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            value={exp.endDate}
                            onChange={(e) => updateWorkExperience(exp.id, 'endDate', e.target.value)}
                            disabled={exp.current}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Summary</Label>
                        <div className="relative">
                          <Textarea
                            value={exp.description}
                            onChange={(e) => updateWorkExperience(exp.id, 'description', e.target.value)}
                            rows={4}
                            className="pr-32"
                          />
                          <Button
                            className="absolute top-2 right-2 bg-purple-600 hover:bg-purple-700"
                            size="sm"
                            onClick={() => handleAIGenerateExperience(exp.id, exp.company, exp.jobTitle)}
                            disabled={aiLoading === `experience-${exp.id}` || !exp.company || !exp.jobTitle}
                          >
                            {aiLoading === `experience-${exp.id}` ? '⏳' : '🤖'} Generate from AI
                          </Button>
                        </div>

                        {/* Rich Text Toolbar */}
                        <div className="flex space-x-2 p-2 border rounded-lg bg-gray-50 mt-2">
                          <Button variant="ghost" size="sm">
                            <Bold className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Italic className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Underline className="w-4 h-4" />
                          </Button>
                          <div className="w-px bg-gray-300 mx-2"></div>
                          <Button variant="ghost" size="sm">
                            <List className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <AlignLeft className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <Button onClick={addWorkExperience} variant="outline" className="flex-1">
                      + Add More Experience
                    </Button>
                    <Button variant="outline" className="flex-1">
                      - Remove
                    </Button>
                  </div>

                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Save
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="education" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Education</CardTitle>
                  <p className="text-sm text-gray-600">Add your educational background</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {education.map((edu) => (
                    <div key={edu.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Education {education.indexOf(edu) + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEducation(edu.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Degree</Label>
                          <Input
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Institution</Label>
                          <Input
                            value={edu.institution}
                            onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input
                          value={edu.location}
                          onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={edu.startDate}
                            onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            value={edu.endDate}
                            onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>GPA (Optional)</Label>
                          <Input
                            value={edu.gpa}
                            onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <Button onClick={addEducation} variant="outline" className="flex-1">
                      + Add More Education
                    </Button>
                    <Button variant="outline" className="flex-1">
                      - Remove
                    </Button>
                  </div>

                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Save
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                  <p className="text-sm text-gray-600">Add your technical and soft skills</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {skills.map((skill) => (
                    <div key={skill.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Skill {skills.indexOf(skill) + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSkill(skill.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div>
                        <Label>Name</Label>
                        <Input
                          value={skill.name}
                          onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                          placeholder="e.g., React"
                        />
                      </div>

                      <div>
                        <Label>Rating</Label>
                        <StarRating
                          rating={skill.rating}
                          onRatingChange={(rating) => updateSkill(skill.id, 'rating', rating)}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="flex space-x-2">
                    <Button onClick={addSkill} variant="outline" className="flex-1">
                      + Add More Skill
                    </Button>
                    <Button variant="outline" className="flex-1">
                      - Remove
                    </Button>
                  </div>

                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Save
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                  <p className="text-sm text-gray-600">Add Summary for your job title</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="dreamJob">Dream Job (for AI assistance)</Label>
                    <Input
                      id="dreamJob"
                      value={dreamJob}
                      onChange={(e) => setDreamJob(e.target.value)}
                      placeholder="e.g., Software Engineer, Data Scientist, Product Manager"
                      className="border-purple-200 focus:border-purple-500 mb-4"
                    />
                    <p className="text-xs text-gray-500 mb-4">This helps AI generate relevant content for your resume</p>
                  </div>
                  <div>
                    <Label>Add Summary</Label>
                    <div className="relative">
                      <Textarea
                        value={personalInfo.summary}
                        onChange={(e) => setPersonalInfo({...personalInfo, summary: e.target.value})}
                        placeholder="Write a brief summary about yourself..."
                        rows={6}
                        className="mt-2"
                      />
                      <Button
                        className="absolute bottom-3 right-3 bg-purple-600 hover:bg-purple-700"
                        size="sm"
                        onClick={handleAIGenerateSummary}
                        disabled={aiLoading === 'summary'}
                      >
                        {aiLoading === 'summary' ? '⏳' : '🤖'} Generate from AI
                      </Button>
                    </div>
                  </div>

                  {/* Rich Text Toolbar */}
                  <div className="flex space-x-2 p-2 border rounded-lg bg-gray-50">
                    <Button variant="ghost" size="sm">
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Underline className="w-4 h-4" />
                    </Button>
                    <div className="w-px bg-gray-300 mx-2"></div>
                    <Button variant="ghost" size="sm">
                      <List className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <AlignLeft className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    🔮 Save
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Projects</CardTitle>
                  <p className="text-sm text-gray-600">Add your projects and achievements</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold">Project</h3>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAIGenerateProject(project.id, project.title, project.technologies)}
                            variant="outline"
                            size="sm"
                            disabled={aiLoading === `project-${project.id}` || !project.title}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            {aiLoading === `project-${project.id}` ? '⏳' : '🤖'} Generate from AI
                          </Button>
                          <Button
                            onClick={() => removeProject(project.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`project-title-${project.id}`}>Project Title</Label>
                          <Input
                            id={`project-title-${project.id}`}
                            value={project.title}
                            onChange={(e) => updateProject(project.id, 'title', e.target.value)}
                            placeholder="e.g., E-commerce Website"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`project-technologies-${project.id}`}>Technologies Used</Label>
                          <Input
                            id={`project-technologies-${project.id}`}
                            value={project.technologies}
                            onChange={(e) => updateProject(project.id, 'technologies', e.target.value)}
                            placeholder="e.g., React, Node.js, MongoDB"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`project-start-${project.id}`}>Start Date</Label>
                          <Input
                            id={`project-start-${project.id}`}
                            type="month"
                            value={project.startDate}
                            onChange={(e) => updateProject(project.id, 'startDate', e.target.value)}
                            placeholder="YYYY-MM"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`project-end-${project.id}`}>End Date</Label>
                          <Input
                            id={`project-end-${project.id}`}
                            type="month"
                            value={project.endDate}
                            onChange={(e) => updateProject(project.id, 'endDate', e.target.value)}
                            placeholder="YYYY-MM"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`project-description-${project.id}`}>Description</Label>
                        <Textarea
                          id={`project-description-${project.id}`}
                          value={project.description}
                          onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                          placeholder="Describe your project, technologies used, and achievements..."
                          rows={4}
                        />
                      </div>
                    </div>
                  ))}

                  <Button onClick={addProject} variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Project
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Interests Tab */}
            <TabsContent value="interests" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Areas of Interest</CardTitle>
                  <p className="text-sm text-gray-600">Add your areas of interest</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {interests.map((interest) => (
                      <div key={interest.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold">Interest</h3>
                          <Button
                            onClick={() => removeInterest(interest.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <Label htmlFor={`interest-name-${interest.id}`}>Interest Name</Label>
                            <Input
                              id={`interest-name-${interest.id}`}
                              value={interest.name}
                              onChange={(e) => updateInterest(interest.id, 'name', e.target.value)}
                              placeholder="e.g., Machine Learning, Photography, Music"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button onClick={addInterest} variant="outline" className="w-full">
                      + Add Interest
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Internships Tab */}
            <TabsContent value="internships" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Internships</CardTitle>
                  <p className="text-sm text-gray-600">Add your internship experience</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {internships.map((internship) => (
                      <div key={internship.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold">Internship</h3>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleAIGenerateInternship(internship.id, internship.title, internship.company)}
                              variant="outline"
                              className="flex-1"
                              disabled={aiLoading === `internship-${internship.id}` || !internship.title || !internship.company}
                            >
                              {aiLoading === `internship-${internship.id}` ? '⏳' : '🤖'} Generate from AI
                            </Button>
                            <Button
                              onClick={() => removeInternship(internship.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`internship-title-${internship.id}`}>Job Title</Label>
                            <Input
                              id={`internship-title-${internship.id}`}
                              value={internship.title}
                              onChange={(e) => updateInternship(internship.id, 'title', e.target.value)}
                              placeholder="e.g., Software Development Intern"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`internship-company-${internship.id}`}>Company</Label>
                            <Input
                              id={`internship-company-${internship.id}`}
                              value={internship.company}
                              onChange={(e) => updateInternship(internship.id, 'company', e.target.value)}
                              placeholder="e.g., Google"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div>
                            <Label htmlFor={`internship-location-${internship.id}`}>Location</Label>
                            <Input
                              id={`internship-location-${internship.id}`}
                              value={internship.location}
                              onChange={(e) => updateInternship(internship.id, 'location', e.target.value)}
                              placeholder="e.g., San Francisco, CA"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`internship-start-${internship.id}`}>Start Date</Label>
                            <Input
                              id={`internship-start-${internship.id}`}
                              value={internship.startDate}
                              onChange={(e) => updateInternship(internship.id, 'startDate', e.target.value)}
                              placeholder="e.g., June 2023"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`internship-end-${internship.id}`}>End Date</Label>
                            <Input
                              id={`internship-end-${internship.id}`}
                              value={internship.endDate}
                              onChange={(e) => updateInternship(internship.id, 'endDate', e.target.value)}
                              placeholder="e.g., August 2023"
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <Label htmlFor={`internship-description-${internship.id}`}>Description</Label>
                          <Textarea
                            id={`internship-description-${internship.id}`}
                            value={internship.description}
                            onChange={(e) => updateInternship(internship.id, 'description', e.target.value)}
                            placeholder="Describe your internship experience and achievements..."
                            rows={4}
                          />
                        </div>
                      </div>
                    ))}
                    <Button onClick={addInternship} variant="outline" className="w-full">
                      + Add Internship
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Certifications Tab */}
            <TabsContent value="certifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Certifications</CardTitle>
                  <p className="text-sm text-gray-600">Add your certifications</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {certifications.map((cert) => (
                      <div key={cert.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold">Certification</h3>
                          <Button
                            onClick={() => removeCertification(cert.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`cert-name-${cert.id}`}>Certification Name</Label>
                            <Input
                              id={`cert-name-${cert.id}`}
                              value={cert.name}
                              onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                              placeholder="e.g., AWS Certified Solutions Architect"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`cert-issuer-${cert.id}`}>Issuing Organization</Label>
                            <Input
                              id={`cert-issuer-${cert.id}`}
                              value={cert.issuer}
                              onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                              placeholder="e.g., Amazon Web Services"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <Label htmlFor={`cert-date-${cert.id}`}>Date Obtained</Label>
                            <Input
                              id={`cert-date-${cert.id}`}
                              value={cert.date}
                              onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                              placeholder="e.g., March 2023"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`cert-expiry-${cert.id}`}>Expiry Date (Optional)</Label>
                            <Input
                              id={`cert-expiry-${cert.id}`}
                              value={cert.expiryDate || ''}
                              onChange={(e) => updateCertification(cert.id, 'expiryDate', e.target.value)}
                              placeholder="e.g., March 2026"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button onClick={addCertification} variant="outline" className="w-full">
                      + Add Certification
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Extra-Curricular Activities</CardTitle>
                  <p className="text-sm text-gray-600">Add your extra-curricular activities</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold">Activity</h3>
                          <Button
                            onClick={() => removeActivity(activity.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`activity-name-${activity.id}`}>Activity Name</Label>
                            <Input
                              id={`activity-name-${activity.id}`}
                              value={activity.name}
                              onChange={(e) => updateActivity(activity.id, 'name', e.target.value)}
                              placeholder="e.g., Student Council President"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`activity-date-${activity.id}`}>Date</Label>
                            <Input
                              id={`activity-date-${activity.id}`}
                              value={activity.date}
                              onChange={(e) => updateActivity(activity.id, 'date', e.target.value)}
                              placeholder="e.g., 2022-2023"
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <Label htmlFor={`activity-description-${activity.id}`}>Description</Label>
                          <Textarea
                            id={`activity-description-${activity.id}`}
                            value={activity.description}
                            onChange={(e) => updateActivity(activity.id, 'description', e.target.value)}
                            placeholder="Describe your role and achievements in this activity..."
                            rows={3}
                          />
                        </div>
                      </div>
                    ))}
                    <Button onClick={addActivity} variant="outline" className="w-full">
                      + Add Activity
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Outreach Tab */}
            <TabsContent value="outreach" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Social Outreach</CardTitle>
                  <p className="text-sm text-gray-600">Add your social outreach activities</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {outreach.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold">Outreach Activity</h3>
                          <Button
                            onClick={() => removeOutreach(item.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`outreach-name-${item.id}`}>Activity Name</Label>
                            <Input
                              id={`outreach-name-${item.id}`}
                              value={item.name}
                              onChange={(e) => updateOutreach(item.id, 'name', e.target.value)}
                              placeholder="e.g., Community Food Drive"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`outreach-date-${item.id}`}>Date</Label>
                            <Input
                              id={`outreach-date-${item.id}`}
                              value={item.date}
                              onChange={(e) => updateOutreach(item.id, 'date', e.target.value)}
                              placeholder="e.g., December 2023"
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <Label htmlFor={`outreach-description-${item.id}`}>Description</Label>
                          <Textarea
                            id={`outreach-description-${item.id}`}
                            value={item.description}
                            onChange={(e) => updateOutreach(item.id, 'description', e.target.value)}
                            placeholder="Describe your contribution and impact..."
                            rows={3}
                          />
                        </div>
                      </div>
                    ))}
                    <Button onClick={addOutreach} variant="outline" className="w-full">
                      + Add Outreach Activity
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Languages Tab */}
            <TabsContent value="languages" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Languages</CardTitle>
                  <p className="text-sm text-gray-600">Add languages you speak</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {languages.map((language) => (
                      <div key={language.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold">Language</h3>
                          <Button
                            onClick={() => removeLanguage(language.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`language-name-${language.id}`}>Language</Label>
                            <Input
                              id={`language-name-${language.id}`}
                              value={language.name}
                              onChange={(e) => updateLanguage(language.id, 'name', e.target.value)}
                              placeholder="e.g., Spanish"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`language-proficiency-${language.id}`}>Proficiency</Label>
                            <select
                              id={`language-proficiency-${language.id}`}
                              value={language.proficiency}
                              onChange={(e) => updateLanguage(language.id, 'proficiency', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md"
                            >
                              <option value="Beginner">Beginner</option>
                              <option value="Intermediate">Intermediate</option>
                              <option value="Advanced">Advanced</option>
                              <option value="Native">Native</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button onClick={addLanguage} variant="outline" className="w-full">
                      + Add Language
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Section - Wider */}
        <div className="lg:col-span-3 lg:sticky lg:top-6">
          <Card className="h-fit">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Resume Preview</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Page {currentPage}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      ←
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      →
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded-lg">
                {/* Action Buttons */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDownloadPDF}
                      variant="outline"
                      size="sm"
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      📄 Download PDF
                    </Button>
                    <Button
                      onClick={handleSaveResume}
                      variant="outline"
                      size="sm"
                      className="bg-green-600 text-white hover:bg-green-700"
                    >
                      💾 Save Resume
                    </Button>
                  </div>
                  <button
                    onClick={() => setBuildStep('template-selection')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Change template
                  </button>
                </div>

                {/* Page Container with proper sizing */}
                <div className="page-container mx-auto relative">
                  <div className="p-6 min-h-full">
                    {/* Resume Preview Content */}
                    <div className="text-black resume-preview">
                      {selectedTemplate === 'template1' && <Template1Preview />}
                      {selectedTemplate === 'template2' && <Template2Preview />}
                      {selectedTemplate === 'template3' && <Template3Preview />}
                      {selectedTemplate === 'template4' && <Template4Preview />}
                      {selectedTemplate === 'template5' && <Template5Preview />}
                      {selectedTemplate === 'template6' && <Template6Preview />}
                    </div>
                  </div>

                  {/* Page Number */}
                  <div className="page-number">
                    Page {currentPage}
                  </div>
                </div>

                {/* Page Navigation */}
                <div className="flex justify-center items-center gap-4 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous Page
                  </Button>
                  <span className="text-sm text-gray-600">Page {currentPage}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next Page
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </>
  );
};

export default NewResumeBuilder;
