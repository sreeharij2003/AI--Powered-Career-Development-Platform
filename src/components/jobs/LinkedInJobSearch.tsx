import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Job } from '@/services/jobsApi';
import linkedinApiService from '@/services/linkedinApiService';
import { Loader2, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import JobCard from './JobCard';

interface UserProfile {
  skills?: string[];
  location?: string;
  jobTitle?: string;
}

interface LinkedInJobSearchProps {
  userProfile?: UserProfile;
  apiKey?: string;
  onJobClick?: (job: Job) => void;
}

export default function LinkedInJobSearch({ userProfile, apiKey, onJobClick }: LinkedInJobSearchProps) {
  const [keyword, setKeyword] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalJobs, setTotalJobs] = useState<number>(0);
  const { toast } = useToast();
  
  // Set API key if provided
  useEffect(() => {
    if (apiKey) {
      linkedinApiService.setApiKey(apiKey);
    }
  }, [apiKey]);
  
  // Set default values from user profile if available
  useEffect(() => {
    if (userProfile) {
      if (userProfile.jobTitle) {
        setKeyword(userProfile.jobTitle);
      } else if (userProfile.skills && userProfile.skills.length > 0) {
        setKeyword(userProfile.skills[0]);
      }
      
      if (userProfile.location) {
        setLocation(userProfile.location);
      }
    }
  }, [userProfile]);
  
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!keyword) {
      toast({
        title: "Missing information",
        description: "Please enter a job keyword or title",
        variant: "destructive"
      });
      return;
    }
    
    if (!linkedinApiService.getApiKey()) {
      toast({
        title: "API Key Required",
        description: "Please provide a RapidAPI LinkedIn Data API key",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    setPage(1);
    setJobs([]);
    
    try {
      const response = await linkedinApiService.searchJobs(keyword, location, 1, 10);
      
      const formattedJobs = response.jobs.map(job => 
        linkedinApiService.convertToAppJobFormat(job)
      );
      
      setJobs(formattedJobs);
      setTotalJobs(response.total);
      setHasMore(formattedJobs.length < response.total);
      
      toast({
        title: "Jobs found",
        description: `Found ${response.total} jobs matching "${keyword}"`,
      });
    } catch (error: any) {
      console.error('Error searching LinkedIn jobs:', error);
      toast({
        title: "Error searching jobs",
        description: error.message || "Failed to search jobs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const loadMore = async () => {
    if (loading || !hasMore) return;
    
    const nextPage = page + 1;
    setLoading(true);
    
    try {
      const response = await linkedinApiService.searchJobs(keyword, location, nextPage, 10);
      
      const formattedJobs = response.jobs.map(job => 
        linkedinApiService.convertToAppJobFormat(job)
      );
      
      setJobs(prev => [...prev, ...formattedJobs]);
      setPage(nextPage);
      setHasMore(jobs.length + formattedJobs.length < response.total);
    } catch (error) {
      console.error('Error loading more jobs:', error);
      toast({
        title: "Error loading more jobs",
        description: "Failed to load additional jobs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleJobClick = (job: Job) => {
    if (onJobClick) {
      onJobClick(job);
    }
  };
  
  // Generate recommended keywords based on user skills
  const getRecommendedKeywords = (): string[] => {
    if (!userProfile?.skills || userProfile.skills.length === 0) {
      return ['Software Developer', 'Data Analyst', 'Project Manager'];
    }
    
    // Return top 3 skills as recommended keywords
    return userProfile.skills.slice(0, 3);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>LinkedIn Job Search</CardTitle>
          <CardDescription>
            Search for real-time job listings from LinkedIn
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="keyword">Job Title or Keyword</Label>
              <Input
                id="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. React Developer"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. New York, Remote"
                disabled={loading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search Jobs
                </>
              )}
            </Button>
          </form>
          
          {userProfile?.skills && userProfile.skills.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Recommended searches based on your skills:</p>
              <div className="flex flex-wrap gap-2">
                {getRecommendedKeywords().map((skill, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setKeyword(skill);
                      handleSearch();
                    }}
                    disabled={loading}
                  >
                    {skill}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Powered by LinkedIn Data API
          </p>
        </CardFooter>
      </Card>
      
      {jobs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Search Results ({totalJobs})</h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <JobCard 
                key={job._id} 
                job={job} 
                onJobClick={handleJobClick}
              />
            ))}
          </div>
          
          {hasMore && (
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={loadMore} 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Jobs'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
      
      {!loading && jobs.length === 0 && keyword && (
        <div className="text-center p-4">
          <p className="text-muted-foreground">No jobs found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
} 