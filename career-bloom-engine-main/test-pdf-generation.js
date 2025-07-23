// Test PDF generation endpoint
const testPDFGeneration = async () => {
  try {
    console.log('🧪 Testing PDF generation endpoint...');
    
    const testResumeData = {
      contact: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@email.com",
        phone: "(555) 123-4567",
        linkedin: "linkedin.com/in/johndoe"
      },
      summary: "Experienced software developer with 3+ years of expertise in React and TypeScript, delivering scalable web applications.",
      skills: [
        { name: "JavaScript", category: "Technical", proficiency: "advanced" },
        { name: "React", category: "Technical", proficiency: "advanced" },
        { name: "TypeScript", category: "Technical", proficiency: "intermediate" },
        { name: "Node.js", category: "Technical", proficiency: "intermediate" }
      ],
      experience: [
        {
          title: "Software Developer",
          company: "Tech Company",
          duration: "2021 - Present",
          responsibilities: "Developed high-performance web applications using React and JavaScript, improving page load times by 40%. Collaborated with cross-functional teams to deliver scalable frontend solutions."
        }
      ],
      projects: [
        {
          title: "E-commerce Platform",
          description: "Developed a scalable e-commerce web application using React and Node.js microservices architecture, deployed on AWS with 99.9% uptime.",
          technologies: "React, Node.js, AWS, MongoDB"
        }
      ],
      education: [
        {
          degree: "Bachelor of Science in Computer Science",
          institution: "University of Technology",
          year: "2021"
        }
      ]
    };

    const response = await fetch('http://localhost:5000/api/resume-customization/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeData: testResumeData,
        template: 'template1'
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const blob = await response.blob();
      console.log('✅ PDF generation test passed! PDF size:', blob.size, 'bytes');
      
      // Save the PDF to check if it's valid
      const fs = require('fs');
      const buffer = Buffer.from(await blob.arrayBuffer());
      fs.writeFileSync('test-output.pdf', buffer);
      console.log('📄 PDF saved as test-output.pdf');
      
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ PDF generation test failed:', response.status, response.statusText);
      console.error('Error response:', errorText);
      return false;
    }

  } catch (error) {
    console.error('❌ PDF generation test failed:', error.message);
    return false;
  }
};

// Test health endpoint first
const testHealth = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/resume-customization/health');
    const result = await response.json();
    console.log('✅ Health check:', result);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
};

// Run tests
const runTests = async () => {
  console.log('🚀 Testing PDF Generation...\n');
  
  const healthOk = await testHealth();
  if (healthOk) {
    await testPDFGeneration();
  }
};

// Check if we're in Node.js environment
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  runTests().catch(console.error);
} else {
  console.log('Run this in Node.js: node test-pdf-generation.js');
}
