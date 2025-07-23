import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ResumeContextType {
  resumeVersion: number;
  triggerResumeUpdate: () => void;
  isResumeUploaded: boolean;
  setIsResumeUploaded: (uploaded: boolean) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const useResumeContext = () => {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResumeContext must be used within a ResumeProvider');
  }
  return context;
};

interface ResumeProviderProps {
  children: ReactNode;
}

export const ResumeProvider: React.FC<ResumeProviderProps> = ({ children }) => {
  const [resumeVersion, setResumeVersion] = useState(0);
  const [isResumeUploaded, setIsResumeUploaded] = useState(false);

  const triggerResumeUpdate = () => {
    setResumeVersion(prev => prev + 1);
  };

  const value: ResumeContextType = {
    resumeVersion,
    triggerResumeUpdate,
    isResumeUploaded,
    setIsResumeUploaded,
  };

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  );
};
