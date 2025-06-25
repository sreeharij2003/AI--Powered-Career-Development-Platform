import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Job } from "@/services/jobsApi";
import { BookmarkIcon, Building2Icon, MapPinIcon } from "lucide-react";
import { useState } from "react";

interface JobCardProps {
  job: Job & { matchScore?: number };
  onJobClick: (job: Job) => void;
  showMatchScore?: boolean;
}

export default function JobCard({ job, onJobClick, showMatchScore = false }: JobCardProps) {
  const [saved, setSaved] = useState(false);
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    } else {
      return `${Math.floor(diffDays / 30)} months ago`;
    }
  };
  
  const truncateDescription = (description: string | undefined, maxLength: number = 150) => {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  return (
    <Card className="overflow-hidden hover:border-primary/50 transition-all">
      <CardContent className="p-0">
        <div className="p-4 cursor-pointer" onClick={() => onJobClick(job)}>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg">{job.title}</h3>
              <div className="flex items-center text-muted-foreground text-sm mt-1">
                <Building2Icon className="h-4 w-4 mr-1" />
                <span>{job.company}</span>
              </div>
              <div className="flex items-center text-muted-foreground text-sm mt-1">
                <MapPinIcon className="h-4 w-4 mr-1" />
                <span>{job.location}</span>
                {job.remote && <Badge variant="outline" className="ml-2">Remote</Badge>}
              </div>
            </div>
            
            {showMatchScore && job.matchScore !== undefined && (
              <div className="text-right">
                <div className="text-sm font-medium">
                  Match Score: {Math.round(job.matchScore)}%
                </div>
                <Progress value={job.matchScore} className="h-2 w-20 mt-1" />
              </div>
            )}
          </div>
          
          {job.skills && job.skills.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-1">
                {job.skills.slice(0, 5).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {job.skills.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{job.skills.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <p className="mt-3 text-sm text-muted-foreground">
            {truncateDescription(job.description)}
          </p>
          
          <div className="mt-4 flex justify-between items-center">
            {job.salary && <span className="text-sm font-medium">{job.salary}</span>}
            <span className="text-xs text-muted-foreground">
              Posted {formatDate(job.posted_date)}
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-3 bg-muted/30 flex justify-between">
        <Button variant="default" size="sm" onClick={() => onJobClick(job)}>
          View Details
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={(e) => {
            e.stopPropagation();
            setSaved(!saved);
          }}
        >
          <BookmarkIcon className={`h-5 w-5 ${saved ? 'fill-primary text-primary' : ''}`} />
        </Button>
      </CardFooter>
    </Card>
  );
} 