import { ClerkProvider } from '@clerk/clerk-react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';

// Import publishable key from environment variable
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Check if publishable key is available
if (!publishableKey) {
  throw new Error("Missing Clerk publishable key");
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" storageKey="career-bloom-theme">
    <ClerkProvider 
      publishableKey={publishableKey}
      signInUrl="/signin"
      signUpUrl="/signup"
      afterSignInUrl="/redirect-to-dashboard"
      afterSignUpUrl="/redirect-to-dashboard"
      afterSignOutUrl="/"
    >
      <App />
    </ClerkProvider>
  </ThemeProvider>
);
