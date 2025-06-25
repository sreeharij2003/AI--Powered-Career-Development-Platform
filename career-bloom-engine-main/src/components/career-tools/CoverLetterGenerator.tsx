import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, FileText } from "lucide-react";
import { useState } from "react";

const CoverLetterGenerator = () => {
  const [companyName, setCompanyName] = useState("");
  const [skills, setSkills] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [coverLetterText, setCoverLetterText] = useState("");

  // Generate cover letter using backend LLM
  const generateCoverLetter = async () => {
    if (companyName && skills) {
      setIsGenerating(true);
      setIsGenerated(false);
      setCoverLetterText("");
      try {
        const response = await fetch("http://localhost:5000/api/coverletter/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobDescription: {
              company: companyName,
              description: jobDescription
            },
            userProfile: {
              skills: skills.split(",").map(s => s.trim())
            }
          })
        });
        const data = await response.json();
        const closing = "Sincerely,\nYour Name";
        const closingParagraph = "My resume, which is attached for your review, provides further details on my qualifications and accomplishments. I am eager to discuss how my skills and experience can benefit " + companyName + ". Thank you for your time and consideration. I look forward to hearing from you soon.";
        const body = data.coverLetter || "No cover letter generated.";
        setCoverLetterText(`${body}\n\n${closingParagraph}\n\n${closing}`);
        setIsGenerated(true);
      } catch (error) {
        setCoverLetterText("Error generating cover letter. Please try again.");
        setIsGenerated(true);
      } finally {
        setIsGenerating(false);
      }
    }
  };
  
  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetterText);
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Cover Letter Generator</h2>
        <p className="text-muted-foreground">
          Generate a tailored cover letter using your fine-tuned LLM
        </p>
      </div>
      {!isGenerated ? (
        <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input 
                  id="company-name" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Acme Inc." 
                />
              </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Your Skills (comma separated)</Label>
              <Input
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g., Python, React, Leadership"
              />
            </div>
              <div className="space-y-2">
                <Label htmlFor="job-description">Job Description (Optional)</Label>
                <Textarea 
                  id="job-description" 
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="min-h-[100px]"
                />
            </div>
            <Button onClick={generateCoverLetter} disabled={isGenerating || !companyName || !skills}>
              {isGenerating ? "Generating..." : "Generate Cover Letter"}
            </Button>
          </div>
        </div>
      ) : (
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" /> Generated Cover Letter
              </h3>
              <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy to clipboard">
                <Copy className="h-5 w-5" />
              </Button>
            </div>
            <Textarea
              value={coverLetterText}
              readOnly
              className="min-h-[300px] bg-gray-50"
            />
            <Button className="mt-4" onClick={() => setIsGenerated(false)}>
              Generate Another
            </Button>
            </CardContent>
          </Card>
      )}
    </div>
  );
};

export default CoverLetterGenerator; 