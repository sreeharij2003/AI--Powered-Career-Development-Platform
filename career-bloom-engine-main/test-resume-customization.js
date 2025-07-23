// Simple test script to verify resume customization API
const fs = require('fs');
const path = require('path');

// Test the health endpoint
async function testHealthEndpoint() {
  try {
    const response = await fetch('http://localhost:5000/api/resume-customization/health');
    const result = await response.json();
    console.log('✅ Health endpoint test:', result);
    return true;
  } catch (error) {
    console.error('❌ Health endpoint test failed:', error.message);
    return false;
  }
}

// Test the customization endpoint with mock data
async function testCustomizationEndpoint() {
  try {
    // Create a simple test resume file
    const testResumeContent = `
John Doe
john.doe@email.com | (555) 123-4567
LinkedIn: linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Experienced software developer with 3 years of experience in web development.

SKILLS
JavaScript, React, Node.js, HTML, CSS

EXPERIENCE
Software Developer - Tech Company
2021 - Present
Developed web applications using JavaScript and React. Worked on team projects and collaborated with designers.

EDUCATION
Bachelor of Science in Computer Science
University of Technology
2021

PROJECTS
E-commerce Website
Built a full-stack e-commerce website using React and Node.js. Implemented user authentication and payment processing.
`;

    // Create a temporary file
    const tempFilePath = path.join(__dirname, 'test-resume.txt');
    fs.writeFileSync(tempFilePath, testResumeContent);

    const formData = new FormData();
    const fileBlob = new Blob([testResumeContent], { type: 'text/plain' });
    formData.append('resume', fileBlob, 'test-resume.txt');
    formData.append('jobDescription', `
Senior Frontend Developer Position

We are looking for a Senior Frontend Developer with expertise in React, TypeScript, and modern web technologies.

Requirements:
- 5+ years of experience in frontend development
- Strong proficiency in React and TypeScript
- Experience with state management (Redux, Context API)
- Knowledge of modern CSS frameworks
- Experience with testing frameworks (Jest, React Testing Library)
- Familiarity with CI/CD pipelines
- Strong problem-solving skills and attention to detail

Responsibilities:
- Lead frontend development initiatives
- Mentor junior developers
- Collaborate with design and backend teams
- Implement responsive and accessible user interfaces
- Optimize application performance
- Write clean, maintainable code
`);
    formData.append('template', 'template1');

    console.log('🧪 Testing resume customization endpoint...');
    
    const response = await fetch('http://localhost:5000/api/resume-customization/customize', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Customization endpoint test passed!');
      console.log('📊 Analysis Result:', JSON.stringify(result.data.analysisResult, null, 2));
      console.log('📋 Customization Plan:', JSON.stringify(result.data.customizationPlan, null, 2));
      
      // Test PDF generation
      await testPDFGeneration(result.data.customizedResume);
      
      // Clean up
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      
      return true;
    } else {
      console.error('❌ Customization endpoint test failed:', result.error);
      return false;
    }

  } catch (error) {
    console.error('❌ Customization endpoint test failed:', error.message);
    return false;
  }
}

// Test PDF generation
async function testPDFGeneration(customizedResumeData) {
  try {
    console.log('🧪 Testing PDF generation...');
    
    const response = await fetch('http://localhost:5000/api/resume-customization/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeData: customizedResumeData,
        template: 'template1'
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      console.log('✅ PDF generation test passed! PDF size:', blob.size, 'bytes');
      return true;
    } else {
      console.error('❌ PDF generation test failed:', response.status, response.statusText);
      return false;
    }

  } catch (error) {
    console.error('❌ PDF generation test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Resume Customization API Tests...\n');
  
  const healthTest = await testHealthEndpoint();
  console.log('');
  
  if (healthTest) {
    const customizationTest = await testCustomizationEndpoint();
    console.log('');
    
    if (customizationTest) {
      console.log('🎉 All tests passed! Resume customization system is working correctly.');
    } else {
      console.log('⚠️ Some tests failed. Please check the implementation.');
    }
  } else {
    console.log('⚠️ Health check failed. Please ensure the server is running.');
  }
}

// Check if running in Node.js environment
if (typeof window === 'undefined') {
  // Node.js environment - use node-fetch
  const fetch = require('node-fetch');
  global.FormData = require('form-data');
  global.Blob = require('blob-polyfill').Blob;
  
  runTests().catch(console.error);
} else {
  // Browser environment
  console.log('This test script is designed to run in Node.js environment.');
  console.log('Please run: node test-resume-customization.js');
}
