/**
 * Test script to verify cover letter generation setup
 * This tests the API endpoint and Python script integration
 */

const fetch = require('node-fetch');

async function testCoverLetterAPI() {
  console.log('🧪 Testing Cover Letter API Setup...\n');

  // Test data
  const testResumeText = `
John Doe
Software Engineer

EXPERIENCE:
- 3 years of experience in JavaScript and React
- Built multiple web applications using Node.js
- Experience with MongoDB and Express.js
- Strong problem-solving skills

SKILLS:
JavaScript, React, Node.js, MongoDB, Express, Git, HTML, CSS

EDUCATION:
Bachelor's in Computer Science
  `;

  const testJobDescription = `
We are looking for a Frontend Developer with experience in React and JavaScript.
The ideal candidate should have:
- 2+ years of React experience
- Strong JavaScript skills
- Experience with modern web development
- Good communication skills
  `;

  try {
    console.log('📡 Testing API endpoint: POST /api/cover-letter/generate (JSON)');

    const response = await fetch('http://localhost:5000/api/cover-letter/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText: testResumeText,
        jobDescription: testJobDescription
      }),
    });

    const data = await response.json();

    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Data:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✅ SUCCESS: Cover letter generated successfully!');
      console.log('📝 Generated Cover Letter:');
      console.log('=' .repeat(50));
      console.log(data.coverLetter);
      console.log('=' .repeat(50));
    } else {
      console.log('\n❌ FAILED: Cover letter generation failed');
      console.log('Error:', data.error);
    }

  } catch (error) {
    console.error('\n💥 ERROR: Failed to test API');
    console.error('Details:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 TIP: Make sure the server is running on port 5000');
      console.log('Run: cd server && npm run dev');
    }
  }
}

async function testHealthEndpoint() {
  console.log('\n🏥 Testing Health Endpoint...');
  
  try {
    const response = await fetch('http://localhost:5000/api/cover-letter/health');
    const data = await response.json();
    
    console.log('📊 Health Status:', response.status);
    console.log('📋 Health Data:', JSON.stringify(data, null, 2));
    
    if (data.healthy) {
      console.log('✅ Cover letter service is healthy!');
    } else {
      console.log('⚠️  Cover letter service has issues:');
      console.log('Details:', data.details);
    }
    
  } catch (error) {
    console.error('❌ Failed to check health endpoint:', error.message);
  }
}

// Run tests
async function runTests() {
  await testHealthEndpoint();
  await testCoverLetterAPI();
}

runTests();
