// Test extracting skills from recommended_projects
const testResponse = {
  "error": "JSON parsing failed: Invalid \\escape: line 1 column 24 (char 23)",
  "raw_response": "{\n\"overall_fit\": {\n\"match_percentage\": 70,\n\"fit_level\": \"Good match with some additional learning\",\n\"hiring_likelihood\": \"Likely with focused preparation\"\n},\n\"missing_skills\": {},\n\"learning_roadmap\": {\n\"immediate_priority\": []\n},\n\"recommended_projects\": [\n{\n\"skill_focus\": \"Data Science and Machine Learning\",\n\"project\": \"Predictive model using Python and machine learning libraries\",\n\"portfolio_impact\": \"Demonstrates understanding of machine learning concepts and practical implementation\"\n},\n{\n\"skill_focus\": \"Web Development\",\n\"project\": \"Full-stack application using React and Node.js\",\n\"portfolio_impact\": \"Shows frontend and backend development skills\"\n}\n]"
};

console.log('🧪 Testing extraction from recommended_projects...\n');

// Simulate the parsing logic
function testRecommendedProjectsExtraction() {
  try {
    const rawResponse = testResponse.raw_response;
    console.log('📥 Raw response:', rawResponse);
    
    // Clean up the JSON
    let cleanedJson = rawResponse
      .replace(/\\_/g, '_')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
      .trim();
    
    console.log('🧹 Cleaned JSON:', cleanedJson);
    
    const parsed = JSON.parse(cleanedJson);
    console.log('✅ Successfully parsed JSON:', parsed);
    
    const missingSkills = [];
    
    // Check missing_skills first
    if (parsed.missing_skills) {
      console.log('📭 Missing skills object:', parsed.missing_skills);
      console.log('📊 Missing skills object keys:', Object.keys(parsed.missing_skills));
      
      if (Object.keys(parsed.missing_skills).length === 0) {
        console.log('📭 Missing skills object is empty - extracting from recommended_projects');
      }
    }
    
    // Extract from recommended_projects
    if (parsed.recommended_projects) {
      console.log('🔍 Found recommended_projects:', parsed.recommended_projects);
      
      const projects = parsed.recommended_projects;
      if (Array.isArray(projects)) {
        projects.forEach((project, index) => {
          console.log(`📋 Project ${index + 1}:`, project);
          
          if (project.skill_focus) {
            console.log(`  🎯 Skill focus: ${project.skill_focus}`);
            missingSkills.push(project.skill_focus);
          }
          
          if (project.project) {
            console.log(`  📝 Project description: ${project.project}`);
            
            // Extract skills from project description
            const skillPatterns = [
              /(Python|JavaScript|React|Node\.js|MongoDB|SQL|Machine Learning|Data Science|TypeScript|CSS|HTML|Docker|AWS|Git)/gi
            ];
            
            for (const pattern of skillPatterns) {
              const matches = project.project.match(pattern);
              if (matches) {
                console.log(`  🔧 Found skills in description:`, matches);
                missingSkills.push(...matches);
              }
            }
          }
        });
      }
    }
    
    // Remove duplicates and filter
    const uniqueSkills = [...new Set(missingSkills)]
      .filter(skill => 
        skill && 
        skill.trim().length > 0 && 
        !skill.includes('timestamp') && 
        !skill.includes('model_used')
      );
    
    console.log('\n🎯 Final extracted missing skills:', uniqueSkills);
    
    return {
      success: true,
      missingSkills: uniqueSkills
    };
    
  } catch (error) {
    console.error('❌ Extraction failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
const result = testRecommendedProjectsExtraction();

console.log('\n📊 Test Results:');
console.log('Success:', result.success);
if (result.success) {
  console.log('Extracted Skills:', result.missingSkills);
  console.log('Total Skills:', result.missingSkills.length);
} else {
  console.log('Error:', result.error);
}

console.log('\n✅ Expected skills from recommended_projects:');
console.log('- Data Science and Machine Learning');
console.log('- Web Development');
console.log('- Python');
console.log('- React');
console.log('- Node.js');
