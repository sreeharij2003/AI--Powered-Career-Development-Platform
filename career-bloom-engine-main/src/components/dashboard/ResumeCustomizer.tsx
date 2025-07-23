import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
    AlertCircle,
    Brain,
    CheckCircle,
    Download,
    FileText,
    Loader2,
    Sparkles,
    Target,
    Upload,
    Zap
} from "lucide-react";
import React, { useState } from 'react';
import { toast } from "sonner";

interface CustomizationResult {
  success: boolean;
  data?: {
    originalResume: string;
    customizedResume: string;
    newSummary: string;
    addedSkills: string[];
  };
  error?: string;
}

const ResumeCustomizer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedResumeText, setPastedResumeText] = useState('');
  const [inputMethod, setInputMethod] = useState<'upload' | 'paste'>('upload');
  const [jobDescription, setJobDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [customizationResult, setCustomizationResult] = useState<CustomizationResult | null>(null);


  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF, DOC, or DOCX file');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      toast.success('Resume uploaded successfully!');
    }
  };

  const simulateProgress = (steps: string[]) => {
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProcessingStep(steps[currentStep]);
        setProgress((currentStep + 1) * (100 / steps.length));
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 1500);
    return interval;
  };

  const handleCustomizeResume = async () => {
    // Validate input based on selected method
    if (inputMethod === 'upload' && !selectedFile) {
      toast.error('Please upload a resume file');
      return;
    }

    if (inputMethod === 'paste' && !pastedResumeText.trim()) {
      toast.error('Please paste your resume text');
      return;
    }

    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setCustomizationResult(null);

    const steps = [
      'Extracting text from resume...',
      'Analyzing job requirements with Chain-of-Thought...',
      'Creating customization strategy with ReAct prompting...',
      'Generating optimized content with Few-Shot prompting...',
      'Finalizing customized resume...'
    ];

    const progressInterval = simulateProgress(steps);

    try {
      let response;

      if (inputMethod === 'upload') {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append('resume', selectedFile!);
        formData.append('jobDescription', jobDescription);

        response = await fetch('/api/resume-customization/customize', {
          method: 'POST',
          body: formData,
        });
      } else {
        // Use JSON for pasted text
        response = await fetch('/api/resume-customization/customize-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resumeText: pastedResumeText,
            jobDescription: jobDescription,
          }),
        });
      }

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        throw new Error('Server returned invalid response. Please try again.');
      }

      clearInterval(progressInterval);
      setProgress(100);
      setProcessingStep('Customization complete!');

      if (response.ok && result.success) {
        setCustomizationResult(result);
        toast.success('Resume customized successfully!');
      } else {
        throw new Error(result.error || `Server error: ${response.status} ${response.statusText}`);
      }

    } catch (error: any) {
      clearInterval(progressInterval);
      console.error('Error customizing resume:', error);
      toast.error(error.message || 'Failed to customize resume');
      setCustomizationResult({
        success: false,
        error: error.message || 'Failed to customize resume'
      });
    } finally {
      setIsProcessing(false);
    }
  };



  const resetForm = () => {
    setSelectedFile(null);
    setPastedResumeText('');
    setJobDescription('');
    setCustomizationResult(null);
    setProgress(0);
    setProcessingStep('');
    setInputMethod('upload');
    const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-blue-500" />
          AI Resume Customizer
        </h2>
        <p className="text-muted-foreground">
          Paste your resume text and job description to get an AI-customized summary and relevant skills added for the specific role.
        </p>
      </div>

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload & Customize
            </CardTitle>
            <CardDescription>
              Provide your resume text and target job description for AI customization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Input Method Toggle */}
            <div className="space-y-3">
              <Label>Resume Input Method</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={inputMethod === 'upload' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setInputMethod('upload');
                    setPastedResumeText('');
                  }}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload File
                </Button>
                <Button
                  type="button"
                  variant={inputMethod === 'paste' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setInputMethod('paste');
                    setSelectedFile(null);
                  }}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Paste Text
                </Button>
              </div>
            </div>

            {/* File Upload Section */}
            {inputMethod === 'upload' && (
              <div className="space-y-2">
                <Label htmlFor="resume-upload">Resume File</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {selectedFile ? selectedFile.name : 'Click to upload PDF, DOC, or DOCX'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Max size: 10MB</p>
                  </label>
                </div>
                {selectedFile && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    File uploaded: {selectedFile.name}
                  </div>
                )}
              </div>
            )}

            {/* Paste Text Section */}
            {inputMethod === 'paste' && (
              <div className="space-y-2">
                <Label htmlFor="resume-text">Resume Text</Label>
                <Textarea
                  id="resume-text"
                  placeholder="Paste your complete resume text here. Include all sections: contact info, summary, experience, education, skills, etc..."
                  value={pastedResumeText}
                  onChange={(e) => setPastedResumeText(e.target.value)}
                  rows={12}
                  className="resize-none font-mono text-sm"
                />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{pastedResumeText.length} characters</span>
                  {pastedResumeText.length > 0 && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      Resume text added
                    </div>
                  )}
                </div>
              </div>
            )}



            {/* Job Description */}
            <div className="space-y-2">
              <Label htmlFor="job-description">Job Description</Label>
              <Textarea
                id="job-description"
                placeholder="Paste the complete job description here. Include requirements, responsibilities, and preferred qualifications for best results..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                {jobDescription.length} characters • More detailed descriptions yield better results
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleCustomizeResume}
                disabled={
                  isProcessing ||
                  !jobDescription.trim() ||
                  (inputMethod === 'upload' && !selectedFile) ||
                  (inputMethod === 'paste' && !pastedResumeText.trim())
                }
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Customizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Customize Resume
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Customization Results
            </CardTitle>
            <CardDescription>
              AI-powered analysis and optimized resume content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Processing Status */}
            {isProcessing && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">{processingStep}</span>
                </div>
                <Progress value={progress} className="w-full" />
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <Badge variant={progress >= 20 ? "default" : "secondary"} className="text-center">
                    <Brain className="h-3 w-3 mr-1" />
                    CoT Analysis
                  </Badge>
                  <Badge variant={progress >= 60 ? "default" : "secondary"} className="text-center">
                    <Zap className="h-3 w-3 mr-1" />
                    ReAct Planning
                  </Badge>
                  <Badge variant={progress >= 80 ? "default" : "secondary"} className="text-center">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Few-Shot Gen
                  </Badge>
                </div>
              </div>
            )}

            {/* Success Results */}
            {customizationResult?.success && customizationResult.data && (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Resume successfully customized! Summary replaced with job-specific content and missing skills added to existing skills section.
                  </AlertDescription>
                </Alert>

                {/* New Summary */}
                {customizationResult.data.newSummary && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">🔄 Replaced Professional Summary</h4>
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-md text-sm">
                      <p className="text-blue-800">{customizationResult.data.newSummary}</p>
                    </div>
                  </div>
                )}

                {/* Added Skills */}
                {customizationResult.data.addedSkills && customizationResult.data.addedSkills.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">➕ Skills Added to Existing Section</h4>
                    <div className="flex flex-wrap gap-2">
                      {customizationResult.data.addedSkills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customized Resume Text */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Customized Resume</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(customizationResult.data.customizedResume);
                        toast.success('Resume copied to clipboard!');
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Copy Text
                    </Button>
                  </div>
                  <Textarea
                    value={customizationResult.data.customizedResume}
                    readOnly
                    rows={20}
                    className="text-sm bg-white border-2 font-normal leading-relaxed text-gray-900"
                    style={{
                      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#1f2937'
                    }}
                  />
                  <p className="text-xs text-gray-500">
                    {customizationResult.data.customizedResume.length} characters • Copy and paste this text to use your customized resume
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {customizationResult?.success === false && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {customizationResult.error || 'Failed to customize resume. Please try again.'}
                </AlertDescription>
              </Alert>
            )}

            {/* Empty State */}
            {!customizationResult && !isProcessing && (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Upload your resume and job description to get started</p>
                <p className="text-sm mt-1">AI will analyze and optimize your resume for the specific role</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Advanced AI Prompting Strategies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <h4 className="font-semibold text-sm">Chain-of-Thought Analysis</h4>
                <p className="text-xs text-muted-foreground">Step-by-step job requirement analysis for precise understanding</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <h4 className="font-semibold text-sm">ReAct Strategic Planning</h4>
                <p className="text-xs text-muted-foreground">Reasoning + Acting methodology for optimal customization strategy</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-purple-500 mt-1" />
              <div>
                <h4 className="font-semibold text-sm">Few-Shot Content Generation</h4>
                <p className="text-xs text-muted-foreground">Example-based learning for high-quality content optimization</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeCustomizer;
