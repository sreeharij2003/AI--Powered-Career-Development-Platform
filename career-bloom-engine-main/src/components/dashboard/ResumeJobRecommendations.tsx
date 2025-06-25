import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useClerkAuthContext } from '@/contexts/ClerkAuthContext';
import { API } from '@/services/api';
import jobRecommendationApi, { JobRecommendation } from '@/services/jobRecommendationApi';
import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import JobCard from '../jobs/JobCard';

export default function ResumeJobRecommendations() {
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useClerkAuthContext();

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First try to get the user's resume
      const resumeData = await API.resume.getResume();
      
      if (!resumeData) {
        setError('No resume found. Please upload a resume in your profile to get personalized job recommendations.');
        setLoading(false);
        return;
      }
      
      // Get the resume file
      const response = await fetch(resumeData.fileUrl);
      const blob = await response.blob();
      const file = new File([blob], resumeData.fileName, { type: response.headers.get('content-type') || 'application/pdf' });
      
      // Get recommendations based on the resume file
      const jobRecommendations = await jobRecommendationApi.getRecommendationsFromFile(file);
      
      // Ensure each job has a unique id
      const recommendationsWithIds = jobRecommendations.map((job, index) => ({
        ...job,
        id: job.id || `job-${index}`
      }));
      
      setRecommendations(recommendationsWithIds);
    } catch (error) {
      console.error('Error loading job recommendations:', error);
      setError('Failed to load job recommendations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Resume-Based Job Recommendations</CardTitle>
            <CardDescription>
              Personalized job recommendations based on your resume
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadRecommendations} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-muted-foreground">
            {error}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No job recommendations found. Try refreshing or updating your resume with more skills and experience.
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((job) => (
              <JobCard
                key={job.id || `job-${Math.random()}`}
                job={{
                  _id: job.id,
                  title: job.title || "Job Title",
                  company: job.company || "Company",
                  location: job.location || "Location",
                  description: job.description || "No description available",
                  salary: job.salary,
                  url: job.url,
                  skills: job.skills || [],
                  posted_date: new Date(job.posted_date || new Date()),
                  type: job.type || "Full-time",
                  remote: job.remote,
                  source: 'recommendation',
                  matchScore: job.match_score
                }}
                onJobClick={() => {}}
                showMatchScore={true}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 