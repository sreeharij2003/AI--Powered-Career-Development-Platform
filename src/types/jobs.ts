
export interface JobListing {
  id: string | number;
  title: string;
  company: string;
  logo?: string;
  location: string;
  type: string;
  posted: string;
  description: string;
  tags?: string[];
  applicationUrl: string;
  salary?: string;
  source?: string; // which site the job was scraped from
}

export interface JobFilters {
  location?: string;
  jobType?: string[];
  experienceLevel?: string[];
  industry?: string[];
}
