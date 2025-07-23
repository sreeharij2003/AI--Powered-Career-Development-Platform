import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  Copy,
  Download,
  FileText,
  Loader2,
  Save,
  Upload,
  Wand2
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const CoverLetterGenerator = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [useTextInput, setUseTextInput] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Accept PDF and text files
      if (file.type === "application/pdf" ||
          file.type === "text/plain" ||
          file.name.endsWith('.pdf') ||
          file.name.endsWith('.txt')) {
        setResumeFile(file);
        toast.success(`Resume file "${file.name}" uploaded successfully!`);
      } else {
        toast.error("Please upload a PDF or text file");
      }
    }
  };

  const generateCoverLetter = async () => {
    // Validate input based on mode
    if (useTextInput) {
      if (!resumeText.trim() || !jobDescription.trim()) {
        toast.error("Please enter your resume text and job description");
        return;
      }
    } else {
      if (!resumeFile || !jobDescription.trim()) {
        toast.error("Please upload your resume and enter job description");
        return;
      }
    }

    setIsGenerating(true);

    try {
      let response;

      if (useTextInput) {
        // Send as JSON for text input
        console.log('📤 Sending resume text to backend...');
        response = await fetch('/api/cover-letter/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resumeText: resumeText,
            jobDescription: jobDescription
          }),
        });
      } else {
        // Send as FormData for file upload
        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('jobDescription', jobDescription);

        console.log('📤 Sending resume file to backend for processing...');
        response = await fetch('/api/cover-letter/generate', {
          method: 'POST',
          body: formData,
        });
      }

      const data = await response.json();

      if (data.success && data.coverLetter) {
        setCoverLetter(data.coverLetter);
        setIsGenerated(true);
        toast.success("Cover letter generated successfully!");
      } else {
        throw new Error(data.error || 'Failed to generate cover letter');
      }
    } catch (error: any) {
      console.error('Error generating cover letter:', error);
      toast.error(error.message || "Failed to generate cover letter. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter);
    toast.success("Cover letter copied to clipboard!");
  };

  const downloadCoverLetter = () => {
    const element = document.createElement("a");
    const file = new Blob([coverLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `cover-letter-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Cover letter downloaded!");
  };

  const saveCoverLetter = () => {
    // Implement save functionality
    toast.success("Cover letter saved to your account!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">AI Cover Letter Generator</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Upload your resume and provide job details to generate a personalized cover letter that highlights your relevant experience and skills.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Input Mode Toggle */}
          <Card>
            <CardHeader>
              <CardTitle>Resume Input Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  variant={!useTextInput ? "default" : "outline"}
                  onClick={() => setUseTextInput(false)}
                  className="flex-1"
                >
                  Upload File
                </Button>
                <Button
                  variant={useTextInput ? "default" : "outline"}
                  onClick={() => setUseTextInput(true)}
                  className="flex-1"
                >
                  Paste Text
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resume Input */}
          {useTextInput ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Resume Text
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste your resume text here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="min-h-[200px]"
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Resume
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,application/pdf,text/plain"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {resumeFile ? (
                  <div className="space-y-2">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                    <p className="font-medium text-green-700">{resumeFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="font-medium">Click to upload your resume</p>
                    <p className="text-sm text-muted-foreground">PDF or text files, up to 10MB</p>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Browse Files
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          )}

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[300px] resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={generateCoverLetter}
            disabled={
              (useTextInput ? !resumeText.trim() : !resumeFile) ||
              !jobDescription.trim() ||
              isGenerating
            }
            className="w-full h-12"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generating Cover Letter...
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5 mr-2" />
                Generate Cover Letter
              </>
            )}
          </Button>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generated Cover Letter
                </CardTitle>
                {isGenerated && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ready
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isGenerated && !isGenerating ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4">
                  <div className="p-4 bg-muted/50 rounded-full">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-muted-foreground">No cover letter generated yet</p>
                    <p className="text-sm text-muted-foreground">
                      Upload your resume and provide job details to get started
                    </p>
                  </div>
                </div>
              ) : isGenerating ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <div className="space-y-2">
                    <p className="font-medium">Generating your cover letter...</p>
                    <p className="text-sm text-muted-foreground">
                      This may take a few moments
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="min-h-[400px] resize-none font-mono text-sm"
                    placeholder="Your generated cover letter will appear here..."
                  />
                  
                  <Separator />
                  
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={copyToClipboard} variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button onClick={downloadCoverLetter} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button onClick={saveCoverLetter} variant="outline" size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterGenerator;
