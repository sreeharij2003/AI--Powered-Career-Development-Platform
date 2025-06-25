import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import jobsApi, { ScrapeResponse } from '@/services/jobsApi';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface UserProfile {
  skills: string[];
  location?: string;
  jobTitle?: string;
}

interface LinkedInJobScraperProps {
  userProfile?: UserProfile;
  onJobsScraped?: () => void;
}

export default function LinkedInJobScraper({ userProfile, onJobsScraped }: LinkedInJobScraperProps) {
  const [keyword, setKeyword] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [limit, setLimit] = useState<number>(25);
  const [loading, setLoading] = useState<boolean>(false);
  const [dependenciesChecked, setDependenciesChecked] = useState<boolean>(false);
  const [dependenciesInstalled, setDependenciesInstalled] = useState<boolean>(false);
  const [result, setResult] = useState<ScrapeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if scraper dependencies are installed on component mount
  useEffect(() => {
    checkDependencies();
  }, []);

  // Set default values from user profile if available
  useEffect(() => {
    if (userProfile) {
      // Use the job title from user profile or first skill as default keyword
      if (userProfile.jobTitle) {
        setKeyword(userProfile.jobTitle);
      } else if (userProfile.skills && userProfile.skills.length > 0) {
        setKeyword(userProfile.skills[0]);
      }

      // Use location from user profile if available
      if (userProfile.location) {
        setLocation(userProfile.location);
      }
    }
  }, [userProfile]);

  const checkDependencies = async () => {
    try {
      const response = await jobsApi.checkScraperDependencies();
      setDependenciesChecked(true);
      setDependenciesInstalled(response.dependenciesInstalled);
      
      if (!response.dependenciesInstalled) {
        setError('LinkedIn scraper dependencies are not properly installed. Basic scraping will be used instead.');
      }
    } catch (error) {
      console.error('Error checking dependencies:', error);
      setDependenciesChecked(true);
      setDependenciesInstalled(false);
      setError('Failed to check scraper dependencies. Basic scraping will be used instead.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyword || !location) {
      toast({
        title: "Missing information",
        description: "Please provide both job keyword and location",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await jobsApi.scrapeLinkedInJobs(keyword, location, limit);
      setResult(response);
      
      toast({
        title: "Jobs scraped successfully",
        description: `Found ${response.jobsFound} jobs matching your criteria`,
        variant: "default"
      });

      // Notify parent component that jobs were scraped
      if (onJobsScraped) {
        onJobsScraped();
      }
    } catch (error: any) {
      console.error('Error scraping jobs:', error);
      setError(error.response?.data?.message || 'Failed to scrape jobs. Please try again later.');
      
      toast({
        title: "Error scraping jobs",
        description: error.response?.data?.message || 'Failed to scrape jobs. Please try again later.',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
    <Card>
      <CardHeader>
        <CardTitle>LinkedIn Job Finder</CardTitle>
        <CardDescription>
          Find relevant job opportunities on LinkedIn based on your profile
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!dependenciesChecked ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Checking scraper dependencies...</span>
          </div>
        ) : (
          <>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <Alert className="mb-4">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  {result.message}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyword">Job Title or Keyword</Label>
                <Input
                  id="keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. Software Developer"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. New York, Remote"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="limit">Number of Jobs (Max 50)</Label>
                <Input
                  id="limit"
                  type="number"
                  min={1}
                  max={50}
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value) || 25)}
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scraping Jobs...
                  </>
                ) : (
                  'Find LinkedIn Jobs'
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
                      onClick={() => setKeyword(skill)}
                      disabled={loading}
                    >
                      {skill}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          {dependenciesInstalled 
            ? "Using advanced LinkedIn scraper" 
            : "Using basic scraper functionality"}
        </p>
      </CardFooter>
    </Card>
  );
} 