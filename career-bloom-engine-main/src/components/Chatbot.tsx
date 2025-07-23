import { API } from '@/services/api';
import * as pdfjsLib from 'pdfjs-dist';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

interface Message {
  type: 'user' | 'bot';
  content: string;
}

interface JobContext {
  id?: string;
  title: string;
  company: string;
  location?: string;
  description?: string;
  salary?: string;
  url?: string;
  skills?: string[];
  requirements?: string[];
  posted_date?: any;
  type?: string;
  remote?: boolean;
  [key: string]: any;
}

export interface ChatbotRef {
  openWithJob: (job: JobContext) => void;
}

// PDF extraction moved to backend - no longer needed in frontend

export const Chatbot = forwardRef<ChatbotRef, { initialJob?: JobContext }>(
  function Chatbot({ initialJob }, ref) {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [useEnhancedLLM, setUseEnhancedLLM] = useState(true);
    const [jobContext, setJobContext] = useState<JobContext | null>(initialJob || null);
    const [resumeText, setResumeText] = useState<string>('');

    // Function to open chatbot with job context
    const openWithJob = async (job: JobContext) => {
      console.log('openWithJob called with job:', job);
      setJobContext(job);
      setIsOpen(true);
      setMessages([]); // clear previous messages for new job context

      // Fetch extracted resume text from backend
      let currentResumeText = '';
      try {
        console.log('🔍 Fetching resume text from backend...');
        const resumeTextData = await API.resume.getResumeText();
        console.log('📋 Resume text response:', resumeTextData);

        if (resumeTextData && resumeTextData.extractedText) {
          currentResumeText = resumeTextData.extractedText;
          setResumeText(currentResumeText);
          console.log('📄 Resume text loaded from backend, length:', currentResumeText.length);
          console.log('📄 Resume text preview:', currentResumeText.substring(0, 200) + '...');
        } else {
          console.log('⚠️ No extracted resume text found in response');
          setResumeText('');
        }
      } catch (e: any) {
        console.error('❌ Error fetching resume text:', e);
        setResumeText('');

        // If it's a 400 error, show user-friendly message
        if (e.message && e.message.includes('400')) {
          console.log('⚠️ Invalid resume file detected - user needs to upload a new one');
        }
      }

      // Auto-send job analysis query
      setTimeout(async () => {
        const autoQuery = `Please analyze this job opportunity and tell me how well my background matches the requirements. What are my strengths for this role and what areas should I focus on improving?`;

        // Add the auto-query as a user message
        const userMessage: Message = { type: 'user', content: autoQuery };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
          const endpoint = useEnhancedLLM
            ? 'http://localhost:5000/api/chatbot/test-llm'
            : 'http://localhost:5000/api/chatbot/query';

          const body: any = {
            query: autoQuery,
            job: job,
            resumeText: currentResumeText
          };

          console.log('🚀 Sending to chatbot:', {
            endpoint,
            queryLength: autoQuery.length,
            jobTitle: job.title,
            resumeTextLength: currentResumeText.length,
            resumeTextPreview: currentResumeText.substring(0, 100) + '...'
          });

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          });

          const data = await response.json();
          if (data.success) {
            const botMessage: Message = { type: 'bot', content: data.response };
            setMessages(prev => [...prev, botMessage]);
          } else {
            const errorMessage: Message = {
              type: 'bot',
              content: 'I can see the job details! Feel free to ask me about this position, how well you match the requirements, or any career-related questions.'
            };
            setMessages(prev => [...prev, errorMessage]);
          }
        } catch (error) {
          console.error('Error in auto-query:', error);
          const welcomeMessage: Message = {
            type: 'bot',
            content: 'I can see the job details! Feel free to ask me about this position, how well you match the requirements, or any career-related questions.'
          };
          setMessages(prev => [...prev, welcomeMessage]);
        } finally {
          setIsLoading(false);
        }
      }, 1000); // Small delay to ensure UI is ready
    };

    useImperativeHandle(ref, () => ({ openWithJob }), [jobContext, resumeText]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim()) return;

      const userMessage: Message = { type: 'user', content: query };
      setMessages(prev => [...prev, userMessage]);
      setQuery('');
      setIsLoading(true);

      try {
        const endpoint = useEnhancedLLM 
          ? 'http://localhost:5000/api/chatbot/test-llm' 
          : 'http://localhost:5000/api/chatbot/query';
        const body: any = { query };
        if (jobContext) body.job = jobContext;
        if (resumeText) body.resumeText = resumeText;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
        const data = await response.json();
        if (data.success) {
          const botMessage: Message = { type: 'bot', content: data.response };
          setMessages(prev => [...prev, botMessage]);
        } else {
          const errorMessage: Message = { 
            type: 'bot', 
            content: 'Sorry, I encountered an error. Please try again.' 
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      } catch (error) {
        const errorMessage: Message = { 
          type: 'bot', 
          content: 'Sorry, I could not connect to the chatbot service. Please make sure the server is running on port 5000.' 
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="fixed bottom-4 right-4 z-50">
        {isOpen ? (
          <Card className="w-full max-w-lg p-4 shadow-2xl border-2 border-blue-200 bg-white">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-gray-800">🤖 Career Search Assistant</h2>
              <div className="flex items-center gap-2">
                <label className="text-xs flex items-center">
                  <input 
                    type="checkbox" 
                    checked={useEnhancedLLM} 
                    onChange={() => setUseEnhancedLLM(!useEnhancedLLM)}
                    className="mr-1"
                  />
                  Enhanced AI
                </label>
                <Button size="sm" variant="ghost" onClick={() => {
                  setIsOpen(false);
                  // Clear job context and resume text when closing
                  setJobContext(null);
                  setResumeText('');
                  setMessages([]);
                  console.log('🧹 Cleared job context and resume text');
                }}>
                  ✕
                </Button>
              </div>
            </div>
            {jobContext && (
              <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg shadow-sm">
                <div className="font-bold text-blue-800 text-sm mb-2">🎯 Job Context</div>
                <div className="text-sm">
                  <div className="font-semibold text-gray-900">{jobContext.title}</div>
                  <div className="text-blue-700 font-medium">{jobContext.company}</div>
                  <div className="text-gray-600 text-xs mt-1">{jobContext.location}</div>
                  {jobContext.salary && (
                    <div className="text-green-600 text-xs font-medium">{jobContext.salary}</div>
                  )}
                  <div className="text-gray-700 text-xs mt-2 line-clamp-3">
                    {jobContext.description?.slice(0, 150)}...
                  </div>
                  {jobContext.skills && jobContext.skills.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-600 mb-1">Required Skills:</div>
                      <div className="flex flex-wrap gap-1">
                        {jobContext.skills.slice(0, 4).map((skill, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                        {jobContext.skills.length > 4 && (
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                            +{jobContext.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="h-[400px] overflow-y-auto space-y-4 p-4 border rounded-lg bg-white">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                  Thinking...
                </div>
              </div>
            )}
          </div>
            <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about this job, your fit, or anything career-related..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              Send
            </Button>
          </form>
          </Card>
        ) : (
          <Button
            onClick={() => setIsOpen(true)}
            className="rounded-full h-14 w-14 shadow-lg flex items-center justify-center bg-blue-500 text-white"
          >
            💬
          </Button>
        )}
        </div>
    );
  }
); 