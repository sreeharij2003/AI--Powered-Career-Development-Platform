import { useEffect, useRef } from 'react';

// Custom event types
export interface ResumeUploadEvent {
  type: 'resume-uploaded';
  data: {
    resumeId: string;
    fileName: string;
    skills: string[];
    summary: string;
    headline: string;
  };
}

export interface ResumeDeleteEvent {
  type: 'resume-deleted';
  data: {};
}

export type ResumeEvent = ResumeUploadEvent | ResumeDeleteEvent;

// Event emitter for resume events
class ResumeEventEmitter {
  private listeners: Map<string, Set<(event: ResumeEvent) => void>> = new Map();

  subscribe(eventType: string, callback: (event: ResumeEvent) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(eventType);
      if (eventListeners) {
        eventListeners.delete(callback);
        if (eventListeners.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  emit(event: ResumeEvent) {
    const eventListeners = this.listeners.get(event.type);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(event));
    }
  }

  // Subscribe to all resume events
  subscribeToAll(callback: (event: ResumeEvent) => void) {
    const unsubscribeFunctions = [
      this.subscribe('resume-uploaded', callback),
      this.subscribe('resume-deleted', callback)
    ];

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }
}

// Global instance
export const resumeEventEmitter = new ResumeEventEmitter();

// Hook to listen for resume events
export const useResumeEvents = (callback: (event: ResumeEvent) => void) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const unsubscribe = resumeEventEmitter.subscribeToAll((event) => {
      callbackRef.current(event);
    });

    return unsubscribe;
  }, []);
};

// Hook to emit resume events
export const useResumeEventEmitter = () => {
  return {
    emitResumeUploaded: (data: ResumeUploadEvent['data']) => {
      resumeEventEmitter.emit({
        type: 'resume-uploaded',
        data
      });
    },
    emitResumeDeleted: () => {
      resumeEventEmitter.emit({
        type: 'resume-deleted',
        data: {}
      });
    }
  };
};

// Hook specifically for job recommendation refresh
export const useJobRecommendationRefresh = (refreshCallback: () => void) => {
  const refreshCallbackRef = useRef(refreshCallback);
  refreshCallbackRef.current = refreshCallback;

  useResumeEvents((event) => {
    if (event.type === 'resume-uploaded') {
      console.log('Resume uploaded, refreshing job recommendations...');
      // Add a small delay to ensure the resume is processed
      setTimeout(() => {
        refreshCallbackRef.current();
      }, 1000);
    }
  });
};
