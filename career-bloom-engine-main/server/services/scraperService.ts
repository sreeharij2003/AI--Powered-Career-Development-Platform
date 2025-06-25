import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';
import { setTimeout } from 'timers/promises';
import { IScrapedJob } from '../types/job.types';
import jobService from './jobService';
import linkedinScraperService from './linkedinScraperService';

class ScraperService {
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
  ];

  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  private async makeRequest(url: string): Promise<string | null> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive',
        },
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(`Error fetching ${url}:`, axiosError.message);
      return null;
    }
  }

  // LinkedIn Jobs Scraper using the Python implementation
  async scrapeLinkedInJobs(keyword: string, location: string, limit: number = 25): Promise<IScrapedJob[]> {
    try {
      // Check if dependencies are installed
      const dependenciesInstalled = await linkedinScraperService.checkDependencies();
      if (!dependenciesInstalled) {
        console.warn('LinkedIn scraper dependencies are not properly installed. Falling back to basic scraper.');
        return this.scrapeLinkedInJobsBasic(keyword, location);
      }
      
      // Use the Python-based LinkedIn scraper
      return await linkedinScraperService.scrapeLinkedInJobs(keyword, location, limit);
    } catch (error) {
      console.error('Error using Python LinkedIn scraper, falling back to basic scraper:', error);
      return this.scrapeLinkedInJobsBasic(keyword, location);
    }
  }

  // Basic LinkedIn Jobs Scraper (fallback)
  async scrapeLinkedInJobsBasic(keyword: string, location: string): Promise<IScrapedJob[]> {
    try {
      const baseUrl = location
        ? `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}`
        : `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(keyword)}`;
      const html = await this.makeRequest(baseUrl);
      if (!html) return [];

      const $ = cheerio.load(html);
      const jobs: IScrapedJob[] = [];

      $('.job-search-card').each((_, element) => {
        const job: IScrapedJob = {
          title: $(element).find('.job-search-card__title').text().trim(),
          company: $(element).find('.job-search-card__company-name').text().trim(),
          location: $(element).find('.job-search-card__location').text().trim(),
          description: $(element).find('.job-search-card__description').text().trim(),
          url: $(element).find('a.job-search-card__link').attr('href'),
          source: 'LinkedIn',
          posted_date: new Date(),
          is_active: true,
          type: 'full-time',
        };

        if (job.title && job.company) {
          jobs.push(job);
        }
      });

      return jobs;
    } catch (error) {
      console.error('Error scraping LinkedIn jobs:', error);
      return [];
    }
  }

  // Indeed Jobs Scraper
  async scrapeIndeedJobs(keyword: string, location: string): Promise<IScrapedJob[]> {
    try {
      const baseUrl = location
        ? `https://www.indeed.com/jobs?q=${encodeURIComponent(keyword)}&l=${encodeURIComponent(location)}`
        : `https://www.indeed.com/jobs?q=${encodeURIComponent(keyword)}`;
      const html = await this.makeRequest(baseUrl);
      if (!html) return [];

      const $ = cheerio.load(html);
      const jobs: IScrapedJob[] = [];

      $('.job_seen_beacon').each((_, element) => {
        const job: IScrapedJob = {
          title: $(element).find('.jobTitle').text().trim(),
          company: $(element).find('.companyName').text().trim(),
          location: $(element).find('.companyLocation').text().trim(),
          description: $(element).find('.job-snippet').text().trim(),
          salary: $(element).find('.salary-snippet').text().trim() || undefined,
          url: 'https://www.indeed.com' + $(element).find('a').attr('href'),
          source: 'Indeed',
          posted_date: new Date(),
          is_active: true,
          type: 'full-time',
        };

        if (job.title && job.company) {
          jobs.push(job);
        }
      });

      return jobs;
    } catch (error) {
      console.error('Error scraping Indeed jobs:', error);
      return [];
    }
  }

  // Naukri Jobs Scraper
  async scrapeNaukriJobs(keyword: string, location: string): Promise<IScrapedJob[]> {
    try {
      const baseUrl = location
        ? `https://www.naukri.com/${encodeURIComponent(keyword)}-jobs-in-${encodeURIComponent(location)}`
        : `https://www.naukri.com/${encodeURIComponent(keyword)}-jobs`;
      const html = await this.makeRequest(baseUrl);
      if (!html) return [];

      const $ = cheerio.load(html);
      const jobs: IScrapedJob[] = [];

      $('.jobTuple').each((_, element) => {
        const job: IScrapedJob = {
          title: $(element).find('.title').text().trim(),
          company: $(element).find('.companyInfo').text().trim(),
          location: $(element).find('.location').text().trim(),
          description: $(element).find('.job-description').text().trim(),
          experience_level: $(element).find('.experience').text().trim(),
          salary: $(element).find('.salary').text().trim() || undefined,
          url: $(element).find('a.title').attr('href'),
          source: 'Naukri',
          posted_date: new Date(),
          is_active: true,
          type: 'full-time',
        };

        if (job.title && job.company) {
          jobs.push(job);
        }
      });

      return jobs;
    } catch (error) {
      console.error('Error scraping Naukri jobs:', error);
      return [];
    }
  }

  // Main method to scrape jobs from all sources
  async scrapeJobs(keyword: string, location: string): Promise<IScrapedJob[]> {
    try {
      console.log(`Starting job scraping for ${keyword} in ${location}...`);
      
      // Scrape from all sources with delay between requests
      const linkedInJobs = await this.scrapeLinkedInJobs(keyword, location, 25);
      await setTimeout(2000); // 2 second delay between requests
      
      const indeedJobs = await this.scrapeIndeedJobs(keyword, location);
      await setTimeout(2000);
      
      const naukriJobs = await this.scrapeNaukriJobs(keyword, location);

      // Combine all jobs
      const allJobs = [...linkedInJobs, ...indeedJobs, ...naukriJobs];
      
      if (allJobs.length > 0) {
        // Store jobs in database
        await jobService.createManyJobs(allJobs);
        console.log(`Successfully scraped and stored ${allJobs.length} jobs`);
      } else {
        console.log('No jobs found from any source');
      }

      return allJobs;
    } catch (error) {
      const e = error as Error;
      console.error('Error in scrapeJobs:', e.message);
      throw e;
    }
  }
}

export default new ScraperService(); 