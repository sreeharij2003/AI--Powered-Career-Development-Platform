import JobsFeed from '@/components/jobs/JobsFeed';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Job, JobFilters } from '@/services/jobsApi';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Freelance',
];

const EXPERIENCE_LEVELS = [
  'Entry Level',
  'Mid Level',
  'Senior Level',
  'Lead',
  'Manager',
];

function JobDetailsModal({ job, onClose }: { job: any, onClose: () => void }) {
  if (!job) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-primary-purple text-2xl">&times;</button>
        <h2 className="text-2xl font-bold mb-2">{job.title}</h2>
        <div className="mb-2 text-lg text-primary-purple font-semibold">{job.company}</div>
        <div className="mb-2 text-gray-600 dark:text-gray-300">{job.location}</div>
        <div className="mb-4 text-sm text-gray-500">{job.type} | Posted: {job.posted}</div>
        <div className="mb-4">
          <strong>Description:</strong>
          <p className="mt-1 whitespace-pre-line">{job.description}</p>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {job.tags && job.tags.map((tag: string, idx: number) => (
            <span key={idx} className="px-2 py-1 rounded bg-primary-purple/10 text-primary-purple text-xs font-medium">{tag}</span>
          ))}
        </div>
        <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer">
          <button className="btn-gradient px-6 py-2 rounded-lg text-white font-semibold shadow hover:scale-105 transition-transform">Apply</button>
        </a>
      </div>
    </div>
  );
}

export default function JobsPage() {
  const [filters, setFilters] = useState<JobFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({
      ...prev,
      search: searchQuery
    }));
  };

  const handleFilterChange = (key: keyof JobFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Search and Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid gap-4 p-4 border rounded-lg bg-card">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Job Type</label>
                <Select
                  value={filters.type || ''}
                  onValueChange={(value) => handleFilterChange('type', value)}
                >
                  <option value="">All Types</option>
                  {JOB_TYPES.map(type => (
                    <option key={type} value={type.toLowerCase()}>
                      {type}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Experience Level</label>
                <Select
                  value={filters.experience_level || ''}
                  onValueChange={(value) => handleFilterChange('experience_level', value)}
                >
                  <option value="">All Levels</option>
                  {EXPERIENCE_LEVELS.map(level => (
                    <option key={level} value={level.toLowerCase()}>
                      {level}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  type="text"
                  placeholder="Enter location..."
                  value={filters.location || ''}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Remote Only</label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={filters.remote || false}
                    onCheckedChange={(checked) => handleFilterChange('remote', checked)}
                  />
                  <span className="text-sm text-muted-foreground">
                    {filters.remote ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Jobs Feed */}
        <JobsFeed 
          filters={filters}
          onJobClick={handleJobClick}
        />

        {/* Render the modal if a job is selected */}
        {selectedJob && <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
      </div>
    </div>
  );
} 