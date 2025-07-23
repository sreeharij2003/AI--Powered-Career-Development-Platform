import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_BASE_URL = 'http://localhost:5000';

// Quick list of high-demand job categories for testing
const QUICK_JOB_CATEGORIES = [
  'Software Engineer',
  'Full Stack Developer',
  'React Developer',
  'Python Developer',
  'Data Scientist',
  'DevOps Engineer',
  'Product Manager',
  'UI/UX Designer',
  'Machine Learning Engineer',
  'Cloud Engineer'
];

// Fewer locations for quick testing
const QUICK_LOCATIONS = [
  'San Francisco, CA',
  'New York, NY',
  'Seattle, WA',
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

class QuickJobPopulator {
  private results: JobFetchResult[] = [];
  private totalJobsAdded = 0;
  private delay = 1500; // 1.5 second delay for quick testing

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

  async quickPopulate(): Promise<void> {
    console.log('🚀 Starting QUICK job population for resume matching...');
    console.log(`📊 Will fetch jobs for ${QUICK_JOB_CATEGORIES.length} categories across ${QUICK_LOCATIONS.length} locations`);
    console.log(`⏱️  Estimated time: ${Math.ceil((QUICK_JOB_CATEGORIES.length * QUICK_LOCATIONS.length * this.delay) / 1000 / 60)} minutes\n`);

    let requestCount = 0;
    const totalRequests = QUICK_JOB_CATEGORIES.length * QUICK_LOCATIONS.length;

    for (const category of QUICK_JOB_CATEGORIES) {
      for (const location of QUICK_LOCATIONS) {
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
    console.log('📊 QUICK JOB POPULATION SUMMARY');
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
      .slice(0, 5);
    
    console.log('\n🏆 Top 5 Categories by Jobs Found:');
    topCategories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.category} (${cat.location}): ${cat.jobsFound} jobs`);
    });
    
    console.log('\n🎉 Quick job population completed!');
    console.log(`💾 Your database now has ${this.totalJobsAdded} additional real jobs for resume matching!`);
    console.log('🔍 Users can now upload resumes and get matched against these real job opportunities!');
  }
}

// Main execution
async function main() {
  const populator = new QuickJobPopulator();
  await populator.quickPopulate();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { QuickJobPopulator };
