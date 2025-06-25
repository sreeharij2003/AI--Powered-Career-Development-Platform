import { useAuth as useClerkAuth, useSession, useUser } from '@clerk/clerk-react';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface ClerkAuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const ClerkAuthContext = createContext<ClerkAuthContextType | undefined>(undefined);

export const ClerkAuthProvider = ({ children }: { children: ReactNode }) => {
  const { isLoaded, isSignedIn, signOut } = useClerkAuth();
  const { user } = useUser();
  const { session } = useSession();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      setIsInitialized(true);
    }
  }, [isLoaded]);

  // Function to get JWT token for API calls
  const getToken = async () => {
    if (!isSignedIn || !session) return null;
    try {
      // Get token from Clerk session
      return await session.getToken();
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  // Map Clerk auth state to our app's auth context
  const authValue: ClerkAuthContextType = {
    isAuthenticated: isSignedIn || false,
    user: user || null,
    getToken,
    signOut,
    loading: !isLoaded
  };

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-8 rounded-lg shadow-md bg-background">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClerkAuthContext.Provider value={authValue}>
      {children}
    </ClerkAuthContext.Provider>
  );
};

export const useClerkAuthContext = () => {
  const context = useContext(ClerkAuthContext);
  if (context === undefined) {
    throw new Error('useClerkAuthContext must be used within a ClerkAuthProvider');
  }
  return context;
}; 