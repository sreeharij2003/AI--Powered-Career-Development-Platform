export interface IScrapedJob {
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  url?: string;
  source: string;
  posted_date: Date;
  is_active: boolean;
  type: string;
  experience_level?: string;
  remote?: boolean;
  skills?: string[];
  requirements?: string[];
}

export interface IScrapeTarget {
  keyword: string;
  location: string;
} 