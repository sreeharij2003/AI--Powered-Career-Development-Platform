import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Job from '../server/models/Job';

dotenv.config();

const jobTitles = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'Data Scientist',
  'Machine Learning Engineer',
  'Product Manager',
  'UI/UX Designer',
  'Mobile Developer',
  'Cloud Architect',
  'Security Engineer',
  'QA Engineer',
  'Technical Lead',
  'Solutions Architect'
];

const companies = [
  'TechCorp',
  'InnovateSoft',
  'Digital Solutions',
  'Future Systems',
  'Smart Tech',
  'Global Innovations',
  'NextGen Technologies',
  'Cloud Systems',
  'Data Dynamics',
  'Web Solutions',
  'Mobile First',
  'AI Innovations',
  'Cyber Security Pro',
  'Software Masters',
  'Digital Creations'
];

const locations = [
  'New York, NY',
  'San Francisco, CA',
  'Seattle, WA',
  'Austin, TX',
  'Boston, MA',
  'Chicago, IL',
  'Denver, CO',
  'Los Angeles, CA',
  'Miami, FL',
  'Portland, OR',
  'Remote',
  'Hybrid - New York',
  'Hybrid - San Francisco',
  'Hybrid - Seattle',
  'Hybrid - Austin'
];

const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];

const skills = [
  'JavaScript',
  'Python',
  'Java',
  'React',
  'Node.js',
  'TypeScript',
  'AWS',
  'Docker',
  'Kubernetes',
  'MongoDB',
  'SQL',
  'Machine Learning',
  'Data Analysis',
  'UI/UX Design',
  'DevOps',
  'Agile',
  'Git',
  'CI/CD',
  'REST APIs',
  'GraphQL'
];

const generateRandomSalary = () => {
  const min = Math.floor(Math.random() * 50000) + 50000;
  const max = min + Math.floor(Math.random() * 100000);
  return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
};

const generateRandomSkills = () => {
  const numSkills = Math.floor(Math.random() * 5) + 3; // 3-7 skills
  const shuffled = [...skills].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numSkills);
};

const generateJobDescription = (title: string, company: string) => {
  return `
About ${company}:
${company} is a leading technology company focused on innovation and excellence. We're looking for a talented ${title} to join our growing team.

Responsibilities:
- Design and implement scalable solutions
- Collaborate with cross-functional teams
- Write clean, maintainable code
- Participate in code reviews
- Stay up-to-date with industry trends

Requirements:
- Strong problem-solving skills
- Excellent communication abilities
- Passion for technology
- Team player mentality
- Continuous learning mindset

Benefits:
- Competitive salary
- Health insurance
- 401(k) matching
- Flexible work arrangements
- Professional development opportunities
  `.trim();
};

const seedJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/career-bloom');
    console.log('Connected to MongoDB');

    // Clear existing jobs
    await Job.deleteMany({});
    console.log('Cleared existing jobs');

    const jobs = [];
    for (let i = 0; i < 1000; i++) {
      const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
      const company = companies[Math.floor(Math.random() * companies.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const isRemote = location.toLowerCase().includes('remote') || location.toLowerCase().includes('hybrid');
      
      jobs.push({
        title,
        company,
        location,
        remote: isRemote,
        salary: generateRandomSalary(),
        type: jobTypes[Math.floor(Math.random() * jobTypes.length)],
        skills: generateRandomSkills(),
        description: generateJobDescription(title, company),
        posted_date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date within last 30 days
        is_active: true
      });
    }

    await Job.insertMany(jobs);
    console.log('Successfully seeded 1000 jobs');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding jobs:', error);
    process.exit(1);
  }
};

seedJobs(); 