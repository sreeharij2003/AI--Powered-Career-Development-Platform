// Test extracting skills from incomplete JSON (like your actual response)
const incompleteResponse = `{
  "error": "JSON parsing failed: Invalid \\escape: line 1 column 24 (char 23)",
  "raw_response": "{\n\"overall_fit\": {\n\"match\_percentage\": 70,\n\"fit\_level\": \"Good match with some additional learning\",\n\"hiring\_likelihood\": \"Likely with focused preparation\"\n},\n\"missing\_skills\": {},\n\"learning\_roadmap\": {\n\"immediate\_priority\": []\n},\n\"recommended\_projects\": [\n{\n\"skill\_focus\": \"Data Science and Machine Learning\",\n\"project\": \"Predictive model using Python and machine learning libraries\",\n\"portfolio\_impact\": \"Demonstrates understanding of machine learning concepts and practical implementation\"..."
}`;

console.log('🧪 Testing extraction from incomplete JSON...\n');

// Simulate the extractSkillsFromIncompleteJSON method
function extractSkillsFromIncompleteJSON(text) {
  const skills = [];
  
  console.log('🔍 Extracting skills from incomplete JSON...');
  console.log('📥 Input text:', text);
  
  // Pattern 1: Extract from skill_focus fields
  const skillFocusPattern = /"skill_focus":\s*"([^"]+)"/g;
  let match;
  while ((match = skillFocusPattern.exec(text)) !== null) {
    console.log('🎯 Found skill_focus:', match[1]);
    skills.push(match[1]);
  }
  
  // Pattern 2: Extract from project descriptions
  const projectPattern = /"project":\s*"([^"]+)"/g;
  while ((match = projectPattern.exec(text)) !== null) {
    console.log('📝 Found project description:', match[1]);
    
    // Extract specific skills from project description
    const skillPatterns = [
      /(Python|JavaScript|React|Node\.js|MongoDB|SQL|Machine Learning|Data Science|TypeScript|CSS|HTML|Docker|AWS|Git)/gi
    ];
    
    for (const pattern of skillPatterns) {
      const skillMatches = match[1].match(pattern);
      if (skillMatches) {
        console.log('  🔧 Found skills in description:', skillMatches);
        skills.push(...skillMatches);
      }
    }
  }
  
  // Pattern 3: Extract from missing_skills arrays (even if incomplete)
  const criticalPattern = /"critical":\s*\[([^\]]*)/g;
  while ((match = criticalPattern.exec(text)) !== null) {
    console.log('🔴 Found critical skills pattern:', match[1]);
    const criticalSkills = match[1]
      .replace(/["\[\]]/g, '')
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    skills.push(...criticalSkills);
  }
  
  const importantPattern = /"important":\s*\[([^\]]*)/g;
  while ((match = importantPattern.exec(text)) !== null) {
    console.log('🟡 Found important skills pattern:', match[1]);
    const importantSkills = match[1]
      .replace(/["\[\]]/g, '')
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    skills.push(...importantSkills);
  }
  
  // Remove duplicates and filter out metadata
  const uniqueSkills = [...new Set(skills)]
    .filter(skill => 
      skill && 
      skill.trim().length > 0 && 
      !skill.includes('timestamp') && 
      !skill.includes('model_used') &&
      !skill.includes('07T') &&
      !skill.includes('Mistral') &&
      !skill.includes('Instruct') &&
      !skill.includes('v0.2') &&
      skill.length < 50
    );
  
  console.log('🎯 Final extracted skills:', uniqueSkills);
  return uniqueSkills;
}

// Test the extraction
const result = extractSkillsFromIncompleteJSON(incompleteResponse);

console.log('\n📊 Test Results:');
console.log('Extracted Skills:', result);
console.log('Total Skills:', result.length);

console.log('\n✅ Expected skills:');
console.log('- Data Science and Machine Learning');
console.log('- Python');
console.log('- Machine Learning (from project description)');

console.log('\n🎯 This should now work with your actual Lightning AI response!');
