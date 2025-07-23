// Test the Lightning AI parsing logic
const testResponse = {
  "error": "JSON parsing failed: Invalid \\escape: line 1 column 10 (char 9)",
  "raw_response": "{\n\"overall\\_fit\": {\n\"match\\_percentage\": 60,\n\"fit\\_level\": \"Good match with some learning needed\",\n\"hiring\\_likelihood\": \"Likely with focused preparation\"\n},\n\"missing\\_skills\": {\n\"critical\": [\"Deep Learning\"],\n\"important\": [\"Data Visualization\", \"Predictive Analytics\", \"Natural Language Processing\"],\n\"nice\\_to\\_have\": []\n},\n\"learning\\_roadmap\": {\n\"immediate\\_priority\": [\n{\n\"skill\": \"Data Science and Machine Learning - Predictive Analytics\",\n\"why\\_critical\": \"Required skill mentioned in job descr...\""
};

// Test JSON cleaning and parsing
function testJSONParsing() {
  console.log('🧪 Testing JSON parsing...');
  
  const rawResponse = testResponse.raw_response;
  console.log('📥 Raw response:', rawResponse);
  
  // Clean up the JSON text - fix common issues
  let cleanedJson = rawResponse
    .replace(/\\_/g, '_') // Fix escaped underscores
    .replace(/\\"/g, '"') // Fix escaped quotes
    .replace(/\\\\/g, '\\') // Fix double backslashes
    .trim();

  console.log('🧹 Cleaned JSON:', cleanedJson);
  
  try {
    const parsed = JSON.parse(cleanedJson);
    console.log('✅ Successfully parsed JSON:', parsed);
    
    // Extract missing skills
    const missingSkills = [];
    if (parsed.missing_skills) {
      const missingSkillsObj = parsed.missing_skills;
      
      if (missingSkillsObj.critical) {
        missingSkills.push(...missingSkillsObj.critical);
      }
      if (missingSkillsObj.important) {
        missingSkills.push(...missingSkillsObj.important);
      }
      if (missingSkillsObj.nice_to_have) {
        missingSkills.push(...missingSkillsObj.nice_to_have);
      }
    }
    
    console.log('🎯 Extracted missing skills:', missingSkills);
    
    return {
      success: true,
      missingSkills: missingSkills
    };
    
  } catch (error) {
    console.error('❌ JSON parsing failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Test text pattern matching
function testTextParsing() {
  console.log('\n🧪 Testing text pattern parsing...');
  
  const text = testResponse.raw_response;
  const missingSkills = [];
  
  // Pattern for JSON-like missing_skills structure
  const jsonLikePattern = /missing\\_skills["\s]*:[^{]*\{([^}]+)\}/gi;
  const jsonMatch = text.match(jsonLikePattern);
  
  if (jsonMatch) {
    console.log('📍 Found JSON-like pattern:', jsonMatch);
    
    for (const match of jsonMatch) {
      console.log('🔍 Processing match:', match);
      
      const criticalMatch = match.match(/critical["\s]*:\s*\[([^\]]+)\]/i);
      const importantMatch = match.match(/important["\s]*:\s*\[([^\]]+)\]/i);
      
      if (criticalMatch) {
        console.log('🔴 Critical skills found:', criticalMatch[1]);
        const skills = criticalMatch[1]
          .replace(/["\[\]]/g, '')
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0);
        missingSkills.push(...skills);
      }
      
      if (importantMatch) {
        console.log('🟡 Important skills found:', importantMatch[1]);
        const skills = importantMatch[1]
          .replace(/["\[\]]/g, '')
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0);
        missingSkills.push(...skills);
      }
    }
  }
  
  console.log('🎯 Extracted missing skills from text:', missingSkills);
  return missingSkills;
}

// Run tests
console.log('🚀 Starting Lightning AI parsing tests...\n');

const jsonResult = testJSONParsing();
const textResult = testTextParsing();

console.log('\n📊 Test Results:');
console.log('JSON Parsing Success:', jsonResult.success);
if (jsonResult.success) {
  console.log('JSON Missing Skills:', jsonResult.missingSkills);
} else {
  console.log('JSON Error:', jsonResult.error);
}
console.log('Text Parsing Missing Skills:', textResult);

console.log('\n✅ Expected skills: ["Deep Learning", "Data Visualization", "Predictive Analytics", "Natural Language Processing"]');
