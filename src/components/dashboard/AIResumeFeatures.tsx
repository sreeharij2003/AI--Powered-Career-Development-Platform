import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ResumeService } from "@/services/resumeService";
import {
    Loader2,
    RefreshCw,
    Sparkles
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface GenerateSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (summary: string) => void;
}

export const GenerateSummaryDialog = ({ open, onOpenChange, onGenerate }: GenerateSummaryDialogProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: "",
    experience: "Entry Level",
    skills: ""
  });

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      
      if (!formData.jobTitle || !formData.skills) {
        toast.error("Please provide both job title and skills");
        return;
      }
      
      const skills = formData.skills.split(",").map(skill => skill.trim()).filter(skill => skill !== "");
      
      if (skills.length === 0) {
        toast.error("Please provide at least one skill");
        return;
      }
      
      const summary = await ResumeService.generateSummary({
        jobTitle: formData.jobTitle,
        experience: formData.experience,
        skills
      });
      
      onGenerate(summary);
      onOpenChange(false);
      toast.success("Professional summary generated successfully!");
    } catch (error) {
      toast.error("Failed to generate summary. Please try again.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Professional Summary</DialogTitle>
          <DialogDescription>
            Provide details about your job and skills to generate a personalized summary
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="job-title">Job Title/Role</Label>
            <Input
              id="job-title"
              placeholder="Software Engineer, Project Manager, etc."
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="experience-level">Experience Level</Label>
            <select
              id="experience-level"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            >
              <option value="Entry Level">Entry Level (0-2 years)</option>
              <option value="Mid Level">Mid Level (3-5 years)</option>
              <option value="Senior">Senior (6-9 years)</option>
              <option value="Expert">Expert (10+ years)</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="skills">Key Skills (comma separated)</Label>
            <Textarea
              id="skills"
              placeholder="JavaScript, React, Node.js, Project Management, etc."
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Summary
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface GenerateBulletPointsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (bulletPoints: string[]) => void;
  initialRole?: string;
}

export const GenerateBulletPointsDialog = ({ open, onOpenChange, onGenerate, initialRole }: GenerateBulletPointsDialogProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    role: initialRole || "",
    jobType: "Job",
    responsibilities: ""
  });

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      
      if (!formData.role || !formData.responsibilities) {
        toast.error("Please provide both role and responsibilities");
        return;
      }
      
      const bulletPoints = await ResumeService.generateBulletPoints({
        role: formData.role,
        jobType: formData.jobType,
        responsibilities: formData.responsibilities
      });
      
      onGenerate(bulletPoints);
      onOpenChange(false);
      toast.success("Bullet points generated successfully!");
    } catch (error) {
      toast.error("Failed to generate bullet points. Please try again.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Bullet Points</DialogTitle>
          <DialogDescription>
            Provide details about your role and responsibilities to generate achievement-oriented bullet points
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role-title">Position/Role Title</Label>
            <Input
              id="role-title"
              placeholder="Frontend Developer, Project Lead, etc."
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="job-type">Type</Label>
            <select
              id="job-type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
              value={formData.jobType}
              onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
            >
              <option value="Job">Job</option>
              <option value="Project">Project</option>
              <option value="Volunteering">Volunteering</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="responsibilities">
              Description of Responsibilities/Project Details
            </Label>
            <Textarea
              id="responsibilities"
              placeholder="Describe what you did, technologies used, team size, etc."
              value={formData.responsibilities}
              onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
              rows={4}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Bullets
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface ImproveTextButtonProps {
  text: string;
  context: string;
  onImprove: (improvedText: string) => void;
  className?: string;
}

export const ImproveTextButton = ({ text, context, onImprove, className }: ImproveTextButtonProps) => {
  const [isImproving, setIsImproving] = useState(false);

  const handleImprove = async () => {
    try {
      setIsImproving(true);
      
      if (!text.trim()) {
        toast.error("No text to improve");
        return;
      }
      
      const improvedText = await ResumeService.improveText({ text, context });
      onImprove(improvedText);
      toast.success("Text improved successfully!");
    } catch (error) {
      toast.error("Failed to improve text. Please try again.");
      console.error(error);
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleImprove}
      disabled={isImproving || !text.trim()}
      className={className}
    >
      {isImproving ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
          Improving...
        </>
      ) : (
        <>
          <RefreshCw className="h-3 w-3 mr-1" />
          Improve with AI
        </>
      )}
    </Button>
  );
};

interface GenerateContentButtonProps {
  onClick: () => void;
  className?: string;
}

export const GenerateContentButton = ({ onClick, className }: GenerateContentButtonProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={className}
    >
      <Sparkles className="h-3 w-3 mr-1" />
      Generate with AI
    </Button>
  );
};