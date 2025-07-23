import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import jobsApi, { Job, JobFilters } from '@/services/jobsApi';
import { formatDistanceToNow } from 'date-fns';
import { Briefcase, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

interface JobsFeedProps {
  filters?: JobFilters;
  onJobClick?: (job: Job) => void;
}

export default function JobsFeed({ filters = {}, onJobClick }: JobsFeedProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadJobs();
  }, [filters, page]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsApi.getLatestJobs({
        ...filters,
        page,
        limit: 10
      });
      
      if (page === 1) {
        setJobs(response.jobs);
      } else {
        setJobs(prev => [...prev, ...response.jobs]);
      }
      
      setHasMore(response.page < response.totalPages);
      setError(null);
    } catch (error) {
      setError('Failed to load jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const handleJobClick = (job: Job) => {
    // Open chatbot with job context
    if ((window as any).chatbotRef && (window as any).chatbotRef.openWithJob) {
      (window as any).chatbotRef.openWithJob(job);
    }

    // Also call the original onJobClick if provided (for modal, etc.)
    if (onJobClick) {
      onJobClick(job);
    }
  };

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={loadJobs} variant="outline" className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {jobs.map(job => {
        // Mock data for demonstration
        const logo = job.company === 'Truveta' ? '/placeholder.svg' : '/placeholder.svg';
        const applicants = Math.floor(Math.random() * 200) + 1;
        const matchScore = Math.floor(Math.random() * 21) + 75; // 75-95%
        const highlights = [
          ...(matchScore > 78 ? ['H1B Sponsor Likely'] : []),
          ...(matchScore > 77 ? ['Growth Opportunities'] : []),
        ];
        const postedAgo = formatDistanceToNow(new Date(job.posted_date), { addSuffix: true });
        return (
          <div
            key={job._id}
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
                    {job.company} {job.source && <span className="mx-1">/</span>} {job.source}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-300 text-sm mb-2">
                <div className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</div>
                <div className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{job.type}</div>
                {job.salary && <div className="flex items-center gap-1"><span className="font-medium">${job.salary}</span></div>}
                {job.experience_level && <div className="flex items-center gap-1">{job.experience_level}</div>}
                {job.remote && <div className="flex items-center gap-1"><Badge variant="secondary">Remote</Badge></div>}
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {job.skills && job.skills.slice(0, 4).map(skill => (
                  <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                ))}
                {job.skills && job.skills.length > 4 && (
                  <Badge variant="secondary" className="text-xs">+{job.skills.length - 4} more</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-2">
                <span>{applicants} applicants</span>
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="ghost" size="icon" className="rounded-full"><span role="img" aria-label="not interested">🚫</span></Button>
                <Button variant="ghost" size="icon" className="rounded-full"><span role="img" aria-label="save">❤️</span></Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    if ((window as any).chatbotRef && (window as any).chatbotRef.openWithJob) {
                      (window as any).chatbotRef.openWithJob(job);
                    }
                  }}
                >
                  ✦ ASK ORION
                </Button>
                <Button variant="default" size="sm" className="font-semibold bg-green-500 hover:bg-green-600 text-white ml-auto">APPLY NOW</Button>
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
      {loading && (
        <div className="text-center p-4">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      )}
      {!loading && hasMore && (
        <div className="text-center">
          <Button onClick={loadMore} variant="outline">
            Load More Jobs
          </Button>
        </div>
      )}
      {!loading && jobs.length === 0 && (
        <div className="text-center p-4">
          <p className="text-muted-foreground">No jobs found matching your criteria.</p>
        </div>
      )}
    </div>
  );
} 