import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, Key, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ApiKeyInputProps {
  onApiKeyChange: (apiKey: string) => void;
}

export default function ApiKeyInput({ onApiKeyChange }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const { toast } = useToast();

  // Check for saved API key in localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('linkedin-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsSaved(true);
      onApiKeyChange(savedApiKey);
    }
  }, [onApiKeyChange]);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your RapidAPI LinkedIn Data API key",
        variant: "destructive"
      });
      return;
    }

    // Save to localStorage
    localStorage.setItem('linkedin-api-key', apiKey);
    setIsSaved(true);
    
    // Notify parent component
    onApiKeyChange(apiKey);
    
    toast({
      title: "API Key Saved",
      description: "Your LinkedIn API key has been saved",
    });
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('linkedin-api-key');
    setApiKey('');
    setIsSaved(false);
    setShowApiKey(false);
    onApiKeyChange('');
    
    toast({
      title: "API Key Removed",
      description: "Your LinkedIn API key has been removed",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>LinkedIn API Configuration</CardTitle>
        <CardDescription>
          Enter your RapidAPI LinkedIn Data API key to enable job search
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="flex">
              <div className="relative flex-grow">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your RapidAPI LinkedIn Data API key"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Button 
                onClick={handleSaveApiKey}
                className="ml-2"
                variant="secondary"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
          
          {isSaved && (
            <div className="flex items-center justify-between rounded-md bg-green-50 p-3 dark:bg-green-900/20">
              <div className="flex items-center">
                <Key className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-sm text-green-600 dark:text-green-400">API key is configured</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearApiKey}
                className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
              >
                Remove
              </Button>
            </div>
          )}
          
          <div className="text-sm text-muted-foreground">
            <p>To get an API key:</p>
            <ol className="list-decimal list-inside space-y-1 mt-1">
              <li>Visit <a href="https://rapidapi.com/rockapis-rockapis-default/api/linkedin-data-api" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">RapidAPI LinkedIn Data API</a></li>
              <li>Sign up or log in to RapidAPI</li>
              <li>Subscribe to a plan (they offer a free tier)</li>
              <li>Copy your API key from the "X-RapidAPI-Key" field</li>
            </ol>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <p className="text-xs text-muted-foreground">
          Your API key is stored locally in your browser
        </p>
      </CardFooter>
    </Card>
  );
} 