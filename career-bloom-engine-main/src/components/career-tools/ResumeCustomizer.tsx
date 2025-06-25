import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CopyIcon, FileTextIcon, Upload } from "lucide-react";
import { useState } from "react";

const ResumeCustomizer = () => {
  const [jobPost, setJobPost] = useState("");
  const [resume, setResume] = useState("");
  const [customizedResume, setCustomizedResume] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeResumeInputTab, setActiveResumeInputTab] = useState("paste");

  const handleCustomize = async () => {
    setIsLoading(true);
    setCustomizedResume("");
    try {
      const response = await fetch("http://localhost:5000/api/resume/customize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobPost, resume }),
      });
      const data = await response.json();
      setCustomizedResume(data.customizedResume || "No customized resume generated.");
    } catch (error) {
      setCustomizedResume("Error customizing resume. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customizedResume);
  };

  const handleDownload = () => {
    const blob = new Blob([customizedResume], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customized_resume.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = event.target?.result as string;
        setResume(fileContent);
        setIsLoading(false);
      };
      reader.readAsText(file);
      setIsLoading(true);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Company-Specific Resume Customizer</h2>
      <p className="text-muted-foreground">
        Paste a real job post and your resume. Get a tailored resume with matched skills, keywords, and a rewritten summary.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
           <div>
            <Label htmlFor="job-post">Job Post (Paste full description)</Label>
            <Textarea
              id="job-post"
              value={jobPost}
              onChange={e => setJobPost(e.target.value)}
              placeholder="Paste the job post here..."
              className="min-h-[200px]"
            />
          </div>
        </div>
        <div className="space-y-4">
          <Label htmlFor="user-resume">Your Resume</Label>
          <Tabs value={activeResumeInputTab} onValueChange={setActiveResumeInputTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Resume</TabsTrigger>
              <TabsTrigger value="paste">Paste Resume</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="space-y-4 pt-4">
              <Card className="border-dashed border-2 py-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                <Input
                  type="file"
                  id="resume-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt"
                />
                <Label htmlFor="resume-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <p className="font-medium">Click to upload your resume</p>
                    <p className="text-xs text-muted-foreground">
                      Supports PDF, DOC, DOCX, TXT files
                    </p>
                  </div>
                </Label>
              </Card>
            </TabsContent>
            <TabsContent value="paste" className="space-y-4 pt-4">
              <Textarea
                id="user-resume"
                value={resume}
                onChange={e => setResume(e.target.value)}
                placeholder="Paste your resume here..."
                className="min-h-[200px]"
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Button onClick={handleCustomize} disabled={isLoading || !jobPost || !resume}>
        {isLoading ? "Customizing..." : "Customize Resume"}
      </Button>
      {customizedResume && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileTextIcon className="h-5 w-5" /> Customized Resume
              </h3>
              <div className="flex gap-2">
                <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Resume Preview</DialogTitle>
                    </DialogHeader>
                    <div className="whitespace-pre-wrap p-4 border rounded-md bg-gray-50 min-h-[300px]">
                      {customizedResume}
                    </div>
                    <Button onClick={() => setIsPreviewOpen(false)}>Close</Button>
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy to clipboard">
                  <CopyIcon className="h-5 w-5" />
                </Button>
                 <Button variant="outline" size="sm" onClick={handleDownload} title="Download">
                   Download
                 </Button>
              </div>
            </div>
             <Textarea
              value={customizedResume}
              readOnly
              className="min-h-[300px] bg-gray-50 text-black"
            />
            <Button className="mt-4" onClick={() => setCustomizedResume("")}>
              Customize Another
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResumeCustomizer; 