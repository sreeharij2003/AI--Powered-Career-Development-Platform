import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';

interface Message {
  type: 'user' | 'bot';
  content: string;
}

export function Chatbot() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [useEnhancedLLM, setUseEnhancedLLM] = useState(true); // Toggle for enhanced LLM

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Add user message
    const userMessage: Message = { type: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    try {
      // Use the enhanced LLM endpoint if enabled
      const endpoint = useEnhancedLLM 
        ? 'http://localhost:5000/api/chatbot/test-llm' 
        : 'http://localhost:5000/api/chatbot/query';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (data.success) {
        // Add bot message
        const botMessage: Message = { type: 'bot', content: data.response };
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Add error message
        const errorMessage: Message = { 
          type: 'bot', 
          content: 'Sorry, I encountered an error. Please try again.' 
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error connecting to chatbot API:', error);
      // Add error message
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
        <Card className="w-full max-w-md p-4 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">Career Search Assistant</h2>
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
              <Button size="sm" variant="ghost" onClick={() => setIsOpen(false)}>
                ✕
              </Button>
            </div>
          </div>
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
            placeholder="Ask about available jobs..."
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