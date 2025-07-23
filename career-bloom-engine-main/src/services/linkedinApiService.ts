import { JobListing } from "@/types/jobs";

// This service is now deprecated - job fetching is handled by the backend
// Keeping only mock data and utility functions for backward compatibility

interface LinkedInJob {
  job_id?: string;
  id?: string;
  title?: string;
  company_name?: string;
  company?: string;
  company_url?: string;
  location?: string;
  job_url?: string;
  url?: string;
  posted_date?: string;
  date?: string;
  description?: string;
  company_logo_url?: string;
  logo?: string;
  employment_type?: string;
  job_type?: string;
  salary_range?: string;
  salary?: string;
  skills?: string[];
  [key: string]: any;
}

// Mock data to use when API is not available
const mockLinkedInJobs = [
  {
    job_id: "1001",
    title: "Senior Software Engineer",
    company_name: "Microsoft",
    location: "Remote, United States",
    job_url: "https://www.linkedin.com/jobs/view/senior-software-engineer",
    posted_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    description: "We're looking for an experienced software engineer to join our team. You'll be working on cutting-edge technology and solving complex problems.",
    company_logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2048px-Microsoft_logo.svg.png",
    employment_type: "Full-Time",
    skills: ["JavaScript", "React", "Node.js", "AWS", "TypeScript"]
  },
  {
    job_id: "1002",
    title: "Frontend Developer",
    company_name: "Google",
    location: "New York, NY",
    job_url: "https://www.linkedin.com/jobs/view/frontend-developer",
    posted_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Join our team to build beautiful, responsive web applications that millions of people use every day.",
    company_logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/2048px-Google_%22G%22_Logo.svg.png",
    employment_type: "Full-Time",
    skills: ["HTML", "CSS", "JavaScript", "React", "UI/UX"]
  },
  {
    job_id: "1003",
    title: "Backend Engineer",
    company_name: "Amazon",
    location: "Seattle, WA",
    job_url: "https://www.linkedin.com/jobs/view/backend-engineer",
    posted_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Design and implement scalable backend systems that power Amazon's global infrastructure.",
    company_logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png",
    employment_type: "Full-Time",
    skills: ["Java", "Python", "AWS", "Microservices", "Distributed Systems"]
  },
  {
    job_id: "1004",
    title: "DevOps Engineer",
    company_name: "Netflix",
    location: "Remote",
    job_url: "https://www.linkedin.com/jobs/view/devops-engineer",
    posted_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Help build and maintain the infrastructure that powers Netflix's global streaming service.",
    company_logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png",
    employment_type: "Full-Time",
    skills: ["Kubernetes", "Docker", "CI/CD", "AWS", "Terraform"]
  },
  {
    job_id: "1005",
    title: "Data Scientist",
    company_name: "Facebook",
    location: "Menlo Park, CA",
    job_url: "https://www.linkedin.com/jobs/view/data-scientist",
    posted_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Analyze large datasets to extract insights and build machine learning models that improve user experience.",
    company_logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Facebook_f_logo_%282019%29.svg/2048px-Facebook_f_logo_%282019%29.svg.png",
    employment_type: "Full-Time",
    skills: ["Python", "SQL", "Machine Learning", "Data Analysis", "Statistics"]
  }
];

// Simplified service - API calls now handled by backend
class LinkedInApiService {
  // Deprecated: API calls are now handled by the backend
  setApiKey(key: string) {
    console.log('LinkedInApiService.setApiKey is deprecated - API calls now handled by backend');
  }
  
  // Deprecated: Job search is now handled by the backend
  async searchJobs(query: string, location: string = ''): Promise<{ jobs: LinkedInJob[] }> {
    console.log('LinkedInApiService.searchJobs is deprecated - job search now handled by backend');
    console.log('Returning mock data for backward compatibility');
    return this.getMockJobsResponse(query, location);
  }
  
  // Get filtered mock data based on search query
  private getMockJobsResponse(query: string, location: string): { jobs: LinkedInJob[] } {
    console.log(`Generating mock data for query: ${query}, location: ${location}`);
    
    // Filter mock data based on query and location
    let filteredJobs = [...mockLinkedInJobs];
    
    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(lowerQuery) || 
        job.description.toLowerCase().includes(lowerQuery) ||
        job.company_name.toLowerCase().includes(lowerQuery) ||
        job.skills.some(skill => skill.toLowerCase().includes(lowerQuery))
      );
    }
    
    if (location) {
      const lowerLocation = location.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(lowerLocation)
      );
    }
    
    return {
      jobs: filteredJobs
    };
  }
  
  convertToAppJobFormat(job: LinkedInJob): JobListing {
    console.log('Converting job to app format:', job.job_id || job.id, job.title);
    
    try {
      // Extract fields with fallbacks for different field names
      const jobId = job.job_id || job.id || String(Math.floor(Math.random() * 100000));
      const title = job.title || 'Unknown Title';
      const company = job.company_name || job.company || 'Unknown Company';
      const logo = job.company_logo_url || job.logo || '';
      const location = job.location || 'Unknown Location';
      const applicationUrl = job.job_url || job.url || '#';
      const description = job.description || 'No description available';
      const postedDate = this.formatPostedDate(job.posted_date || job.date || '');
      const jobType = job.employment_type || job.job_type || this.guessJobType(title, description);
      const salary = job.salary_range || job.salary || '';
      
      // Extract tags from skills or description
      const tags = job.skills || this.extractTagsFromDescription(description);
      
      const result: JobListing = {
        id: parseInt(jobId) || Math.floor(Math.random() * 100000),
        title,
        company,
        logo,
        location,
        type: jobType,
        posted: postedDate,
        description,
        tags,
        applicationUrl,
        salary,
        source: 'JSearch'
      };
      
      return result;
    } catch (error) {
      console.error('Error converting job to app format:', error);
      
      // Return a fallback job object to prevent crashes
      return {
        id: Math.floor(Math.random() * 100000),
        title: job.title || 'Unknown Title',
        company: job.company_name || job.company || 'Unknown Company',
        logo: '',
        location: job.location || 'Unknown Location',
        type: 'Full-Time',
        posted: 'Recently',
        description: job.description || 'No description available',
        tags: [],
        applicationUrl: job.job_url || job.url || '#',
        source: 'JSearch'
      };
    }
  }
  
  private formatPostedDate(dateString: string): string {
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
  }
  
  private extractTagsFromDescription(description: string): string[] {
    const commonTechTags = [
      'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js',
      'Python', 'Java', 'C#', '.NET', 'AWS', 'Azure', 'GCP', 'Docker',
      'Kubernetes', 'DevOps', 'CI/CD', 'SQL', 'NoSQL', 'MongoDB',
      'GraphQL', 'REST', 'API', 'Frontend', 'Backend', 'Full-Stack',
      'Remote', 'Hybrid'
    ];
    
    const tags: string[] = [];
    
    commonTechTags.forEach(tag => {
      if (description.includes(tag)) {
        tags.push(tag);
      }
    });
    
    // Limit to 5 tags
    return tags.slice(0, 5);
  }
  
  private guessJobType(title: string, description: string): string {
    const text = `${title} ${description}`.toLowerCase();
    
    if (text.includes('part-time') || text.includes('part time')) {
      return 'Part-Time';
    } else if (text.includes('contract') || text.includes('contractor')) {
      return 'Contract';
    } else if (text.includes('intern') || text.includes('internship')) {
      return 'Internship';
    } else if (text.includes('remote')) {
      return 'Remote Full-Time';
    } else {
      return 'Full-Time';
    }
  }
}

const linkedinApiService = new LinkedInApiService();
export default linkedinApiService; 