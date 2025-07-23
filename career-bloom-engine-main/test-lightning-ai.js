// Simple test script to verify Lightning AI integration
const fetch = require('node-fetch');

const testLightningAI = async () => {
  try {
    console.log('🧪 Testing Lightning AI integration...');
    
    const testData = {
      resumeText: `John Smith
Software Engineer

Skills:
- Python, Django, Flask
- PostgreSQL, MySQL
- REST API development
- Git, Docker
- 2 years experience

Experience:
- Python Developer at TechCorp (2022-2024)
- Built web applications using Django
- Developed REST APIs
- Worked with PostgreSQL databases
- Basic AWS experience`,
      
      jobDescription: "Senior Frontend Developer - React, TypeScript, JavaScript, CSS, HTML, 3+ years experience, Redux and Next.js experience preferred"
    };

    console.log('📤 Sending test request to Lightning AI...');
    
    const response = await fetch('http://localhost:5000/api/resume/analyze-missing-skills', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    console.log('📥 Response received:');
    console.log('Status:', response.status);
    console.log('Success:', result.success);
    
    if (result.success) {
      console.log('✅ Lightning AI integration working!');
      console.log('🎯 Missing Skills:', result.data.missingSkills);
      console.log('✅ Existing Skills:', result.data.existingSkills);
      console.log('📊 Total Missing Skills:', result.data.summary.totalMissingSkills);
    } else {
      console.log('❌ Lightning AI integration failed:');
      console.log('Error:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testLightningAI();
