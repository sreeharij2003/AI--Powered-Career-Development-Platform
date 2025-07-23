import Navbar from '@/components/layout/Navbar';
import { API } from '@/services/api';
import { AlertCircle, CheckCircle, Download, Edit2, FileText, Plus, Trash2, Upload, User as UserIcon, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const initialProfile = {
  name: 'Sreehari J',
  location: 'Kottayam, INDIA',
  phone: '6282569756',
  email: 'sjhari2003@gmail.com',
  fresher: true,
  availability: '',
  resume: '',
  resumeFile: null as File | null,
  resumeURL: null as string | null,
  resumeUploadDate: null as string | null,
  resumeBase64: null as string | null,
  resumeContentType: null as string | null,
  resumeId: null as string | null,
  resumeHeadline: '',
  keySkills: ['C++', 'Python', 'Machine Learning'],
  employment: [],
  education: [
    { degree: 'BTEC CSE', school: 'Amrita Institute of Computer Technology, Kollam', year: '2023-2026', type: 'Full Time' },
    { degree: 'Class XII', school: 'CBSE', year: '2021', type: '' },
    { degree: 'Class X', school: 'CBSE', year: '2019', type: '' }
  ],
  itSkills: ['Java', 'Javascript', 'HTML', 'CSS', 'Algorithms', 'Deep Learning', 'R Program'],
  projects: [
    { title: 'Synthetic Cancer Prediction Dataset for Research', org: 'self project (Offsite)', period: 'Dec 2023 to Jan 2024 (Full Time)', desc: 'eng' }
  ],
  summary: '',
  accomplishments: [],
  careerProfile: {
    industry: '', department: 'Engineering - Software & QA', roleCategory: 'Software Development', jobRole: 'Full Stack Developer', jobType: '', employmentType: '', shift: '', location: '', salary: ''
  },
  personal: { gender: 'male', marital: 'Single / unmarried', dob: '04 Jan 2003', category: 'General', differentlyAbled: 'No', careerBreak: 'No', workPermit: '', address: 'kottayam, 686587' },
  languages: [
    { name: 'English', proficiency: 'Proficient' },
    { name: 'Hindi', proficiency: 'Proficient' },
    { name: 'Malayalam', proficiency: 'Expert' }
  ],
  disability: '',
};

const sectionWeights = {
  resumeHeadline: 8,
  keySkills: 8,
  employment: 8,
  education: 8,
  itSkills: 8,
  projects: 8,
  summary: 8,
  accomplishments: 8,
  careerProfile: 8,
  personal: 8,
  languages: 8,
  resume: 8,
};

// Helper function to convert base64 to Blob
const base64toBlob = (base64Data: string, contentType: string): Blob => {
  const sliceSize = 512;
  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
};

const ProfilePage = () => {
  const [profile, setProfile] = useState(initialProfile);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [newLang, setNewLang] = useState('');
  const [newProject, setNewProject] = useState({ title: '', org: '', period: '', desc: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumeProcessing, setResumeProcessing] = useState(false);
  const [resumeParseSuccess, setResumeParseSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // TODO: Add resume event emitter later

  // Load profile data from localStorage on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        
        // If we have a saved resume file data, convert it back to a usable URL
        if (parsedProfile.resumeBase64 && parsedProfile.resumeContentType) {
          const blob = base64toBlob(parsedProfile.resumeBase64, parsedProfile.resumeContentType);
          const fileURL = URL.createObjectURL(blob);
          
          parsedProfile.resumeURL = fileURL;
        }
        
        setProfile({
          ...parsedProfile,
          resumeFile: null // Reset resumeFile as it can't be stored in localStorage
        });
      } catch (error) {
        console.error('Error parsing saved profile:', error);
      }
    }
    
    // Try to fetch the resume from the server
    fetchResumeFromServer();
  }, []);
  
  // Fetch resume from server
  const fetchResumeFromServer = async () => {
    try {
      const resumeData = await API.resume.getResume();
      if (resumeData) {
        // Update profile with resume data from server
        setProfile(prev => ({
          ...prev,
          resume: resumeData.fileName,
          resumeURL: resumeData.fileUrl,
          resumeUploadDate: resumeData.uploadDate,
          resumeId: resumeData.id
        }));
      }
    } catch (error) {
      console.error('Error fetching resume from server:', error);
    }
  };

  // Save profile data to localStorage whenever it changes
  useEffect(() => {
    const saveProfile = async () => {
      // Create a copy of the profile
      const profileToSave = { ...profile };
      
      // Handle File object specially
      delete profileToSave.resumeFile;
      
      // If we have a new file that hasn't been saved yet, convert it to base64
      if (profile.resumeFile && !profileToSave.resumeBase64) {
        try {
          const base64 = await convertFileToBase64(profile.resumeFile);
          profileToSave.resumeBase64 = base64.split(',')[1]; // Remove the data URL prefix
          profileToSave.resumeContentType = profile.resumeFile.type;
        } catch (error) {
          console.error('Error converting file to base64:', error);
        }
      }
      
      localStorage.setItem('userProfile', JSON.stringify(profileToSave));
    };
    
    saveProfile();
  }, [profile]);

  // Helper function to convert File to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Calculate completeness based on filled sections
  const completeness = React.useMemo(() => {
    let score = 0;
    Object.entries(sectionWeights).forEach(([key, weight]) => {
      if (key === 'resume') {
        if (profile.resume) score += weight;
      } else if (key === 'employment' || key === 'education' || key === 'projects' || key === 'accomplishments' || key === 'languages' || key === 'itSkills' || key === 'keySkills') {
        if ((profile as any)[key] && (profile as any)[key].length > 0) score += weight;
      } else if (key === 'careerProfile' || key === 'personal') {
        if (Object.values((profile as any)[key]).some(Boolean)) score += weight;
      } else {
        if ((profile as any)[key]) score += weight;
      }
    });
    return Math.min(100, Math.round(score / Object.values(sectionWeights).reduce((a, b) => a + b, 0) * 100));
  }, [profile]);

  // Handlers for editing
  const handleEdit = (section: string) => setEditingSection(section);
  const handleSave = (section: string) => setEditingSection(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, section?: string) => {
    if (section) {
      setProfile({ ...profile, [section]: e.target.value });
    } else {
      setProfile({ ...profile, [e.target.name]: e.target.value });
    }
  };
  
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadError(null);
      
      // Create a URL for the file so we can access it later
      const fileURL = URL.createObjectURL(file);
      
      // Update local state immediately for better UX
      setProfile({ 
        ...profile, 
        resume: file.name, 
        resumeFile: file,
        resumeURL: fileURL,
        resumeUploadDate: new Date().toISOString(),
        resumeBase64: null,
        resumeContentType: file.type
      });
      
      setResumeProcessing(true);
      setResumeParseSuccess(false);
      
      try {
        // Upload to server
        const uploadResult = await API.resume.uploadResume(file);
        
        // Parse the resume
        if (uploadResult && uploadResult.id) {
          const parseResult = await API.resume.parseResume(uploadResult.id);
          
          // Update profile with parsed data
          if (parseResult) {
            setProfile(prev => ({
              ...prev,
              resumeId: uploadResult.id,
              resumeHeadline: prev.resumeHeadline || parseResult.headline || '',
              summary: prev.summary || parseResult.summary || '',
              keySkills: [...new Set([...prev.keySkills, ...(parseResult.skills || [])])],
              // Add other fields as needed
            }));
          }

          setResumeParseSuccess(true);

          // TODO: Emit resume uploaded event to trigger job recommendation refresh
        }
      } catch (error) {
        console.error('Error uploading or parsing resume:', error);
        setUploadError('Failed to upload or parse resume. Please try again.');
      } finally {
        setResumeProcessing(false);
      }
    }
  };
  
  const handleResumeDelete = async () => {
    // If we have a stored resumeURL, revoke it to free up memory
    if (profile.resumeURL) {
      URL.revokeObjectURL(profile.resumeURL);
    }
    
    setResumeProcessing(true);
    setUploadError(null);
    
    try {
      // Delete from server if we have an ID
      if (profile.resumeId) {
        await API.resume.deleteResume();
      }
      
      // Update local state
      setProfile({
        ...profile,
        resume: '',
        resumeFile: null,
        resumeURL: null,
        resumeUploadDate: null,
        resumeBase64: null,
        resumeContentType: null,
        resumeId: null
      });

      // TODO: Emit resume deleted event
    } catch (error) {
      console.error('Error deleting resume:', error);
      setUploadError('Failed to delete resume. Please try again.');
    } finally {
      setResumeProcessing(false);
    }
  };

  const handleDownloadResume = () => {
    if (profile.resumeURL) {
      const link = document.createElement('a');
      link.href = profile.resumeURL;
      link.download = profile.resume || 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const addSkill = () => {
    if (newSkill && !profile.keySkills.includes(newSkill)) {
      setProfile({ ...profile, keySkills: [...profile.keySkills, newSkill] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfile({ ...profile, keySkills: profile.keySkills.filter(s => s !== skill) });
  };

  const addLang = () => {
    if (newLang && !profile.languages.some(l => l.name === newLang)) {
      setProfile({ ...profile, languages: [...profile.languages, { name: newLang, proficiency: 'Proficient' }] });
      setNewLang('');
    }
  };

  const removeLang = (name: string) => {
    setProfile({ ...profile, languages: profile.languages.filter(l => l.name !== name) });
  };

  const addProject = () => {
    if (newProject.title) {
      setProfile({ ...profile, projects: [...profile.projects, newProject] });
      setNewProject({ title: '', org: '', period: '', desc: '' });
    }
  };
  const removeProject = (idx: number) => {
    setProfile({ ...profile, projects: profile.projects.filter((_, i) => i !== idx) });
  };

  return (
    <>
      <Navbar />
      <div className="bg-background min-h-screen pb-10 pt-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Resume Upload Section - New section at the top */}
          <div className="bg-card rounded-xl shadow-lg p-6 mb-6 border border-border">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className="bg-primary/10 p-3 rounded-full">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Resume Upload</h3>
                  <p className="text-muted-foreground text-sm">Upload your resume to automatically fill your profile</p>
                </div>
              </div>
              
              <div>
                {profile.resume ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{profile.resume}</span>
                    {profile.resumeUploadDate && (
                      <span className="text-xs text-muted-foreground">
                        Uploaded on {new Date(profile.resumeUploadDate).toLocaleDateString()}
                      </span>
                    )}
                    <button 
                      className="bg-primary text-white rounded-md px-4 py-2 flex items-center gap-2 hover:bg-primary/90 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={resumeProcessing}
                    >
                      <Upload size={16} /> Replace
                    </button>
                    <button 
                      className="text-red-500 hover:text-red-600 transition-colors"
                      onClick={handleResumeDelete}
                      disabled={resumeProcessing}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <button 
                    className="bg-primary text-white rounded-md px-4 py-2 flex items-center gap-2 hover:bg-primary/90 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={resumeProcessing}
                  >
                    {resumeProcessing ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload size={16} /> Upload Resume
                      </>
                    )}
                  </button>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleResumeUpload} 
                  accept=".pdf,.doc,.docx"
                />
              </div>
            </div>
            
            {resumeProcessing && (
              <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span>Processing your resume and extracting information...</span>
              </div>
            )}
            
            {resumeParseSuccess && (
              <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Resume parsed successfully! Your profile has been updated with the extracted information.</span>
              </div>
            )}
            
            {uploadError && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{uploadError}</span>
              </div>
            )}
            
            {profile.resumeURL && (
              <div className="mt-4 flex gap-4">
                <a 
                  href={profile.resumeURL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  <FileText size={16} /> View uploaded resume
                </a>
                <button
                  onClick={handleDownloadResume}
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  <Download size={16} /> Download resume
                </button>
              </div>
            )}
          </div>
          
          {/* Profile summary */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-card rounded-xl shadow-lg p-6 mb-8 border border-border">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-5xl border-2 border-primary">
                  <UserIcon className="w-16 h-16" />
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-background rounded-full px-2 py-1 text-xs font-semibold border shadow border-primary text-primary">{completeness}%</div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-2xl text-foreground">{profile.name}</span>
                  <button onClick={() => handleEdit('name')} className="text-primary hover:underline"><Edit2 size={16} /></button>
                </div>
                <div className="text-muted-foreground">{profile.location}</div>
                <div className="text-muted-foreground">{profile.phone} <span className="text-primary cursor-pointer text-xs ml-1">Verify</span></div>
                <div className="text-muted-foreground">{profile.email} <CheckCircle className="inline text-green-500 ml-1" size={14} /></div>
                <div className="text-muted-foreground">{profile.fresher ? 'Fresher' : ''}</div>
                <div className="text-muted-foreground">{profile.availability ? profile.availability : <span className="text-primary cursor-pointer text-xs">Add availability to join</span>}</div>
              </div>
            </div>
            <div className="mt-6 md:mt-0 flex flex-col items-end">
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                <div className="text-center">
                  <span className="text-lg font-medium">Profile Completeness</span>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${completeness}%` }}></div>
                  </div>
                  <span className="text-2xl font-bold text-primary mt-2 block">{completeness}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quick links */}
            <div className="col-span-1 space-y-4">
              <div className="bg-card rounded-xl shadow p-4 border border-border">
                <h3 className="font-semibold mb-2 text-foreground">Quick links</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between items-center">Resume headline <button className="text-primary ml-2" onClick={() => handleEdit('resumeHeadline')}>Add</button></li>
                  <li className="flex justify-between items-center">Key skills <button className="text-primary ml-2" onClick={() => handleEdit('keySkills')}>Add</button></li>
                  <li className="flex justify-between items-center">Employment <button className="text-primary ml-2" onClick={() => handleEdit('employment')}>Add</button></li>
                  <li className="flex justify-between items-center">Education <button className="text-primary ml-2" onClick={() => handleEdit('education')}>Add</button></li>
                  <li className="flex justify-between items-center">IT skills <button className="text-primary ml-2" onClick={() => handleEdit('itSkills')}>Add</button></li>
                  <li className="flex justify-between items-center">Projects <button className="text-primary ml-2" onClick={() => handleEdit('projects')}>Add</button></li>
                  <li className="flex justify-between items-center">Profile summary <button className="text-primary ml-2" onClick={() => handleEdit('summary')}>Add</button></li>
                  <li className="flex justify-between items-center">Accomplishments <button className="text-primary ml-2" onClick={() => handleEdit('accomplishments')}>Add</button></li>
                  <li className="flex justify-between items-center">Career profile <button className="text-primary ml-2" onClick={() => handleEdit('careerProfile')}>Add</button></li>
                  <li className="flex justify-between items-center">Personal details <button className="text-primary ml-2" onClick={() => handleEdit('personal')}>Add</button></li>
                  <li className="flex justify-between items-center">Languages <button className="text-primary ml-2" onClick={() => handleEdit('languages')}>Add</button></li>
                </ul>
              </div>
            </div>

            {/* Main content */}
            <div className="col-span-2 space-y-6">
              {/* Resume Headline */}
              <div className="bg-card rounded-xl shadow p-4 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-foreground">Resume Headline</h3>
                  <button className="text-primary" onClick={() => handleEdit('resumeHeadline')}><Edit2 size={16} /></button>
                </div>
                {editingSection === 'resumeHeadline' ? (
                  <div className="flex gap-2">
                    <input className="border rounded px-2 py-1 flex-1" name="resumeHeadline" value={profile.resumeHeadline} onChange={handleChange} />
                    <button className="bg-primary text-primary-foreground px-3 py-1 rounded" onClick={() => handleSave('resumeHeadline')}>Save</button>
                  </div>
                ) : (
                  <div className="text-muted-foreground">{profile.resumeHeadline || <span className="italic">Add a summary of your resume to introduce yourself to recruiters</span>}</div>
                )}
              </div>

              {/* Key Skills */}
              <div className="bg-card rounded-xl shadow p-4 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-foreground">Key Skills</h3>
                  <button className="text-primary" onClick={() => handleEdit('keySkills')}><Edit2 size={16} /></button>
                </div>
                {editingSection === 'keySkills' ? (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profile.keySkills.map(skill => (
                      <span key={skill} className="bg-primary/10 text-primary px-2 py-1 rounded flex items-center gap-1">{skill} <button onClick={() => removeSkill(skill)}><X size={12} /></button></span>
                    ))}
                    <input className="border rounded px-2 py-1" value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="Add skill" />
                    <button className="bg-primary text-primary-foreground px-2 py-1 rounded" onClick={addSkill}><Plus size={14} /></button>
                    <button className="ml-2 text-muted-foreground underline" onClick={() => handleSave('keySkills')}>Done</button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.keySkills.map(skill => (
                      <span key={skill} className="bg-primary/10 text-primary px-2 py-1 rounded">{skill}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Employment */}
              <div className="bg-card rounded-xl shadow p-4 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-foreground">Employment</h3>
                  <button className="text-primary" onClick={() => handleEdit('employment')}><Edit2 size={16} /></button>
                </div>
                {/* For demo, just show a placeholder */}
                <div className="text-muted-foreground italic">Your employment details will help recruiters understand your experience</div>
              </div>

              {/* Education */}
              <div className="bg-card rounded-xl shadow p-4 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-foreground">Education</h3>
                  <button className="text-primary" onClick={() => handleEdit('education')}><Edit2 size={16} /></button>
                </div>
                <ul className="space-y-1">
                  {profile.education.map((edu, idx) => (
                    <li key={idx} className="flex flex-col md:flex-row md:items-center md:gap-2">
                      <span className="font-medium text-foreground">{edu.degree}</span>
                      <span className="text-muted-foreground">{edu.school}</span>
                      <span className="text-muted-foreground">{edu.year}</span>
                      <span className="text-muted-foreground">{edu.type}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* IT Skills */}
              <div className="bg-card rounded-xl shadow p-4 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-foreground">IT Skills</h3>
                  <button className="text-primary" onClick={() => handleEdit('itSkills')}><Edit2 size={16} /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.itSkills.map(skill => (
                    <span key={skill} className="bg-primary/10 text-primary px-2 py-1 rounded">{skill}</span>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div className="bg-card rounded-xl shadow p-4 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-foreground">Projects</h3>
                  <button className="text-primary" onClick={() => handleEdit('projects')}><Edit2 size={16} /></button>
                </div>
                <ul className="space-y-2">
                  {profile.projects.map((proj, idx) => (
                    <li key={idx} className="flex flex-col md:flex-row md:items-center md:gap-2">
                      <span className="font-medium text-foreground">{proj.title}</span>
                      <span className="text-muted-foreground">{proj.org}</span>
                      <span className="text-muted-foreground">{proj.period}</span>
                      <span className="text-muted-foreground">{proj.desc}</span>
                      <button className="text-red-500 ml-2" onClick={() => removeProject(idx)}><Trash2 size={14} /></button>
                    </li>
                  ))}
                </ul>
                {editingSection === 'projects' && (
                  <div className="flex flex-col gap-2 mt-2">
                    <input className="border rounded px-2 py-1" placeholder="Title" value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} />
                    <input className="border rounded px-2 py-1" placeholder="Org" value={newProject.org} onChange={e => setNewProject({ ...newProject, org: e.target.value })} />
                    <input className="border rounded px-2 py-1" placeholder="Period" value={newProject.period} onChange={e => setNewProject({ ...newProject, period: e.target.value })} />
                    <input className="border rounded px-2 py-1" placeholder="Desc" value={newProject.desc} onChange={e => setNewProject({ ...newProject, desc: e.target.value })} />
                    <button className="bg-primary text-primary-foreground px-2 py-1 rounded" onClick={addProject}><Plus size={14} /> Add Project</button>
                  </div>
                )}
              </div>

              {/* Profile Summary */}
              <div className="bg-card rounded-xl shadow p-4 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-foreground">Profile Summary</h3>
                  <button className="text-primary" onClick={() => handleEdit('summary')}><Edit2 size={16} /></button>
                </div>
                {editingSection === 'summary' ? (
                  <div className="flex gap-2">
                    <textarea className="border rounded px-2 py-1 flex-1" name="summary" value={profile.summary} onChange={handleChange} />
                    <button className="bg-primary text-primary-foreground px-3 py-1 rounded" onClick={() => handleSave('summary')}>Save</button>
                  </div>
                ) : (
                  <div className="text-muted-foreground">{profile.summary || <span className="italic">Add a summary to introduce yourself to recruiters</span>}</div>
                )}
              </div>

              {/* Accomplishments */}
              <div className="bg-card rounded-xl shadow p-4 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-foreground">Accomplishments</h3>
                  <button className="text-primary" onClick={() => handleEdit('accomplishments')}><Edit2 size={16} /></button>
                </div>
                <div className="text-muted-foreground italic">Showcase your credentials by adding relevant certifications, work samples, online profiles, etc.</div>
              </div>

              {/* Career Profile */}
              <div className="bg-card rounded-xl shadow p-4 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-foreground">Career Profile</h3>
                  <button className="text-primary" onClick={() => handleEdit('careerProfile')}><Edit2 size={16} /></button>
                </div>
                {editingSection === 'careerProfile' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Industry</label>
                      <input className="border rounded px-2 py-1 w-full" name="industry" value={profile.careerProfile.industry} onChange={e => setProfile({...profile, careerProfile: {...profile.careerProfile, industry: e.target.value}})} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Department</label>
                      <input className="border rounded px-2 py-1 w-full" name="department" value={profile.careerProfile.department} onChange={e => setProfile({...profile, careerProfile: {...profile.careerProfile, department: e.target.value}})} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Role Category</label>
                      <input className="border rounded px-2 py-1 w-full" name="roleCategory" value={profile.careerProfile.roleCategory} onChange={e => setProfile({...profile, careerProfile: {...profile.careerProfile, roleCategory: e.target.value}})} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Job Role</label>
                      <input className="border rounded px-2 py-1 w-full" name="jobRole" value={profile.careerProfile.jobRole} onChange={e => setProfile({...profile, careerProfile: {...profile.careerProfile, jobRole: e.target.value}})} />
                    </div>
                    <button className="bg-primary text-primary-foreground px-3 py-1 rounded md:col-span-2" onClick={() => handleSave('careerProfile')}>Save</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {profile.careerProfile.department && (
                      <div>
                        <span className="text-xs text-muted-foreground block">Department</span>
                        <span>{profile.careerProfile.department}</span>
                      </div>
                    )}
                    {profile.careerProfile.roleCategory && (
                      <div>
                        <span className="text-xs text-muted-foreground block">Role Category</span>
                        <span>{profile.careerProfile.roleCategory}</span>
                      </div>
                    )}
                    {profile.careerProfile.jobRole && (
                      <div>
                        <span className="text-xs text-muted-foreground block">Job Role</span>
                        <span>{profile.careerProfile.jobRole}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Personal Details */}
              <div className="bg-card rounded-xl shadow p-4 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-foreground">Personal Details</h3>
                  <button className="text-primary" onClick={() => handleEdit('personal')}><Edit2 size={16} /></button>
                </div>
                {editingSection === 'personal' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Date of Birth</label>
                      <input className="border rounded px-2 py-1 w-full" name="dob" value={profile.personal.dob} onChange={e => setProfile({...profile, personal: {...profile.personal, dob: e.target.value}})} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Gender</label>
                      <input className="border rounded px-2 py-1 w-full" name="gender" value={profile.personal.gender} onChange={e => setProfile({...profile, personal: {...profile.personal, gender: e.target.value}})} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Marital Status</label>
                      <input className="border rounded px-2 py-1 w-full" name="marital" value={profile.personal.marital} onChange={e => setProfile({...profile, personal: {...profile.personal, marital: e.target.value}})} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Address</label>
                      <input className="border rounded px-2 py-1 w-full" name="address" value={profile.personal.address} onChange={e => setProfile({...profile, personal: {...profile.personal, address: e.target.value}})} />
                    </div>
                    <button className="bg-primary text-primary-foreground px-3 py-1 rounded md:col-span-2" onClick={() => handleSave('personal')}>Save</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {profile.personal.dob && (
                      <div>
                        <span className="text-xs text-muted-foreground block">Date of Birth</span>
                        <span>{profile.personal.dob}</span>
                      </div>
                    )}
                    {profile.personal.gender && (
                      <div>
                        <span className="text-xs text-muted-foreground block">Gender</span>
                        <span>{profile.personal.gender}</span>
                      </div>
                    )}
                    {profile.personal.marital && (
                      <div>
                        <span className="text-xs text-muted-foreground block">Marital Status</span>
                        <span>{profile.personal.marital}</span>
                      </div>
                    )}
                    {profile.personal.address && (
                      <div>
                        <span className="text-xs text-muted-foreground block">Address</span>
                        <span>{profile.personal.address}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Languages */}
              <div className="bg-card rounded-xl shadow p-4 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-foreground">Languages</h3>
                  <button className="text-primary" onClick={() => handleEdit('languages')}><Edit2 size={16} /></button>
                </div>
                {editingSection === 'languages' ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {profile.languages.map(lang => (
                        <span key={lang.name} className="bg-primary/10 text-primary px-2 py-1 rounded flex items-center gap-1">
                          {lang.name} ({lang.proficiency}) <button onClick={() => removeLang(lang.name)}><X size={12} /></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input className="border rounded px-2 py-1 flex-1" value={newLang} onChange={e => setNewLang(e.target.value)} placeholder="Add language" />
                      <button className="bg-primary text-primary-foreground px-2 py-1 rounded" onClick={addLang}><Plus size={14} /></button>
                      <button className="ml-2 text-muted-foreground underline" onClick={() => handleSave('languages')}>Done</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map(lang => (
                      <span key={lang.name} className="bg-primary/10 text-primary px-2 py-1 rounded">{lang.name} ({lang.proficiency})</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleResumeUpload} 
        accept=".pdf,.doc,.docx"
      />
    </>
  );
};

export default ProfilePage; 