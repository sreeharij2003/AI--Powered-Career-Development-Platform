import { AuthLayout } from "@/components/auth/AuthLayout";
import RedirectToDashboard from "@/components/auth/RedirectToDashboard";
import { Button } from "@/components/ui/button";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
    AuthenticateWithRedirectCallback,
    SignIn as ClerkSignIn,
    SignUp as ClerkSignUp
} from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { Chatbot } from './components/Chatbot';
import { ClerkAuthProvider, useClerkAuthContext } from "./contexts/ClerkAuthContext";
import Companies from "./pages/Companies";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import NotFound from "./pages/NotFound";
import ProfilePage from './pages/ProfilePage';
import { setTokenGetter } from "./services/api";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Custom appearance for Clerk components
const clerkAppearance = {
  baseTheme: undefined,
  elements: {
    formButtonPrimary: 
      "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md",
    card: "bg-background shadow-md rounded-lg border border-border",
    formFieldInput: 
      "border border-input bg-background px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-primary",
    footerActionLink: "text-primary hover:text-primary/90",
    headerTitle: "text-2xl font-bold",
    headerSubtitle: "text-muted-foreground",
    socialButtonsIconButton: "border border-border hover:bg-muted",
    formFieldLabel: "text-foreground",
    formButtonReset: "text-primary hover:text-primary/90",
    identityPreviewText: "text-foreground",
    identityPreviewEditButton: "text-primary hover:text-primary/90",
    formResendCodeLink: "text-primary hover:text-primary/90",
    otpCodeFieldInput: "border border-input bg-background text-foreground"
  },
  variables: {
    colorPrimary: 'hsl(var(--primary))',
    colorText: 'hsl(var(--foreground))',
    colorBackground: 'hsl(var(--background))',
    colorInputText: 'hsl(var(--foreground))',
    colorInputBackground: 'hsl(var(--background))',
    colorTextSecondary: 'hsl(var(--muted-foreground))'
  }
};

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useClerkAuthContext();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
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

  return isAuthenticated ? <>{children}</> : null;
};

// Centered auth component wrappers
const CenteredSignIn = () => (
  <AuthLayout title="Welcome Back">
    <div className="w-full p-4">
      <ClerkSignIn 
        routing="path" 
        path="/signin" 
        signUpUrl="/signup" 
      />
    </div>
  </AuthLayout>
);

const CenteredSignUp = () => (
  <AuthLayout title="Create an Account">
    <div className="w-full p-4">
      <ClerkSignUp 
        routing="path" 
        path="/signup" 
        signInUrl="/signin"
      />
    </div>
  </AuthLayout>
);

// API token setup component
const APITokenSetup = ({ children }: { children: React.ReactNode }) => {
  const { getToken } = useClerkAuthContext();
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    const setup = async () => {
      try {
        setTokenGetter(getToken);
        setIsReady(true);
      } catch (error) {
        console.error('Error setting up API token:', error);
        setIsReady(true); // Continue anyway to not block the app
      }
    };
    setup();
  }, [getToken]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-8 rounded-lg shadow-md bg-background">
          <h2 className="text-2xl font-bold mb-4">Initializing...</h2>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Route for OAuth callback with manual navigation
const OAuthCallbackHandler = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      // Try to handle the authentication callback first
      // Then navigate to the redirect handler which will check auth state
      const timer = setTimeout(() => {
        navigate("/redirect-to-dashboard", { replace: true });
      }, 1500);
      
      return () => clearTimeout(timer);
    } catch (err) {
      console.error("OAuth callback error:", err);
      setError(true);
    }
  }, [navigate]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-8 rounded-lg shadow-md bg-background">
          <h2 className="text-2xl font-bold mb-4 text-destructive">Authentication Error</h2>
          <p className="text-muted-foreground mb-4">We encountered an issue while signing you in.</p>
          <Button onClick={() => navigate("/signin", { replace: true })}>
            Try Again
          </Button>
          <AuthenticateWithRedirectCallback />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-8 rounded-lg shadow-md bg-background">
        <h2 className="text-2xl font-bold mb-4">Processing authentication...</h2>
        <p className="text-muted-foreground mb-4">Please wait while we complete your sign-in.</p>
        <div className="w-full bg-muted rounded-full h-2.5">
          <div className="bg-primary h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
        </div>
        <AuthenticateWithRedirectCallback />
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ClerkAuthProvider>
        <APITokenSetup>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/companies" element={<Companies />} />
              
              {/* Auth routes using Clerk components */}
              <Route path="/signin/*" element={<CenteredSignIn />} />
              <Route path="/signup/*" element={<CenteredSignUp />} />
              <Route path="/sso-callback" element={<OAuthCallbackHandler />} />
              
              {/* Redirect route that will handle redirecting to the dashboard */}
              <Route path="/redirect-to-dashboard" element={<RedirectToDashboard />} />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </APITokenSetup>
      </ClerkAuthProvider>
      <Chatbot />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
