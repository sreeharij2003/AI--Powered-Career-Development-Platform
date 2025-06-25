import dotenv from 'dotenv';
import fs from 'fs';
import mongoose from 'mongoose';
import path from 'path';
import jobRecommendationService from '../jobRecommendations/jobRecommendationService';

// Load environment variables
dotenv.config();

// Job titles and skills for random generation
const jobTitles = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'DevOps Engineer', 'Data Scientist', 'Machine Learning Engineer', 'AI Specialist',
  'Product Manager', 'UX Designer', 'UI Designer', 'Mobile Developer',
  'Cloud Architect', 'Systems Administrator', 'Network Engineer', 'Database Administrator',
  'QA Engineer', 'Test Automation Engineer', 'Security Engineer', 'Blockchain Developer',
  'Game Developer', 'AR/VR Developer', 'IoT Developer', 'Embedded Systems Engineer',
  'Technical Writer', 'Scrum Master', 'Project Manager', 'IT Support Specialist',
  'Business Analyst', 'Data Analyst', 'Data Engineer', 'Big Data Specialist',
  'Web Developer', 'WordPress Developer', 'Shopify Developer', 'Magento Developer',
  'Java Developer', 'Python Developer', 'JavaScript Developer', 'C# Developer',
  'Ruby Developer', 'PHP Developer', 'Go Developer', 'Rust Developer',
  'Swift Developer', 'Kotlin Developer', 'React Developer', 'Angular Developer',
  'Vue.js Developer', 'Node.js Developer', 'Django Developer', 'Flask Developer'
];

const companies = [
  'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Tesla', 'IBM',
  'Oracle', 'Salesforce', 'Adobe', 'Intel', 'Cisco', 'Dell', 'HP', 'Twitter',
  'Uber', 'Airbnb', 'Stripe', 'Square', 'Shopify', 'Spotify', 'Slack', 'Zoom',
  'Twilio', 'Atlassian', 'Dropbox', 'Asana', 'Figma', 'GitLab', 'GitHub', 'Notion',
  'TechCorp', 'InnovateSoft', 'DataDynamics', 'CloudNine', 'CodeCrafters', 'ByteBuilders',
  'QuantumQuest', 'DigitalDreams', 'FutureTech', 'NexusNet', 'PulsePoint', 'SiliconSage'
];

const locations = [
  'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Boston, MA',
  'Chicago, IL', 'Los Angeles, CA', 'Denver, CO', 'Portland, OR', 'Atlanta, GA',
  'Miami, FL', 'Dallas, TX', 'Washington, DC', 'San Diego, CA', 'Philadelphia, PA',
  'Remote', 'Hybrid - San Francisco', 'Hybrid - New York', 'Hybrid - Seattle', 'Hybrid - Austin'
];

const skills = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go', 'Rust', 'Ruby', 'PHP',
  'Swift', 'Kotlin', 'HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Node.js', 'Express',
  'Django', 'Flask', 'Spring Boot', 'ASP.NET', 'Laravel', 'Ruby on Rails', 'GraphQL',
  'REST API', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch',
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins',
  'Git', 'GitHub Actions', 'CircleCI', 'Travis CI', 'Jest', 'Mocha', 'Cypress',
  'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'R', 'Tableau',
  'Power BI', 'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator',
  'Agile', 'Scrum', 'Kanban', 'Jira', 'Confluence', 'Trello', 'Asana'
];

const experienceLevels = ['Entry-level', 'Associate', 'Mid-Senior', 'Senior', 'Director', 'Executive'];
const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

// Function to generate a random job description
function generateJobDescription(title: string, selectedSkills: string[]): string {
  const companyMission = [
    'Our mission is to transform the way people interact with technology.',
    'We are dedicated to building innovative solutions that solve real-world problems.',
    'We believe in creating products that make a difference in people\'s lives.',
    'Our team is passionate about pushing the boundaries of what\'s possible.',
    'We are committed to excellence and continuous improvement in everything we do.'
  ];
  
  const roleDescription = [
    `As a ${title}, you will be responsible for designing, developing, and maintaining high-quality software.`,
    `We are looking for a talented ${title} to join our team and help build next-generation applications.`,
    `The ideal ${title} candidate is passionate about technology and solving complex problems.`,
    `Join our team as a ${title} and work on cutting-edge projects that impact millions of users.`,
    `We need a skilled ${title} who can drive technical excellence and innovation.`
  ];
  
  const responsibilities = [
    'Design and implement new features and functionality',
    'Write clean, maintainable, and efficient code',
    'Collaborate with cross-functional teams to define and implement solutions',
    'Troubleshoot and fix bugs and performance bottlenecks',
    'Participate in code reviews and provide constructive feedback',
    'Contribute to technical documentation and knowledge sharing',
    'Stay up-to-date with emerging trends and technologies',
    'Mentor junior developers and share knowledge with the team',
    'Work with product managers to define requirements and deliverables',
    'Ensure the technical feasibility of UI/UX designs'
  ];
  
  const requirements = [
    `Experience with ${selectedSkills.slice(0, 3).join(', ')}`,
    'Strong problem-solving skills and attention to detail',
    'Excellent communication and collaboration abilities',
    'Ability to work independently and as part of a team',
    'Passion for learning and staying updated with new technologies'
  ];
  
  const benefits = [
    'Competitive salary and equity package',
    'Health, dental, and vision insurance',
    'Flexible working hours and remote work options',
    'Professional development budget',
    'Modern equipment and tools',
    'Casual and collaborative work environment',
    'Regular team events and activities'
  ];
  
  // Randomly select elements from each array
  const mission = companyMission[Math.floor(Math.random() * companyMission.length)];
  const role = roleDescription[Math.floor(Math.random() * roleDescription.length)];
  
  // Randomly select 4-6 responsibilities
  const shuffledResponsibilities = responsibilities.sort(() => 0.5 - Math.random());
  const selectedResponsibilities = shuffledResponsibilities.slice(0, Math.floor(Math.random() * 3) + 4);
  
  // Randomly select 3-5 benefits
  const shuffledBenefits = benefits.sort(() => 0.5 - Math.random());
  const selectedBenefits = shuffledBenefits.slice(0, Math.floor(Math.random() * 3) + 3);
  
  // Construct the job description
  return `
${mission}

${role}

Responsibilities:
${selectedResponsibilities.map(r => `- ${r}`).join('\n')}

Requirements:
${requirements.map(r => `- ${r}`).join('\n')}

Benefits:
${selectedBenefits.map(b => `- ${b}`).join('\n')}
  `.trim();
}

// Function to generate a random salary range
function generateSalaryRange(): string {
  const baseSalaries = [
    { min: 50000, max: 80000 },   // Entry level
    { min: 70000, max: 100000 },  // Junior
    { min: 90000, max: 130000 },  // Mid-level
    { min: 120000, max: 180000 }, // Senior
    { min: 150000, max: 220000 }, // Lead
    { min: 180000, max: 250000 }  // Director
  ];
  
  const salaryRange = baseSalaries[Math.floor(Math.random() * baseSalaries.length)];
  const min = Math.round(salaryRange.min / 5000) * 5000;
  const max = Math.round(salaryRange.max / 5000) * 5000;
  
  return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
}

// Function to generate a random date within the last 30 days
function generatePostedDate(): Date {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  now.setDate(now.getDate() - daysAgo);
  return now;
}

// Function to generate a random job
function generateJob(index: number): any {
  // Select random values for job properties
      const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
      const company = companies[Math.floor(Math.random() * companies.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
  const remote = location === 'Remote' || location.includes('Hybrid');
  const experienceLevel = experienceLevels[Math.floor(Math.random() * experienceLevels.length)];
  const jobType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
  
  // Generate random skills (4-8 skills)
  const numSkills = Math.floor(Math.random() * 5) + 4;
  const shuffledSkills = [...skills].sort(() => 0.5 - Math.random());
  const selectedSkills = shuffledSkills.slice(0, numSkills);
  
  // Generate random requirements (3-5 requirements)
  const numRequirements = Math.floor(Math.random() * 3) + 3;
  const requirements = [];
  for (let i = 0; i < numRequirements; i++) {
    const yearsOfExperience = Math.floor(Math.random() * 5) + 1;
    const skill = shuffledSkills[i + numSkills];
    requirements.push(`${yearsOfExperience}+ years of experience with ${skill}`);
  }
  
  // Generate job description
  const description = generateJobDescription(title, selectedSkills);
  
  // Generate salary range
  const salary = generateSalaryRange();
  
  // Generate posted date
  const postedDate = generatePostedDate();
  
  // Return job object - without custom _id field to let MongoDB generate its own ObjectId
  return {
        title,
        company,
        location,
    description,
    salary,
    remote,
    type: jobType,
    experience_level: experienceLevel,
    skills: selectedSkills,
    requirements,
    posted_date: postedDate,
    source: 'seed',
    is_active: true,
    url: `https://example.com/jobs/${index + 1}`
  };
}

// Function to generate and save jobs
async function generateAndSaveJobs(count: number): Promise<void> {
  console.log(`Generating ${count} jobs...`);
  
  const jobs = [];
  for (let i = 0; i < count; i++) {
    jobs.push(generateJob(i));
    if ((i + 1) % 100 === 0) {
      console.log(`Generated ${i + 1} jobs...`);
    }
  }
  
  console.log('All jobs generated. Saving to file...');
  
  // Save jobs to a JSON file
  const outputDir = path.join(__dirname, '../data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, 'seed-jobs.json');
  fs.writeFileSync(outputPath, JSON.stringify(jobs, null, 2));
  
  console.log(`Jobs saved to ${outputPath}`);
  
  // Add jobs to the vector store
  console.log('Adding jobs to vector store...');
  await jobRecommendationService.addJobs(jobs);
  console.log('Jobs added to vector store successfully!');
  
  // Save to database if connected
  try {
    // Check if we have a connection to MongoDB
    if (mongoose.connection.readyState === 1) {
      console.log('Connected to MongoDB. Saving jobs to database...');
      
      // Assuming we have a Job model
      const Job = mongoose.model('Job');
      if (Job) {
        // Clear existing jobs
        await Job.deleteMany({ source: 'seed' });
        
        // Insert new jobs in batches
        const batchSize = 100;
        for (let i = 0; i < jobs.length; i += batchSize) {
          const batch = jobs.slice(i, i + batchSize);
          await Job.insertMany(batch);
          console.log(`Inserted jobs ${i + 1} to ${Math.min(i + batchSize, jobs.length)}`);
        }
        
        console.log('All jobs saved to database!');
      } else {
        console.log('Job model not found. Skipping database save.');
      }
    } else {
      console.log('Not connected to MongoDB. Skipping database save.');
    }
  } catch (error) {
    console.error('Error saving jobs to database:', error);
  }
}

// Connect to MongoDB and run the seed function
async function run() {
  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/career-bloom';
      await mongoose.connect(mongoURI);
      console.log('Connected to MongoDB');
    }
    
    // Generate and save 1000 jobs
    await generateAndSaveJobs(1000);
    
    console.log('Job seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding jobs:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
run().catch(console.error); 