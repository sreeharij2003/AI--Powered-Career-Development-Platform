import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_BASE_URL = 'http://localhost:5000';

// Comprehensive list of job categories to populate
const JOB_CATEGORIES = [
  // Software Development
  'Software Engineer',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'React Developer',
  'Angular Developer',
  'Vue.js Developer',
  'Node.js Developer',
  'Python Developer',
  'Java Developer',
  'JavaScript Developer',
  'TypeScript Developer',
  'PHP Developer',
  'Ruby Developer',
  'Go Developer',
  'Rust Developer',
  'C++ Developer',
  'C# Developer',
  '.NET Developer',
  
  // Mobile Development
  'iOS Developer',
  'Android Developer',
  'React Native Developer',
  'Flutter Developer',
  'Mobile App Developer',
  
  // DevOps & Infrastructure
  'DevOps Engineer',
  'Cloud Engineer',
  'AWS Developer',
  'Azure Developer',
  'Kubernetes Engineer',
  'Docker Engineer',
  'Site Reliability Engineer',
  'Infrastructure Engineer',
  
  // Data & Analytics
  'Data Scientist',
  'Data Engineer',
  'Data Analyst',
  'Machine Learning Engineer',
  'AI Engineer',
  'Business Intelligence Analyst',
  'Database Administrator',
  'Big Data Engineer',
  
  // Cybersecurity
  'Cybersecurity Analyst',
  'Security Engineer',
  'Penetration Tester',
  'Information Security Analyst',
  'Network Security Engineer',
  
  // UI/UX & Design
  'UI/UX Designer',
  'Web Designer',
  'Graphic Designer',
  'Product Designer',
  'User Experience Designer',
  
  // Product & Management
  'Product Manager',
  'Technical Product Manager',
  'Project Manager',
  'Scrum Master',
  'Engineering Manager',
  
  // QA & Testing
  'QA Engineer',
  'Test Automation Engineer',
  'Software Tester',
  'Quality Assurance Analyst',
  
  // Specialized Roles
  'Blockchain Developer',
  'Game Developer',
  'Embedded Systems Engineer',
  'Firmware Engineer',
  'Systems Analyst',
  'Business Analyst',
  'Technical Writer',
  'Solutions Architect'
];

// Major US tech hubs for location diversity
const LOCATIONS = [
  'San Francisco, CA',
  'Seattle, WA',
  'New York, NY',
  'Austin, TX',
  'Boston, MA',
  'Denver, CO',
  'Chicago, IL',
  'Los Angeles, CA',
  'Washington, DC',
  'Atlanta, GA',
  'Remote',
  '' // No location filter
];

interface JobFetchResult {
  category: string;
  location: string;
  jobsFound: number;
  success: boolean;
  error?: string;
}

class JobPopulator {
  private results: JobFetchResult[] = [];
  private totalJobsAdded = 0;
  private delay = 2000; // 2 second delay between requests to avoid rate limiting

  async fetchJobsForCategory(category: string, location: string, limit: number = 10): Promise<JobFetchResult> {
    try {
      console.log(`🔍 Fetching ${category} jobs in ${location || 'Any Location'}...`);
      
      const response = await axios.post(`${API_BASE_URL}/api/jobs/fetch-jsearch`, {
        query: category,
        location: location,
        limit: limit
      });

      const jobsCount = response.data.jobs?.length || 0;
      this.totalJobsAdded += jobsCount;

      console.log(`✅ Found ${jobsCount} ${category} jobs in ${location || 'Any Location'}`);
      
      return {
        category,
        location: location || 'Any Location',
        jobsFound: jobsCount,
        success: true
      };
    } catch (error: any) {
      console.error(`❌ Error fetching ${category} jobs in ${location}: ${error.message}`);
      return {
        category,
        location: location || 'Any Location',
        jobsFound: 0,
        success: false,
        error: error.message
      };
    }
  }

  async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async populateAllJobs(): Promise<void> {
    console.log('🚀 Starting comprehensive job population...');
    console.log(`📊 Will fetch jobs for ${JOB_CATEGORIES.length} categories across ${LOCATIONS.length} locations`);
    console.log(`⏱️  Estimated time: ${Math.ceil((JOB_CATEGORIES.length * LOCATIONS.length * this.delay) / 1000 / 60)} minutes\n`);

    let requestCount = 0;
    const totalRequests = JOB_CATEGORIES.length * LOCATIONS.length;

    for (const category of JOB_CATEGORIES) {
      for (const location of LOCATIONS) {
        requestCount++;
        console.log(`\n📈 Progress: ${requestCount}/${totalRequests} (${Math.round((requestCount/totalRequests)*100)}%)`);
        
        const result = await this.fetchJobsForCategory(category, location, 10);
        this.results.push(result);

        // Add delay to avoid rate limiting
        if (requestCount < totalRequests) {
          console.log(`⏳ Waiting ${this.delay/1000} seconds before next request...`);
          await this.sleep(this.delay);
        }
      }
    }

    this.printSummary();
  }

  printSummary(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 JOB POPULATION SUMMARY');
    console.log('='.repeat(60));
    
    const successful = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);
    
    console.log(`✅ Successful requests: ${successful.length}`);
    console.log(`❌ Failed requests: ${failed.length}`);
    console.log(`🎯 Total jobs added to database: ${this.totalJobsAdded}`);
    
    if (failed.length > 0) {
      console.log('\n❌ Failed Categories:');
      failed.forEach(f => {
        console.log(`   - ${f.category} in ${f.location}: ${f.error}`);
      });
    }
    
    // Top performing categories
    const topCategories = successful
      .sort((a, b) => b.jobsFound - a.jobsFound)
      .slice(0, 10);
    
    console.log('\n🏆 Top 10 Categories by Jobs Found:');
    topCategories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.category} (${cat.location}): ${cat.jobsFound} jobs`);
    });
    
    console.log('\n🎉 Job population completed!');
    console.log(`💾 Your database now has ${this.totalJobsAdded} additional real jobs for resume matching!`);
  }
}

// Main execution
async function main() {
  const populator = new JobPopulator();
  await populator.populateAllJobs();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { JobPopulator };
