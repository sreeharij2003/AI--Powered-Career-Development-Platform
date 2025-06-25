import { useClerkAuthContext } from "@/contexts/ClerkAuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const RedirectToDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useClerkAuthContext();
  const [redirectAttempts, setRedirectAttempts] = useState(0);

  useEffect(() => {
    // Only redirect when auth state is confirmed
    if (!loading) {
      if (isAuthenticated) {
        // Primary destination: dashboard
        navigate("/dashboard", { replace: true });
      } else if (redirectAttempts < 3) {
        // If not authenticated yet, wait and retry (could be race condition)
        const timer = setTimeout(() => {
          setRedirectAttempts(prev => prev + 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        // After multiple failed attempts, redirect to signin
        navigate("/signin", { replace: true });
      }
    }
  }, [navigate, isAuthenticated, loading, redirectAttempts]);

  // Show loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-8 rounded-lg shadow-md bg-background">
        <h2 className="text-2xl font-bold mb-4">Redirecting...</h2>
        <p className="text-muted-foreground mb-4">
          Please wait while we redirect you to your dashboard.
        </p>
        <div className="w-full bg-muted rounded-full h-2.5">
          <div 
            className="bg-primary h-2.5 rounded-full animate-pulse" 
            style={{ width: '100%' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default RedirectToDashboard; 