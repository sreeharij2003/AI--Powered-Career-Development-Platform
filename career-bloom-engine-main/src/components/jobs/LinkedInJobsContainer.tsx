import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Job } from '@/services/jobsApi';
import { InfoIcon } from 'lucide-react';
import { useState } from 'react';
import ApiKeyInput from './ApiKeyInput';
import LinkedInJobScraper from './LinkedInJobScraper';
import LinkedInJobSearch from './LinkedInJobSearch';

interface UserProfile {
  skills?: string[];
  location?: string;
  jobTitle?: string;
}

interface LinkedInJobsContainerProps {
  userProfile?: UserProfile;
  onJobClick?: (job: Job) => void;
}

export default function LinkedInJobsContainer({ userProfile, onJobClick }: LinkedInJobsContainerProps) {
  const [apiKey, setApiKey] = useState<string>('');
  
  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
  };
  
  return (
    <div className="space-y-6">
      <ApiKeyInput onApiKeyChange={handleApiKeyChange} />
      
      <Tabs defaultValue="api" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="api">LinkedIn API Search</TabsTrigger>
          <TabsTrigger value="scraper">LinkedIn Scraper</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api">
          {!apiKey ? (
            <Alert className="mb-4">
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>API Key Required</AlertTitle>
              <AlertDescription>
                Please configure your LinkedIn API key above to use the real-time job search.
              </AlertDescription>
            </Alert>
          ) : (
            <LinkedInJobSearch 
              userProfile={userProfile} 
              apiKey={apiKey} 
              onJobClick={onJobClick} 
            />
          )}
        </TabsContent>
        
        <TabsContent value="scraper">
          <Alert className="mb-4" variant="default">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>About LinkedIn Scraper</AlertTitle>
            <AlertDescription>
              This method uses the backend scraper which may be slower and less reliable than the API. Use the API search tab for better results.
            </AlertDescription>
          </Alert>
          
          <LinkedInJobScraper 
            userProfile={userProfile} 
            onJobsScraped={() => {}} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 