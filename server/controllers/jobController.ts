import { Request, Response } from 'express';
import jobService from '../services/jobService';

// Get paginated, latest jobs
export const getJobs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const allJobs = await jobService.getAllJobs();
    const jobs = allJobs.slice((page - 1) * limit, page * limit);
    res.json({ jobs, total: allJobs.length, page, limit });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

// Get featured jobs
export const getFeaturedJobs = async (req: Request, res: Response) => {
  try {
    // Return mock featured jobs
    const featuredJobs = [
      {
        id: "featured-1",
        title: "Senior Software Engineer",
        company: "Google",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/2048px-Google_%22G%22_Logo.svg.png",
        location: "Mountain View, CA",
        type: "Full-time",
        posted_date: new Date().toISOString(),
        description: "Join our team to work on cutting-edge technologies and help build the future of the web.",
        skills: ["JavaScript", "TypeScript", "React", "Node.js", "Cloud"],
        salary: "$150,000 - $200,000",
        source: "Company Website",
        remote: false
      },
      {
        id: "featured-2",
        title: "Product Manager",
        company: "Microsoft",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2048px-Microsoft_logo.svg.png",
        location: "Redmond, WA",
        type: "Full-time",
        posted_date: new Date(Date.now() - 86400000).toISOString(),
        description: "Lead product development for Microsoft Teams. Work with engineers and designers to build innovative solutions.",
        skills: ["Product Strategy", "Agile", "SaaS", "User Research"],
        salary: "$140,000 - $180,000",
        source: "LinkedIn",
        remote: false
      },
      {
        id: "featured-3",
        title: "Full Stack Developer",
        company: "Airbnb",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Airbnb_Logo_B%C3%A9lo.svg/1200px-Airbnb_Logo_B%C3%A9lo.svg.png",
        location: "Remote",
        type: "Full-time",
        posted_date: new Date(Date.now() - 172800000).toISOString(),
        description: "Build and maintain features across our entire stack. Work with React, Node.js, and our custom infrastructure.",
        skills: ["JavaScript", "React", "Node.js", "AWS", "MongoDB"],
        salary: "$120,000 - $160,000",
        source: "Indeed",
        remote: true
      },
      {
        id: "featured-4",
        title: "DevOps Engineer",
        company: "Netflix",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1920px-Netflix_2015_logo.svg.png",
        location: "Los Gatos, CA",
        type: "Full-time",
        posted_date: new Date(Date.now() - 259200000).toISOString(),
        description: "Build and maintain infrastructure for Netflix. Implement CI/CD pipelines and ensure system reliability.",
        skills: ["AWS", "Kubernetes", "Docker", "CI/CD", "Terraform"],
        salary: "$150,000 - $190,000",
        source: "Glassdoor",
        remote: false
      }
    ];
    
    res.json(featuredJobs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch featured jobs' });
  }
}; 