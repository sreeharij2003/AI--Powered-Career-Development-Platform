import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { API } from "@/services/api";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, Route, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CareerStep {
  year: number;
  title: string;
  description: string;
  skills: string[];
  resources?: { name: string; url: string; }[];
}

interface CareerPathResponse {
  _id?: string;
  title: string;
  query: string;
  steps: CareerStep[];
  missingSkills: string[];
  learningModules: { name: string; url: string; type: string; }[];
  createdAt?: string;
  error?: string;
}

const CareerPathPredictor = () => {
  const [query, setQuery] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [currentSkillsInput, setCurrentSkillsInput] = useState("");
  const [roadmapData, setRoadmapData] = useState<CareerPathResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const generateMutation = useMutation({
    mutationFn: async ({ skills, role }: { skills: string[]; role: string }): Promise<CareerPathResponse> => {
      try {
        const response = await API.career.predictAndPlan(skills, role);
        if (response.error) {
          throw new Error(response.error);
        }
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate career plan';
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data) => {
      setRoadmapData(data);
      setError(null);
      toast.success("Career plan generated successfully!");
    },
    onError: (error: Error) => {
      setError(error.message);
      toast.error("Failed to generate career plan: " + error.message);
      console.error("Career plan generation error:", error);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const skillsArray = currentSkillsInput.split(',').map(skill => skill.trim()).filter(skill => skill !== '');
    
    if (!targetRole.trim()) {
      setError("Please enter your target role");
      toast.error("Please enter your target role");
      return;
    }

    if (skillsArray.length === 0) {
      setError("Please enter at least one current skill");
      toast.error("Please enter at least one current skill");
      return;
    }
    
    if (!localStorage.getItem('token')) {
      setError("Please log in to generate a career plan");
      toast.error("Please log in to generate a career plan");
      return;
    }
    
    try {
      generateMutation.mutate({ skills: skillsArray, role: targetRole });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error("Error triggering career plan generation:", error);
    }
  };

  const renderError = () => {
    if (!error) return null;
    return (
      <div className="p-4 mb-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <p>{error}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderError()}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="target-role">Target Job Role</Label>
          <Input
            id="target-role"
            placeholder="e.g., Senior Frontend Developer"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="current-skills">Your Current Skills (comma-separated)</Label>
          <Textarea
            id="current-skills"
            placeholder="e.g., JavaScript, React, CSS, HTML, Git"
            value={currentSkillsInput}
            onChange={(e) => setCurrentSkillsInput(e.target.value)}
            rows={3}
          />
        </div>
        <Button 
          type="submit" 
          disabled={generateMutation.isPending || !targetRole.trim() || !currentSkillsInput.trim()}
          className="w-full"
        >
          {generateMutation.isPending ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
              Generating Plan...
            </>
          ) : (
            <>
              <Sparkles className="mr-2" />
              Generate Career Plan
            </>
          )}
        </Button>
      </form>

      {generateMutation.isPending && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}

      {roadmapData && !error && (
        <div className="mt-6 space-y-6">
          <h3 className="text-xl font-bold">{roadmapData.title || "Career Plan"}</h3>
          
          {roadmapData.missingSkills && roadmapData.missingSkills.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-lg font-semibold">Missing Skills for {targetRole}</h4>
              <div className="flex flex-wrap gap-2">
                {roadmapData.missingSkills.map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-red-500/20 text-red-700 text-xs rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {roadmapData.steps && roadmapData.steps.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Your Roadmap</h4>
              <div className="relative pl-8">
                {roadmapData.steps.map((step, index) => (
                  <div key={index} className="mb-8 relative">
                    <div className="absolute left-0 -translate-x-[21px] w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="absolute left-0 -translate-x-[17px] top-10 h-full w-[2px] bg-border">
                      {index !== roadmapData.steps.length - 1 && <div className="h-full"></div>}
                    </div>
                    <div className="pl-4 pb-2">
                      <h5 className="text-md font-semibold">{step.title} ({step.year})</h5>
                      <p className="text-muted-foreground mt-1 text-sm">{step.description}</p>
                      {step.skills && step.skills.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-sm font-medium">Skills to Acquire/Focus:</p>
                          <div className="flex flex-wrap gap-2">
                            {step.skills.map((skill, skillIndex) => (
                              <span 
                                key={skillIndex}
                                className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {step.resources && step.resources.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-sm font-medium">Resources:</p>
                          <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {step.resources.map((resource, resIndex) => (
                              <li key={resIndex}>
                                <a 
                                  href={resource.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-primary hover:underline"
                                >
                                  {resource.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {roadmapData.learningModules && roadmapData.learningModules.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-lg font-semibold">Suggested Learning Modules</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {roadmapData.learningModules.map((module, index) => (
                  <li key={index}>
                    <a 
                      href={module.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary hover:underline"
                    >
                      {module.name} ({module.type})
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!roadmapData && !error && !generateMutation.isPending && (
        <div className="p-6 bg-muted/50 rounded-lg text-center">
          <Route className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Generate Your Career Plan</h3>
          <p className="text-muted-foreground">Enter your current skills and target role above to get a personalized career roadmap and identify missing skills.</p>
        </div>
      )}
    </div>
  );
};

export default CareerPathPredictor;
