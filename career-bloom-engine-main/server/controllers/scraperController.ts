import { Request, Response } from 'express';
import linkedinScraperService from '../services/linkedinScraperService';
import scraperService from '../services/scraperService';
import { IScrapeTarget } from '../types/job.types';

class ScraperController {
  async scrapeJobs(req: Request, res: Response) {
    try {
      const { keyword, location } = req.body as IScrapeTarget;

      if (!keyword || !location) {
        return res.status(400).json({ 
          error: 'Both keyword and location are required' 
        });
      }

      console.log(`Starting job scraping for ${keyword} in ${location}`);
      const jobs = await scraperService.scrapeJobs(keyword, location);

      res.json({
        message: `Successfully scraped ${jobs.length} jobs`,
        jobsFound: jobs.length,
        sources: [...new Set(jobs.map(job => job.source))],
      });
    } catch (error) {
      const e = error as Error;
      console.error('Error in scrapeJobs controller:', e);
      res.status(500).json({ 
        error: 'Failed to scrape jobs',
        message: e.message 
      });
    }
  }

  async scrapeLinkedInJobs(req: Request, res: Response) {
    try {
      const { keyword, location, limit } = req.body as IScrapeTarget & { limit?: number };

      if (!keyword || !location) {
        return res.status(400).json({ 
          error: 'Both keyword and location are required' 
        });
      }

      console.log(`Starting LinkedIn job scraping for ${keyword} in ${location}`);
      const jobs = await linkedinScraperService.scrapeLinkedInJobs(keyword, location, limit || 25);

      res.json({
        message: `Successfully scraped ${jobs.length} LinkedIn jobs`,
        jobsFound: jobs.length,
        source: 'LinkedIn'
      });
    } catch (error) {
      const e = error as Error;
      console.error('Error in scrapeLinkedInJobs controller:', e);
      res.status(500).json({ 
        error: 'Failed to scrape LinkedIn jobs',
        message: e.message 
      });
    }
  }

  async checkScraperDependencies(req: Request, res: Response) {
    try {
      const dependenciesInstalled = await linkedinScraperService.checkDependencies();
      
      res.json({
        dependenciesInstalled,
        message: dependenciesInstalled 
          ? 'LinkedIn scraper dependencies are properly installed' 
          : 'LinkedIn scraper dependencies are not properly installed'
      });
    } catch (error) {
      const e = error as Error;
      console.error('Error checking scraper dependencies:', e);
      res.status(500).json({ 
        error: 'Failed to check scraper dependencies',
        message: e.message 
      });
    }
  }
}

export default new ScraperController(); 