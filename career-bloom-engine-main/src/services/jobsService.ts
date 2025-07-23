import { JobFilters, JobListing } from "@/types/jobs";
import { API_BASE_URL } from "./api";

// Convert backend job format to frontend JobListing format
const convertBackendJobToFrontend = (job: any): JobListing => {
  return {
    id: job._id || job.id || `job-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    title: job.title || 'Unknown Title',
    company: job.company || 'Unknown Company',
    logo: job.company_logo_url || job.logo || '',
    location: job.location || 'Unknown Location',
    type: job.employment_type || job.type || 'Full-Time',
    posted: formatPostedDate(job.posted_date || job.posted || ''),
    description: job.description || 'No description available',
    tags: job.skills || job.tags || [],
    applicationUrl: job.url || job.applicationUrl || '#',
    salary: job.salary_range || job.salary || '',
    source: 'JSearch'
  };
};

// Helper function to format posted date
const formatPostedDate = (dateString: string): string => {
  if (!dateString) return 'Recently';

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Recently';
  }
};

// Fetch jobs with filters - uses backend workflow (JSearch API → MongoDB → Vector Store)
export const fetchJobs = async (filters?: JobFilters): Promise<JobListing[]> => {
  console.log("Fetching jobs with filters:", filters);

  try {
    // Use backend endpoint that handles JSearch API, storage, and vector store
    const keyword = filters?.jobType?.includes('Remote') ? 'remote developer' : 'developer';
    const location = filters?.location || '';
    console.log(`Fetching jobs via backend with keyword: ${keyword}, location: ${location}`);

    const response = await fetch(`${API_BASE_URL}/jobs/fetch-jsearch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: keyword,
        location: location,
        limit: 20
      })
    });

    if (!response.ok) {
      throw new Error(`Error fetching jobs: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.jobs && data.jobs.length > 0) {
      console.log(`Successfully fetched ${data.jobs.length} jobs from backend`);
      // Convert backend jobs to frontend format
      const convertedJobs = data.jobs.map(job => convertBackendJobToFrontend(job));

      // Apply any additional filters that weren't handled by the backend
      return filterJobs(convertedJobs, filters);
    } else {
      console.log('Backend returned no jobs, falling back to mock data');
      return filterJobs(mockJobs, filters);
    }
  } catch (error) {
    console.error('Error fetching jobs from backend:', error);

    // Fallback to regular API endpoint if backend fails
    try {
      const response = await fetch(`${API_BASE_URL}/jobs`);

      if (!response.ok) {
        throw new Error(`Error fetching jobs: ${response.statusText}`);
      }

      const jobs = await response.json();
      return filterJobs(jobs, filters);
    } catch (fallbackError) {
      console.error("Error fetching jobs from fallback API:", fallbackError);
      // Final fallback to mock data
      return filterJobs(mockJobs, filters);
    }
  }
};

export const fetchFeaturedJobs = async (): Promise<JobListing[]> => {
  try {
    // Use backend endpoint for featured jobs
    console.log('Fetching featured jobs via backend');

    const response = await fetch(`${API_BASE_URL}/jobs/fetch-jsearch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'featured developer jobs',
        location: '',
        limit: 4
      })
    });

    if (!response.ok) {
      throw new Error(`Error fetching featured jobs: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.jobs && data.jobs.length > 0) {
      console.log(`Successfully fetched ${data.jobs.length} featured jobs from backend`);
      // Convert backend jobs to frontend format and return top 4
      const convertedJobs = data.jobs
        .map(job => convertBackendJobToFrontend(job))
        .slice(0, 4);

      return convertedJobs;
    } else {
      console.log('Backend returned no featured jobs, falling back to regular API');
      // Fall back to regular API if backend returns no jobs
      const fallbackResponse = await fetch(`${API_BASE_URL}/jobs/featured`);

      if (!fallbackResponse.ok) {
        throw new Error(`Error fetching featured jobs: ${fallbackResponse.statusText}`);
      }

      return await fallbackResponse.json();
    }
  } catch (error) {
    console.error("Error fetching featured jobs:", error);
    // Fallback to mock data if API fails
    return mockJobs.slice(0, 4);
  }
};

// Search jobs with keyword and filters - uses backend workflow (JSearch API → MongoDB → Vector Store)
export const searchJobs = async (searchTerm: string, filters?: JobFilters): Promise<JobListing[]> => {
  console.log(`Searching for "${searchTerm}" with filters:`, filters);

  if (!searchTerm || searchTerm.trim() === '') {
    // If no search term, return regular jobs
    return fetchJobs(filters);
  }

  try {
    // Use backend endpoint for search
    const location = filters?.location || '';
    let query = searchTerm;

    // Add location to query if provided
    if (location) {
      query += ` in ${location}`;
    }

    // Add job type to query if only one is selected
    if (filters?.jobType && filters.jobType.length === 1) {
      query += ` ${filters.jobType[0]}`;
    }

    console.log(`Searching jobs via backend with query: ${query}`);

    const response = await fetch(`${API_BASE_URL}/jobs/fetch-jsearch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        location: location,
        limit: 20
      })
    });

    if (!response.ok) {
      throw new Error(`Error searching jobs: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.jobs && data.jobs.length > 0) {
      console.log(`Successfully found ${data.jobs.length} jobs matching "${searchTerm}"`);
      // Convert backend jobs to frontend format
      const convertedJobs = data.jobs.map(job => convertBackendJobToFrontend(job));

      // Apply any additional filters that weren't handled by the backend
      return filterJobs(convertedJobs, filters);
    } else {
      console.log(`Backend returned no jobs for search term "${searchTerm}", falling back to local search`);
      // Fall back to local search if backend returns no results
      const allJobs = await fetchJobs();

      // Filter the jobs based on the search term
      const searchResults = allJobs.filter(job => {
        const searchLower = searchTerm.toLowerCase();
        return (
          job.title.toLowerCase().includes(searchLower) ||
          job.company.toLowerCase().includes(searchLower) ||
          job.description.toLowerCase().includes(searchLower) ||
          job.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      });

      // Apply additional filters
      return filterJobs(searchResults, filters);
    }
  } catch (error) {
    console.error('Error searching jobs via backend:', error);
    console.log('Falling back to local search due to API error');

    // Fall back to local search if backend fails
    try {
      const allJobs = await fetchJobs();

      // Filter the jobs based on the search term
      const searchResults = allJobs.filter(job => {
        const searchLower = searchTerm.toLowerCase();
        return (
          job.title.toLowerCase().includes(searchLower) ||
          job.company.toLowerCase().includes(searchLower) ||
          job.description.toLowerCase().includes(searchLower) ||
          job.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      });

      // Apply additional filters
      return filterJobs(searchResults, filters);
    } catch (fallbackError) {
      console.error("Error in fallback search:", fallbackError);
      return [];
    }
  }
};

// Helper function to apply filters
const filterJobs = (jobs: JobListing[], filters?: JobFilters): JobListing[] => {
  if (!filters) return jobs;
  
  return jobs.filter(job => {
    // Filter by location if provided
    if (filters.location && filters.location.trim() !== '' && 
        !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    
    // Filter by job type if any are selected
    if (filters.jobType && filters.jobType.length > 0) {
      // Special handling for Remote since it could be a tag or part of the type
      const isRemoteRequested = filters.jobType.includes('Remote');
      
      // For non-remote job types, check if the job type matches any selected type
      const nonRemoteTypes = filters.jobType.filter(type => type !== 'Remote');
      
      if (nonRemoteTypes.length > 0) {
        const jobTypeLower = job.type.toLowerCase();
        const matchesType = nonRemoteTypes.some(type => 
          jobTypeLower.includes(type.toLowerCase())
        );
        
        // If non-remote types are selected and don't match, filter out
        if (!matchesType) {
          // Unless Remote is selected and the job is remote
          if (!(isRemoteRequested && (job.tags?.includes('Remote') || job.type.toLowerCase().includes('remote')))) {
            return false;
          }
        }
      }
      // If only Remote is selected, check if job is remote
      else if (isRemoteRequested && 
              !(job.tags?.includes('Remote') || job.type.toLowerCase().includes('remote'))) {
        return false;
      }
    }
    
    // Filter by experience level if any are selected
    if (filters.experienceLevel && filters.experienceLevel.length > 0) {
      // Try to match experience level from job title or description
      const jobText = `${job.title} ${job.description}`.toLowerCase();
      const matchesLevel = filters.experienceLevel.some(level => {
        const levelLower = level.toLowerCase();
        return jobText.includes(levelLower);
      });
      
      if (!matchesLevel) return false;
    }
    
    // Filter by industry if any are selected (using tags as proxy for industry)
    if (filters.industry && filters.industry.length > 0 && job.tags) {
      const matchesIndustry = filters.industry.some(industry => {
        // Check if any tag includes the industry or if the job description includes the industry
        return job.tags!.some(tag => tag.toLowerCase().includes(industry.toLowerCase())) || 
               job.description.toLowerCase().includes(industry.toLowerCase());
      });
      
      if (!matchesIndustry) return false;
    }
    
    return true;
  });
};

// Trigger a manual scrape - this would be called by an admin user
export const triggerJobScrape = async (): Promise<{ message: string, count: number }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/scrape`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`Error triggering job scrape: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error triggering job scrape:", error);
    throw error;
  }
};

// Mock data as fallback if API fails
const mockJobs: JobListing[] = [
  {
    id: 1,
    title: "Senior UX Designer",
    company: "Adobe",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Adobe_Corporate_Logo.png/800px-Adobe_Corporate_Logo.png",
    location: "San Francisco, CA",
    type: "Full-time",
    posted: "2 days ago",
    description: "Design user experiences for creative cloud products. Work with cross-functional teams to deliver exceptional designs.",
    tags: ["UX/UI", "Creative Cloud", "Adobe XD"],
    applicationUrl: "https://careers.adobe.com",
    salary: "$120,000 - $150,000",
    source: "JSearch"
  },
  {
    id: 2,
    title: "Full-Stack Developer",
    company: "Stripe",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/2560px-Stripe_Logo%2C_revised_2016.svg.png",
    location: "Remote",
    type: "Full-time",
    posted: "1 day ago",
    description: "Build and maintain payment systems. Work with modern JavaScript frameworks and Ruby on Rails.",
    tags: ["JavaScript", "Ruby", "React", "Remote"],
    applicationUrl: "https://stripe.com/jobs",
    salary: "$130,000 - $160,000",
    source: "JSearch"
  },
  {
    id: 3,
    title: "Data Scientist",
    company: "Spotify",
    logo: "https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png",
    location: "Stockholm, Sweden",
    type: "Full-time",
    posted: "3 days ago",
    description: "Analyze user behavior and music trends. Improve recommendation algorithms and user experience.",
    tags: ["Python", "Machine Learning", "SQL"],
    applicationUrl: "https://www.spotifyjobs.com/",
    source: "JSearch"
  },
  {
    id: 4,
    title: "Product Manager",
    company: "Microsoft",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2048px-Microsoft_logo.svg.png",
    location: "Redmond, WA",
    type: "Full-time",
    posted: "5 days ago",
    description: "Lead product development for Microsoft Teams. Work with engineers and designers to build innovative solutions.",
    tags: ["Product Strategy", "Agile", "SaaS"],
    applicationUrl: "https://careers.microsoft.com",
    salary: "$140,000 - $180,000",
    source: "JSearch"
  },
  {
    id: 5,
    title: "Marketing Specialist",
    company: "Airbnb",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Airbnb_Logo_B%C3%A9lo.svg/1200px-Airbnb_Logo_B%C3%A9lo.svg.png",
    location: "San Francisco, CA",
    type: "Full-time",
    posted: "1 week ago",
    description: "Develop and implement marketing campaigns for Airbnb. Analyze marketing data and optimize strategies.",
    tags: ["Digital Marketing", "Analytics", "Content Creation"],
    applicationUrl: "https://careers.airbnb.com",
    salary: "$90,000 - $120,000",
    source: "JSearch"
  },
  {
    id: 6,
    title: "DevOps Engineer",
    company: "Netflix",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1920px-Netflix_2015_logo.svg.png",
    location: "Los Gatos, CA",
    type: "Full-time",
    posted: "4 days ago",
    description: "Build and maintain infrastructure for Netflix. Implement CI/CD pipelines and ensure system reliability.",
    tags: ["AWS", "Kubernetes", "CI/CD"],
    applicationUrl: "https://jobs.netflix.com",
    salary: "$150,000 - $190,000",
    source: "JSearch"
  }
];
