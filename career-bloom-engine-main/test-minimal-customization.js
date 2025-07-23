// Test to ensure only summary and skills are modified
const testMinimalCustomization = async () => {
  try {
    console.log('🧪 Testing minimal customization (summary + skills only)...');
    
    const testResumeData = {
      contact: {
        firstName: "SREEHARI",
        lastName: "J",
        email: "sreeharij642@email.com",
        phone: "+916282569756",
        linkedin: "https://linkedin.com/in/sreehari-j-706b1631a"
      },
      summary: "A dedicated Computer Science student with expertise in developing deep-learning models, analyzing network data, and building web applications. Proficient in programming languages and tools such as Python, SQL, Java, HTML, CSS, and JavaScript.",
      skills: [
        { name: "Python", category: "Technical", proficiency: "advanced" },
        { name: "Java", category: "Technical", proficiency: "intermediate" },
        { name: "JavaScript", category: "Technical", proficiency: "intermediate" },
        { name: "HTML", category: "Technical", proficiency: "intermediate" },
        { name: "CSS", category: "Technical", proficiency: "intermediate" }
      ],
      education: [
        {
          degree: "Computer Science & Engineering | B.Tech",
          institution: "Amrita Vishwa Vidyapeetham, Vallikavu, Kollam",
          year: "2022-26",
          gpa: "8.35/10"
        },
        {
          degree: "Senior Secondary (XII)",
          institution: "Jawahar Navodaya Vidyalaya, Kottayam",
          year: "2019 - 21",
          percentage: "94.20"
        }
      ],
      projects: [
        {
          title: "Heart Disease Prediction Model",
          date: "Dec 2024",
          description: "Developed a machine learning model to predict heart disease using Random Forest on a Kaggle dataset.",
          technologies: "Python, Machine Learning, Random Forest"
        },
        {
          title: "Lurnix – AI-Powered Learning & Content Transformation Platform",
          date: "June 2025",
          description: "Developed a full-stack AI platform that converts uploaded documents into summaries, quizzes, podcasts, and video suggestions.",
          technologies: "React, Tailwind CSS, Spring Boot, MySQL"
        }
      ],
      experience: [
        {
          title: "Full Stack Development Intern",
          company: "Nexospark, Kottayam",
          duration: "Mar 2025 – may 2025",
          responsibilities: "Designed and developed full-stack web applications using Node.js, Express, and MongoDB, creating RESTful APIs to enable seamless frontend-backend integration."
        }
      ],
      certifications: [
        {
          name: "Certification in Space Science and Technology Awareness Training (START)",
          date: "Sep 2024",
          details: "Completed a specialized course on AI, Machine Learning (ML), and Deep Learning (DL) along with data processing techniques and geospatial data case studies."
        }
      ]
    };

    const jobDescription = `
Frontend Developer Position

We are looking for a Frontend Developer with expertise in React, TypeScript, and modern web technologies.

Requirements:
- 2+ years of experience in frontend development
- Strong proficiency in React and TypeScript
- Experience with HTML, CSS, JavaScript
- Knowledge of responsive design
- Experience with Git version control
- Strong problem-solving skills

Responsibilities:
- Develop responsive web applications using React
- Collaborate with design and backend teams
- Write clean, maintainable code
- Optimize application performance
`;

    const response = await fetch('http://localhost:5000/api/resume-customization/customize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeData: testResumeData,
        jobDescription: jobDescription,
        template: 'template1'
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Customization successful!');
      
      const original = result.data.originalResume;
      const customized = result.data.customizedResume;
      
      // Check what was preserved
      console.log('\n📋 PRESERVATION CHECK:');
      console.log('Contact preserved:', JSON.stringify(original.contact) === JSON.stringify(customized.contact));
      console.log('Education preserved:', JSON.stringify(original.education) === JSON.stringify(customized.education));
      console.log('Projects preserved:', JSON.stringify(original.projects) === JSON.stringify(customized.projects));
      console.log('Experience preserved:', JSON.stringify(original.experience) === JSON.stringify(customized.experience));
      console.log('Certifications preserved:', JSON.stringify(original.certifications) === JSON.stringify(customized.certifications));
      
      // Check what was modified
      console.log('\n🎯 MODIFICATION CHECK:');
      console.log('Summary modified:', original.summary !== customized.summary);
      console.log('Skills modified:', JSON.stringify(original.skills) !== JSON.stringify(customized.skills));
      
      console.log('\n📝 ORIGINAL SUMMARY:');
      console.log(original.summary);
      console.log('\n✨ CUSTOMIZED SUMMARY:');
      console.log(customized.summary);
      
      console.log('\n🔧 ORIGINAL SKILLS:');
      console.log(original.skills.map(s => s.name).join(', '));
      console.log('\n⚡ CUSTOMIZED SKILLS:');
      console.log(customized.skills.map(s => s.name).join(', '));
      
      return true;
    } else {
      console.error('❌ Customization failed:', result.error);
      return false;
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
};

// Check if we're in Node.js environment
if (typeof window === 'undefined') {
  const fetch = require('node-fetch');
  testMinimalCustomization().catch(console.error);
} else {
  console.log('Run this in Node.js: node test-minimal-customization.js');
}
