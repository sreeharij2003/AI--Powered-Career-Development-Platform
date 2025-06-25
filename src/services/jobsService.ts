import { JobFilters, JobListing } from "@/types/jobs";
import { API_BASE_URL } from "./api";
import { getApiKey } from './apiKeyService';
import linkedinApiService from './linkedinApiService';

// Fetch jobs with filters - integrates JSearch API when available
export const fetchJobs = async (filters?: JobFilters): Promise<JobListing[]> => {
  console.log("Fetching jobs with filters:", filters);
  
  // Check if API key exists
  const apiKey = getApiKey();
  
  if (apiKey) {
    try {
      // Use JSearch API if key is available
      linkedinApiService.setApiKey(apiKey);
      const keyword = filters?.jobType?.includes('Remote') ? 'remote developer' : 'developer';
      const location = filters?.location || '';
      console.log(`Attempting to fetch jobs with keyword: ${keyword}, location: ${location}`);
      
      const response = await linkedinApiService.searchJobs(keyword, location);
      
      // Check if we got valid jobs back
      if (response.jobs && response.jobs.length > 0) {
        console.log(`Successfully fetched ${response.jobs.length} jobs from JSearch API`);
        // Convert JSearch jobs to app format and return
        const convertedJobs = response.jobs.map(job => linkedinApiService.convertToAppJobFormat(job));
        
        // Apply any additional filters that weren't handled by the API
        return filterJobs(convertedJobs, filters);
      } else {
        console.log('JSearch API returned no jobs, falling back to mock data');
        return filterJobs(mockJobs, filters);
      }
    } catch (error) {
      console.error('Error fetching jobs from JSearch API:', error);
      // Fall back to mock data or API
      console.log('Falling back to mock data due to API error');
      return filterJobs(mockJobs, filters);
    }
  }
  
  // If no API key or API call failed, fall back to regular API or mock data
  try {
    const response = await fetch(`${API_BASE_URL}/jobs`);
    
    if (!response.ok) {
      throw new Error(`Error fetching jobs: ${response.statusText}`);
    }
    
    const jobs = await response.json();
    return filterJobs(jobs, filters);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    // Fallback to mock data if API fails
    return filterJobs(mockJobs, filters);
  }
};

export const fetchFeaturedJobs = async (): Promise<JobListing[]> => {
  try {
    // Check if API key exists
    const apiKey = getApiKey();
    
    if (apiKey) {
      try {
        // Use JSearch API if key is available
        linkedinApiService.setApiKey(apiKey);
        const response = await linkedinApiService.searchJobs('featured developer jobs');
        
        // Check if we got valid jobs back
        if (response.jobs && response.jobs.length > 0) {
          // Convert JSearch jobs to app format and return top 4
          const convertedJobs = response.jobs
            .map(job => linkedinApiService.convertToAppJobFormat(job))
            .slice(0, 4);
          
          return convertedJobs;
        }
      } catch (error) {
        console.error('Error fetching featured jobs from JSearch API:', error);
      }
    }
    
    // Fall back to regular API if no API key or API call failed
    const response = await fetch(`${API_BASE_URL}/jobs/featured`);
    
    if (!response.ok) {
      throw new Error(`Error fetching featured jobs: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching featured jobs:", error);
    // Fallback to mock data if API fails
    return mockJobs.slice(0, 4);
  }
};

// Search jobs with keyword and filters - integrates JSearch API when available
export const searchJobs = async (searchTerm: string, filters?: JobFilters): Promise<JobListing[]> => {
  console.log(`Searching for "${searchTerm}" with filters:`, filters);
  
  // Check if API key exists
  const apiKey = getApiKey();
  
  if (apiKey && searchTerm) {
    try {
      // Use JSearch API for search if key is available
      linkedinApiService.setApiKey(apiKey);
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
      
      console.log(`Attempting to search jobs with query: ${query}`);
      
      const response = await linkedinApiService.searchJobs(query);
      
      // Check if we got valid jobs back
      if (response.jobs && response.jobs.length > 0) {
        console.log(`Successfully found ${response.jobs.length} jobs matching "${searchTerm}"`);
        // Convert JSearch jobs to app format
        const convertedJobs = response.jobs.map(job => linkedinApiService.convertToAppJobFormat(job));
        
        // Apply any additional filters that weren't handled by the API
        return filterJobs(convertedJobs, filters);
      } else {
        console.log(`JSearch API returned no jobs for search term "${searchTerm}", falling back to local search`);
        // Fall back to regular search if API returns no results
      }
    } catch (error) {
      console.error('Error searching jobs with JSearch API:', error);
      console.log('Falling back to local search due to API error');
      // Fall back to regular search if API fails
    }
  }
  
  // If no API key or API call failed, fall back to regular search
  try {
    // For now, we'll handle search on the client side as we don't have a dedicated search endpoint
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
  } catch (error) {
    console.error("Error searching jobs:", error);
    return [];
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
