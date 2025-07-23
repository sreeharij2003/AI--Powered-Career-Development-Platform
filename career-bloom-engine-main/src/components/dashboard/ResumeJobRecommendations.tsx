import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useClerkAuthContext } from '@/contexts/ClerkAuthContext';
import { API } from '@/services/api';
import jobRecommendationApi, { JobRecommendation } from '@/services/jobRecommendationApi';
import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ResumeJobRecommendations() {
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useClerkAuthContext();

  // TODO: Add resume upload event listener later

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First try to get the user's resume
      const resumeData = await API.resume.getResume();
      
      if (!resumeData) {
        setError('No resume found. Please upload a resume in your profile to get personalized job recommendations.');
        setLoading(false);
        return;
      }
      
      // Get the resume file
      const response = await fetch(resumeData.fileUrl);
      const blob = await response.blob();
      const file = new File([blob], resumeData.fileName, { type: response.headers.get('content-type') || 'application/pdf' });
      
      // Get recommendations based on the resume file
      const jobRecommendations = await jobRecommendationApi.getRecommendationsFromFile(file);
      
      // Ensure each job has a unique id
      const recommendationsWithIds = jobRecommendations.map((job, index) => ({
        ...job,
        id: job.id || `job-${index}`
      }));
      
      setRecommendations(recommendationsWithIds);
    } catch (error) {
      console.error('Error loading job recommendations:', error);
      setError('Failed to load job recommendations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Resume-Based Job Recommendations</CardTitle>
            <CardDescription>
              Personalized job recommendations based on your resume
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadRecommendations} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-muted-foreground">
            {error}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No job recommendations found. Try refreshing or updating your resume with more skills and experience.
          </div>
        ) : (
          <div className="space-y-6 w-full px-0 overflow-hidden">
            {recommendations
              .slice() // copy array
              .sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
              .map((job) => {
                // Mock data for demonstration
                const logo = job.company === 'Truveta' ? '/placeholder.svg' : '/placeholder.svg';
                const applicants = Math.floor(Math.random() * 200) + 1;
                const matchScore = job.match_score !== undefined ? job.match_score : Math.floor(Math.random() * 21) + 75; // 75-95%
                const highlights = [
                  ...(matchScore > 78 ? ['H1B Sponsor Likely'] : []),
                  ...(matchScore > 77 ? ['Growth Opportunities'] : []),
                ];
                // Format postedAgo as a string
                let postedAgo: string = 'Recently';
                if (job.posted_date) {
                  if (typeof job.posted_date === 'string') {
                    postedAgo = job.posted_date;
                  } else if (job.posted_date instanceof Date) {
                    postedAgo = job.posted_date.toLocaleDateString();
                  }
                }
                return (
                  <div
                key={job.id || `job-${Math.random()}`}
                    className="flex flex-col lg:flex-row bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-shadow group w-full max-w-full job-card-container"
                  >
                    {/* Left/Main Content */}
                    <div className="flex-1 p-6 flex flex-col justify-between min-w-0">
                      <div className="flex items-center gap-4 mb-2">
                        <img src={logo} alt={job.company} className="w-14 h-14 rounded-lg object-cover border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full mb-1 dark:bg-green-900/30 dark:text-green-300">
                            {postedAgo}
                          </span>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight break-words job-title-text">
                            {job.title}
                          </h3>
                          <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                            {job.company}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-300 text-sm mb-2">
                        <div className="flex items-center gap-1"><span role="img" aria-label="location">📍</span>{job.location}</div>
                        <div className="flex items-center gap-1"><span role="img" aria-label="type">💼</span>{job.type}</div>
                        {job.salary && <div className="flex items-center gap-1"><span className="font-medium">${job.salary}</span></div>}
                        {job.remote && <div className="flex items-center gap-1"><span className="font-medium">Remote</span></div>}
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {job.skills && job.skills.slice(0, 4).map(skill => (
                          <span key={skill} className="inline-block bg-gray-200 dark:bg-gray-700 text-xs px-2 py-0.5 rounded-full">{skill}</span>
                        ))}
                        {job.skills && job.skills.length > 4 && (
                          <span className="inline-block bg-gray-300 dark:bg-gray-600 text-xs px-2 py-0.5 rounded-full">+{job.skills.length - 4} more</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-2">
                        <span>{applicants} applicants</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button variant="ghost" size="icon" className="rounded-full"><span role="img" aria-label="not interested">🚫</span></Button>
                        <Button variant="ghost" size="icon" className="rounded-full"><span role="img" aria-label="save">❤️</span></Button>
                        <Button variant="secondary" size="sm" className="font-semibold" onClick={() => {
                          if ((window as any).chatbotRef && (window as any).chatbotRef.openWithJob) {
                            (window as any).chatbotRef.openWithJob(job);
                          }
                        }}>
                          ✦ ASK ORION
                        </Button>
                        {job.url ? (
                          <a href={job.url} target="_blank" rel="noopener noreferrer" className="ml-auto">
                            <Button variant="default" size="sm" className="font-semibold bg-green-500 hover:bg-green-600 text-white">APPLY NOW</Button>
                          </a>
                        ) : (
                          <Button variant="default" size="sm" className="font-semibold bg-gray-400 text-white ml-auto" disabled>No Link</Button>
                        )}
                      </div>
                    </div>
                    {/* Right/Match Score */}
                    <div className="flex flex-col justify-center items-center w-full lg:w-[180px] lg:min-w-[180px] bg-gradient-to-b from-cyan-900 via-cyan-800 to-cyan-700 dark:from-cyan-800 dark:via-cyan-900 dark:to-cyan-950 p-6 text-white">
                      <div className="flex flex-col items-center">
                        <div className="relative flex items-center justify-center mb-2">
                          <svg width="80" height="80" viewBox="0 0 80 80" className="transform -rotate-90">
                            <circle cx="40" cy="40" r="32" fill="none" stroke="#2dd4bf" strokeWidth="4" opacity="0.2" />
                            <circle
                              cx="40"
                              cy="40"
                              r="32"
                              fill="none"
                              stroke="#2dd4bf"
                              strokeWidth="4"
                              strokeDasharray="201"
                              strokeDashoffset={201 - (matchScore / 100) * 201}
                              className="transition-all duration-1000 ease-out"
                            />
                          </svg>
                          <span className="absolute text-2xl font-bold">{matchScore}%</span>
                        </div>
                        <div className="text-lg font-semibold tracking-wide">GOOD MATCH</div>
                        <ul className="mt-2 space-y-1 text-xs text-cyan-100">
                          {highlights.map(h => <li key={h}>✓ {h}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 