#!/usr/bin/env python3
import json
import logging
import sys
import os
from datetime import datetime
from linkedin_jobs_scraper import LinkedinScraper
from linkedin_jobs_scraper.events import Events, EventData, EventMetrics
from linkedin_jobs_scraper.query import Query, QueryOptions, QueryFilters
from linkedin_jobs_scraper.filters import (
    RelevanceFilters,
    TimeFilters,
    TypeFilters,
    ExperienceLevelFilters,
    OnSiteOrRemoteFilters
)

# Configure logging
logging.basicConfig(level=logging.INFO)

# List to store scraped jobs
jobs = []

# Event callbacks
def on_data(data: EventData):
    # Convert date string to Date object if available
    posted_date = datetime.now()
    if data.date_text:
        try:
            # Handle relative date formats like "1 day ago", "2 weeks ago", etc.
            if "day" in data.date_text:
                days = int(data.date_text.split()[0])
                from datetime import timedelta
                posted_date = datetime.now() - timedelta(days=days)
            elif "week" in data.date_text:
                weeks = int(data.date_text.split()[0])
                from datetime import timedelta
                posted_date = datetime.now() - timedelta(weeks=weeks)
            elif "month" in data.date_text:
                months = int(data.date_text.split()[0])
                from datetime import timedelta
                posted_date = datetime.now() - timedelta(days=months*30)
        except:
            pass

    # Determine if job is remote
    remote = False
    if data.place and ("remote" in data.place.lower() or "anywhere" in data.place.lower()):
        remote = True

    # Extract skills from description (simple keyword extraction)
    skills = []
    common_skills = ["python", "javascript", "react", "node.js", "java", "c#", "sql", "nosql", 
                    "mongodb", "aws", "azure", "docker", "kubernetes", "git", "agile", "scrum",
                    "typescript", "html", "css", "php", "ruby", "swift", "kotlin", "flutter",
                    "angular", "vue.js", "django", "flask", "spring", ".net", "rest api", "graphql"]
    
    description_lower = data.description.lower()
    for skill in common_skills:
        if skill in description_lower:
            skills.append(skill)

    # Determine job type
    job_type = "Full-time"  # Default
    if data.description:
        desc_lower = data.description.lower()
        if "part-time" in desc_lower or "part time" in desc_lower:
            job_type = "Part-time"
        elif "contract" in desc_lower or "contractor" in desc_lower:
            job_type = "Contract"
        elif "intern" in desc_lower or "internship" in desc_lower:
            job_type = "Internship"

    # Create job object
    job = {
        "title": data.title,
        "company": data.company,
        "location": data.place,
        "remote": remote,
        "description": data.description,
        "url": data.link,
        "source": "LinkedIn",
        "posted_date": posted_date.isoformat(),
        "is_active": True,
        "type": job_type,
        "skills": skills
    }

    # Add salary if available in insights
    if data.insights and any("salary" in insight.lower() for insight in data.insights):
        for insight in data.insights:
            if "salary" in insight.lower():
                job["salary"] = insight
                break

    jobs.append(job)
    logging.info(f"Scraped job: {data.title} at {data.company}")

def on_error(error):
    logging.error(f"Error: {error}")

def on_end():
    logging.info(f"Scraping finished. Total jobs found: {len(jobs)}")

def scrape_linkedin_jobs(keyword, location, limit=25):
    """
    Scrape LinkedIn jobs based on keyword and location
    
    Args:
        keyword (str): Job title or keyword to search for
        location (str): Location to search in
        limit (int): Maximum number of jobs to scrape
        
    Returns:
        list: List of scraped job objects
    """
    # Clear global jobs list
    global jobs
    jobs = []
    
    # Initialize the scraper
    scraper = LinkedinScraper(
        chrome_executable_path=None,  # Will use default ChromeDriver path
        chrome_options=None,  # Default Chrome options
        headless=True,
        slow_mo=1.3,  # Slow down to avoid getting blocked
        max_workers=1  # Just one worker to avoid rate limiting
    )

    # Add event listeners
    scraper.on(Events.DATA, on_data)
    scraper.on(Events.ERROR, on_error)
    scraper.on(Events.END, on_end)

    # Define the search query
    query = Query(
        query=keyword,
        options=QueryOptions(
            locations=[location],
            apply_link=False,  # Don't try to extract apply link to speed up scraping
            skip_promoted_jobs=True,  # Skip promoted jobs
            limit=limit,
            filters=QueryFilters(
                relevance=RelevanceFilters.RECENT,
                time=TimeFilters.MONTH,
                type=[TypeFilters.FULL_TIME, TypeFilters.PART_TIME, TypeFilters.CONTRACT, TypeFilters.TEMPORARY],
                on_site_or_remote=[OnSiteOrRemoteFilters.REMOTE, OnSiteOrRemoteFilters.HYBRID, OnSiteOrRemoteFilters.ON_SITE],
                experience=[
                    ExperienceLevelFilters.INTERNSHIP,
                    ExperienceLevelFilters.ENTRY_LEVEL,
                    ExperienceLevelFilters.ASSOCIATE,
                    ExperienceLevelFilters.MID_SENIOR
                ]
            )
        )
    )

    # Run the scraper with the query
    try:
        scraper.run([query])
    finally:
        scraper.close()
    
    return jobs

if __name__ == "__main__":
    # Check if keyword and location are provided as command line arguments
    if len(sys.argv) < 3:
        print("Usage: python linkedin_scraper.py <keyword> <location> [limit]")
        sys.exit(1)
    
    keyword = sys.argv[1]
    location = sys.argv[2]
    limit = int(sys.argv[3]) if len(sys.argv) > 3 else 25
    
    # Run the scraper
    scraped_jobs = scrape_linkedin_jobs(keyword, location, limit)
    
    # Write results to a JSON file
    output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    os.makedirs(output_dir, exist_ok=True)
    
    output_file = os.path.join(output_dir, f"linkedin_jobs_{keyword}_{location}.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(scraped_jobs, f, ensure_ascii=False, indent=2)
    
    print(f"Scraped {len(scraped_jobs)} jobs. Results saved to {output_file}") 