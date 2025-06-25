import JobsFeed from '@/components/jobs/JobsFeed';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import jobsApi, { Job, JobFilters } from '@/services/jobsApi';
import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

interface UserProfile {
  skills: string[];
  location?: string;
  jobTitle?: string;
  experience?: string;
  interests?: string[];
}

interface JobRecommendationsProps {
  userProfile?: UserProfile;
}

export default function JobRecommendations({ userProfile }: JobRecommendationsProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<JobFilters>({});

  useEffect(() => {
    loadJobs();
  }, [userProfile]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      // Apply filters based on user profile if available
      const profileFilters: JobFilters = {};
      
      if (userProfile) {
        // If user has a job title, use it for search
        if (userProfile.jobTitle) {
          profileFilters.search = userProfile.jobTitle;
        }
        
        // If user has location, filter by it
        if (userProfile.location) {
          profileFilters.location = userProfile.location;
        }
        
        // If user has experience level, filter by it
        if (userProfile.experience) {
          profileFilters.experience_level = mapExperienceLevel(userProfile.experience);
        }
      }
      
      setFilters(profileFilters);
      
      // Get latest jobs with profile-based filters
      const response = await jobsApi.getLatestJobs(profileFilters);
      setJobs(response.jobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Map user experience to job experience levels
  const mapExperienceLevel = (experience: string): string => {
    const years = parseInt(experience);
    if (isNaN(years)) return '';
    
    if (years < 1) return 'Internship';
    if (years < 3) return 'Entry-level';
    if (years < 5) return 'Associate';
    if (years < 10) return 'Mid-Senior';
    return 'Director';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Job Recommendations</CardTitle>
            <CardDescription>
              Personalized job recommendations based on your profile
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadJobs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <JobsFeed 
          filters={filters} 
          onJobClick={(job) => console.log('Job clicked:', job)}
        />
      </CardContent>
    </Card>
  );
} 