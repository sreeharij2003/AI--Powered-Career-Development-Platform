import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { IScrapedJob } from '../types/job.types';
import jobService from './jobService';

class LinkedinScraperService {
  /**
   * Scrape LinkedIn jobs using the Python script
   * 
   * @param keyword - Job title or keyword to search for
   * @param location - Location to search in
   * @param limit - Maximum number of jobs to scrape
   * @returns Promise<IScrapedJob[]> - List of scraped jobs
   */
  async scrapeLinkedInJobs(keyword: string, location: string, limit: number = 25): Promise<IScrapedJob[]> {
    try {
      console.log(`Starting LinkedIn job scraping for ${keyword} in ${location}...`);
      
      // Path to the Python script
      const scriptPath = path.join(__dirname, '..', 'scripts', 'linkedin_scraper.py');
      
      // Execute the Python script
      const command = `python "${scriptPath}" "${keyword}" "${location}" ${limit}`;
      
      return new Promise<IScrapedJob[]>((resolve, reject) => {
        exec(command, async (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing LinkedIn scraper: ${error.message}`);
            reject(error);
            return;
          }
          
          if (stderr) {
            console.warn(`LinkedIn scraper stderr: ${stderr}`);
          }
          
          console.log(`LinkedIn scraper stdout: ${stdout}`);
          
          try {
            // Read the output JSON file
            const outputFile = path.join(__dirname, '..', 'data', `linkedin_jobs_${keyword}_${location}.json`);
            const fileContent = await fs.readFile(outputFile, 'utf-8');
            const jobs: IScrapedJob[] = JSON.parse(fileContent);
            
            // Process and store jobs
            if (jobs.length > 0) {
              // Convert string dates to Date objects
              const processedJobs = jobs.map(job => ({
                ...job,
                posted_date: new Date(job.posted_date),
              }));
              
              // Store jobs in database
              await jobService.createManyJobs(processedJobs);
              console.log(`Successfully stored ${jobs.length} LinkedIn jobs in the database`);
            } else {
              console.log('No LinkedIn jobs found');
            }
            
            resolve(jobs);
          } catch (readError) {
            console.error(`Error reading LinkedIn scraper output: ${readError}`);
            reject(readError);
          }
        });
      });
    } catch (error) {
      console.error('Error in scrapeLinkedInJobs:', error);
      throw error;
    }
  }
  
  /**
   * Check if Chrome and ChromeDriver are installed
   * @returns Promise<boolean> - True if dependencies are installed
   */
  async checkDependencies(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      exec('python -c "from selenium import webdriver; print(\'OK\')"', (error) => {
        if (error) {
          console.error('Selenium is not properly installed:', error.message);
          resolve(false);
          return;
        }
        
        // Try to create a Chrome webdriver instance
        exec('python -c "from selenium import webdriver; from selenium.webdriver.chrome.options import Options; options = Options(); options.add_argument(\'--headless\'); driver = webdriver.Chrome(options=options); driver.quit(); print(\'OK\')"', (driverError) => {
          if (driverError) {
            console.error('ChromeDriver is not properly installed or configured:', driverError.message);
            resolve(false);
            return;
          }
          
          resolve(true);
        });
      });
    });
  }
}

export default new LinkedinScraperService(); 