import { getApiKey, storeApiKey } from '@/services/apiKeyService';
import { useEffect } from 'react';

interface ApiKeyInitializerProps {
  apiKey?: string;
}

// This component doesn't render anything, it just initializes the API key
export default function ApiKeyInitializer({ apiKey }: ApiKeyInitializerProps) {
  useEffect(() => {
    if (apiKey) {
      console.log('ApiKeyInitializer: Received API key from props');
      
      // Check if we already have a stored key
      const existingKey = getApiKey();
      if (existingKey) {
        console.log('ApiKeyInitializer: API key already exists in storage');
        
        // Only update if different
        if (existingKey !== apiKey) {
          console.log('ApiKeyInitializer: Updating stored API key');
          storeApiKey(apiKey);
        }
      } else {
        console.log('ApiKeyInitializer: No existing API key, storing new key');
        storeApiKey(apiKey);
      }
      
      // Verify the key was stored correctly
      const verifiedKey = getApiKey();
      console.log('ApiKeyInitializer: Verified API key is stored:', !!verifiedKey);
    } else {
      console.warn('ApiKeyInitializer: No API key provided in props');
    }
  }, [apiKey]);

  return null;
} 