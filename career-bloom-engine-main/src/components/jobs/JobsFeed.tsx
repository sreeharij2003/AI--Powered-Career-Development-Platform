import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import jobsApi, { Job, JobFilters } from '@/services/jobsApi';
import { formatDistanceToNow } from 'date-fns';
import { Briefcase, Building2, CalendarDays, ExternalLink, MapPin } from 'lucide-react';
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
    <div className="space-y-4">
      {jobs.map(job => (
        <Card 
          key={job._id}
          className="p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleJobClick(job)}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{job.title}</h3>
              
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <Building2 className="h-4 w-4" />
                <span>{job.company}</span>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
                {job.remote && (
                  <Badge variant="secondary">Remote</Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">
                  <Briefcase className="h-3 w-3 mr-1" />
                  {job.type}
                </Badge>
                {job.experience_level && (
                  <Badge variant="outline">{job.experience_level}</Badge>
                )}
                {job.salary && (
                  <Badge variant="outline">{job.salary}</Badge>
                )}
              </div>

              {job.skills && job.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {job.skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {formatDistanceToNow(new Date(job.posted_date), { addSuffix: true })}
              </Badge>
              
              {job.url && (
                <a 
                  href={job.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-muted-foreground hover:text-primary"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </Card>
      ))}

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