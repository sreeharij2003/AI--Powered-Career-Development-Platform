#!/usr/bin/env python3
import sys
import os
import json

def main():
    """
    Test script to verify that the LinkedIn scraper is working correctly.
    Usage: python test_linkedin_scraper.py <keyword> <location> [limit]
    """
    # Check command line arguments
    if len(sys.argv) < 3:
        print("Usage: python test_linkedin_scraper.py <keyword> <location> [limit]")
        print("Example: python test_linkedin_scraper.py 'Software Developer' 'San Francisco' 5")
        sys.exit(1)
    
    # Get command line arguments
    keyword = sys.argv[1]
    location = sys.argv[2]
    limit = int(sys.argv[3]) if len(sys.argv) > 3 else 5  # Default to 5 jobs for testing
    
    print(f"Testing LinkedIn scraper with keyword='{keyword}', location='{location}', limit={limit}")
    
    try:
        # Import the scrape_linkedin_jobs function from the linkedin_scraper module
        sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        from scripts.linkedin_scraper import scrape_linkedin_jobs
        
        # Run the scraper
        jobs = scrape_linkedin_jobs(keyword, location, limit)
        
        # Print results
        print(f"\nScraping completed! Found {len(jobs)} jobs.")
        
        if len(jobs) > 0:
            print("\nFirst job details:")
            first_job = jobs[0]
            print(f"Title: {first_job['title']}")
            print(f"Company: {first_job['company']}")
            print(f"Location: {first_job['location']}")
            print(f"Remote: {first_job['remote']}")
            print(f"Type: {first_job['type']}")
            print(f"Skills: {', '.join(first_job['skills'])}")
            print(f"URL: {first_job['url']}")
            
            # Save results to a test file
            output_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                                      "data", "test_linkedin_jobs.json")
            os.makedirs(os.path.dirname(output_file), exist_ok=True)
            
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(jobs, f, ensure_ascii=False, indent=2)
            
            print(f"\nResults saved to {output_file}")
        
        return 0  # Success
    except ImportError as e:
        print(f"Error importing scraper module: {e}")
        print("Make sure linkedin-jobs-scraper is installed: pip install linkedin-jobs-scraper")
        return 1
    except Exception as e:
        print(f"Error running LinkedIn scraper: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 