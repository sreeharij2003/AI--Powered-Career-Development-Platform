import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_BASE_URL = 'http://localhost:5000';

// Job categories that are commonly found on resumes
const RESUME_FOCUSED_CATEGORIES = [
  // Programming Languages
  'JavaScript Developer',
  'Python Developer', 
  'Java Developer',
  'C# Developer',
  'PHP Developer',
  'Ruby Developer',
  'Go Developer',
  'Rust Developer',
  
  // Frontend Technologies
  'React Developer',
  'Angular Developer',
  'Vue.js Developer',
  'Frontend Developer',
  'UI Developer',
  'Web Developer',
  
  // Backend Technologies
  'Backend Developer',
  'Node.js Developer',
  'API Developer',
  'Microservices Developer',
  
  // Full Stack
  'Full Stack Developer',
  'MEAN Stack Developer',
  'MERN Stack Developer',
  
  // Data & Analytics
  'Data Scientist',
  'Data Engineer',
  'Data Analyst',
  'Business Intelligence Analyst',
  'Machine Learning Engineer',
  'AI Engineer',
  
  // Cloud & DevOps
  'Cloud Engineer',
  'AWS Developer',
  'Azure Developer',
  'DevOps Engineer',
  'Site Reliability Engineer',
  'Infrastructure Engineer',
  
  // Mobile Development
  'Mobile Developer',
  'iOS Developer',
  'Android Developer',
  'React Native Developer',
  'Flutter Developer',
  
  // Specialized Roles
  'Database Administrator',
  'System Administrator',
  'Network Engineer',
  'Cybersecurity Analyst',
  'QA Engineer',
  'Test Automation Engineer',
  
  // Management & Product
  'Technical Lead',
  'Engineering Manager',
  'Product Manager',
  'Project Manager',
  'Scrum Master',
  
  // Design
  'UI/UX Designer',
  'Product Designer',
  'Graphic Designer'
];

async function addJobsForResumes() {
  console.log('🎯 Adding jobs specifically for resume matching...');
  console.log(`📋 Will add jobs for ${RESUME_FOCUSED_CATEGORIES.length} categories`);
  
  let totalJobsAdded = 0;
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < RESUME_FOCUSED_CATEGORIES.length; i++) {
    const category = RESUME_FOCUSED_CATEGORIES[i];
    
    try {
      console.log(`\n📈 Progress: ${i + 1}/${RESUME_FOCUSED_CATEGORIES.length} (${Math.round(((i + 1)/RESUME_FOCUSED_CATEGORIES.length)*100)}%)`);
      console.log(`🔍 Fetching ${category} jobs...`);
      
      const response = await axios.post(`${API_BASE_URL}/api/jobs/fetch-jsearch`, {
        query: category,
        location: '', // No location filter for broader results
        limit: 15 // Get more jobs per category
      });

      const jobsCount = response.data.jobs?.length || 0;
      totalJobsAdded += jobsCount;
      successCount++;
      
      console.log(`✅ Added ${jobsCount} ${category} jobs`);
      
      // Add delay to avoid rate limiting
      if (i < RESUME_FOCUSED_CATEGORIES.length - 1) {
        console.log(`⏳ Waiting 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error: any) {
      console.error(`❌ Error fetching ${category} jobs: ${error.message}`);
      failCount++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUME-FOCUSED JOB ADDITION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successful categories: ${successCount}`);
  console.log(`❌ Failed categories: ${failCount}`);
  console.log(`🎯 Total jobs added: ${totalJobsAdded}`);
  console.log('\n🎉 Job addition completed!');
  console.log('📄 Your database now has comprehensive job coverage for resume matching!');
  console.log('🔍 Users can upload resumes with skills in any of these areas and get relevant matches!');
}

// Run the script
if (require.main === module) {
  addJobsForResumes().catch(console.error);
}

export { addJobsForResumes };
