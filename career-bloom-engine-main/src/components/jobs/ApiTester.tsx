import { Button } from '@/components/ui/button';
import { getApiKey } from '@/services/apiKeyService';
import linkedinApiService from '@/services/linkedinApiService';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function ApiTester() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubscriptionError, setIsSubscriptionError] = useState(false);

  const testApi = async () => {
    setIsLoading(true);
    setResult('');
    setError('');
    setIsSubscriptionError(false);
    
    try {
      const apiKey = getApiKey();
      if (!apiKey) {
        setError('No API key found in storage');
        setIsLoading(false);
        return;
      }
      
      console.log('Testing API with key:', apiKey.substring(0, 5) + '...');
      linkedinApiService.setApiKey(apiKey);
      
      const response = await linkedinApiService.searchJobs('software developer', 'remote');
      
      // Check if we got mock data (indicating API subscription issue)
      if (response.jobs.length > 0 && 
          ['Microsoft', 'Google', 'Amazon', 'Netflix', 'Facebook'].some(
            company => response.jobs[0].company_name === company || response.jobs[0].company === company
          )) {
        setIsSubscriptionError(true);
        setError('API subscription error: You are not subscribed to the LinkedIn Jobs Search API');
      }
      
      setResult(JSON.stringify(response, null, 2));
      console.log('API test complete:', response);
    } catch (err) {
      console.error('API test error:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      if (errorMessage.includes('403') || errorMessage.includes('not subscribed')) {
        setIsSubscriptionError(true);
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md bg-background">
      <h3 className="text-lg font-semibold mb-4">LinkedIn API Tester</h3>
      
      <Button 
        onClick={testApi}
        disabled={isLoading}
        className="mb-4"
      >
        {isLoading ? 'Testing...' : 'Test API Connection'}
      </Button>
      
      {isSubscriptionError && (
        <div className="p-3 mb-4 bg-yellow-100 border border-yellow-300 rounded flex gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-yellow-800">API Subscription Required</p>
            <p className="text-sm text-yellow-700">
              The API key is not subscribed to the LinkedIn Jobs Search API on RapidAPI.
              The application will use sample data instead.
            </p>
            <p className="text-sm mt-2">
              <a 
                href="https://rapidapi.com/linkedin-api/api/linkedin-jobs-search" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Subscribe to the API on RapidAPI
              </a>
            </p>
          </div>
        </div>
      )}
      
      {error && !isSubscriptionError && (
        <div className="p-3 mb-4 bg-red-100 border border-red-300 rounded text-red-800">
          <p className="font-semibold">Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-4">
          <p className="font-semibold mb-2">API Response:</p>
          <pre className="bg-muted p-3 rounded-md overflow-auto max-h-96 text-xs">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
} 