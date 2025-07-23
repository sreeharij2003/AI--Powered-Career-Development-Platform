// Test with your EXACT format
const exactText = `{\n"critical": [],\n"important": ["Deep Learning", "Predictive Analytics"],\n"nice\_to\_have": ["Natural Language Processing", "Data Mining"]`;

console.log('🧪 Testing your EXACT format...\n');
console.log('📥 Input text:', exactText);

function extractSkillsFromBrackets(bracketsContent) {
  const skills = [];
  
  console.log('🔧 Extracting from brackets content:', bracketsContent);
  
  // Remove quotes and brackets, split by comma
  const parts = bracketsContent
    .replace(/["\[\]]/g, '') // Remove quotes and brackets
    .split(',')
    .map(part => part.trim())
    .filter(part => part.length > 0);
  
  console.log('🔧 Split parts:', parts);
  
  for (const part of parts) {
    if (part && part.length > 1 && part.length < 100) {
      console.log('🔧 Adding skill:', part);
      skills.push(part);
    }
  }
  
  return skills;
}

function extractSkillsFromIncompleteJSON(text) {
  const skills = [];
  
  console.log('🔍 Extracting skills from incomplete JSON...');
  
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
  }
  
  // Pattern 3: Extract from missing_skills arrays (even if incomplete)
  // Handle both "critical": and critical\\_: patterns
  const criticalPattern = /"?critical"?\\_?:\s*\[([^\]]*)/g;
  while ((match = criticalPattern.exec(text)) !== null) {
    console.log('🔴 Found critical match:', match[1]);
    const criticalSkills = extractSkillsFromBrackets(match[1]);
    skills.push(...criticalSkills);
  }
  
  const importantPattern = /"?important"?\\_?:\s*\[([^\]]*)/g;
  while ((match = importantPattern.exec(text)) !== null) {
    console.log('🟡 Found important match:', match[1]);
    const importantSkills = extractSkillsFromBrackets(match[1]);
    skills.push(...importantSkills);
  }
  
  const niceToHavePattern = /"?nice\\_?_?to\\_?_?have"?\\_?:\s*\[([^\]]*)/g;
  while ((match = niceToHavePattern.exec(text)) !== null) {
    console.log('🟢 Found nice_to_have match:', match[1]);
    const niceToHaveSkills = extractSkillsFromBrackets(match[1]);
    skills.push(...niceToHaveSkills);
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
  
  console.log('🎯 Extracted skills from incomplete JSON:', uniqueSkills);
  return uniqueSkills;
}

// Test the extraction
const result = extractSkillsFromIncompleteJSON(exactText);

console.log('\n📊 Final Results:');
console.log('Extracted Skills:', result);
console.log('Total Skills:', result.length);

console.log('\n✅ Expected skills:');
console.log('- Deep Learning');
console.log('- Predictive Analytics');
console.log('- Natural Language Processing');
console.log('- Data Mining');

if (result.length === 4) {
  console.log('\n🎉 SUCCESS! All 4 skills extracted correctly!');
} else {
  console.log('\n❌ FAILED! Expected 4 skills, got', result.length);
}
