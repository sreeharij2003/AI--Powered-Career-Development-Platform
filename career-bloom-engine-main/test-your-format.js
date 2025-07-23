// Test with your exact Lightning AI format
const yourResponse = `"missing\\_skills": {\\n"critical": ["Deep Learning"],\\n"important": ["Data Visualization", "Experience in advertising or marketing industry"],\\n"nice\\_to\\_have": ["Natural Language Processing", "Predictive Analytics"]`;

console.log('🧪 Testing your exact Lightning AI format...\n');
console.log('📥 Input text:', yourResponse);

// Test the text pattern parsing (same logic as in lightningAIService.ts)
function extractMissingSkills(text) {
  const missingSkills = [];
  
  // Pattern for JSON-like missing_skills structure
  const jsonLikePattern = /missing\\_skills["\s]*:[^{]*\{([^}]+)\}/gi;
  const jsonMatch = text.match(jsonLikePattern);
  
  if (jsonMatch) {
    console.log('📍 Found JSON-like pattern:', jsonMatch);
    
    for (const match of jsonMatch) {
      console.log('🔍 Processing match:', match);
      
      // Extract critical skills
      const criticalMatch = match.match(/critical["\s]*:\s*\[([^\]]+)\]/i);
      if (criticalMatch) {
        console.log('🔴 Critical skills found:', criticalMatch[1]);
        const skills = criticalMatch[1]
          .replace(/["\[\]]/g, '')
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0);
        missingSkills.push(...skills);
      }
      
      // Extract important skills
      const importantMatch = match.match(/important["\s]*:\s*\[([^\]]+)\]/i);
      if (importantMatch) {
        console.log('🟡 Important skills found:', importantMatch[1]);
        const skills = importantMatch[1]
          .replace(/["\[\]]/g, '')
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0);
        missingSkills.push(...skills);
      }
      
      // Extract nice_to_have skills
      const niceToHaveMatch = match.match(/nice\\_to\\_have["\s]*:\s*\[([^\]]+)\]/i);
      if (niceToHaveMatch) {
        console.log('🟢 Nice-to-have skills found:', niceToHaveMatch[1]);
        const skills = niceToHaveMatch[1]
          .replace(/["\[\]]/g, '')
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0);
        missingSkills.push(...skills);
      }
    }
  } else {
    console.log('❌ No JSON-like pattern found');
  }
  
  return missingSkills;
}

// Test with a more complete response
const completeResponse = `{
"overall\\_fit": {
"match\\_percentage": 75,
"fit\\_level": "Good match with some gaps"
},
"missing\\_skills": {
"critical": ["Deep Learning"],
"important": ["Data Visualization", "Experience in advertising or marketing industry"],
"nice\\_to\\_have": ["Natural Language Processing", "Predictive Analytics"]
},
"recommendations": "Focus on learning these skills"
}`;

console.log('\n🔄 Testing with complete response...');
const result1 = extractMissingSkills(yourResponse);
console.log('🎯 Extracted skills from partial response:', result1);

console.log('\n🔄 Testing with complete response...');
const result2 = extractMissingSkills(completeResponse);
console.log('🎯 Extracted skills from complete response:', result2);

console.log('\n✅ Expected all skills:');
console.log('- Deep Learning (critical)');
console.log('- Data Visualization (important)');
console.log('- Experience in advertising or marketing industry (important)');
console.log('- Natural Language Processing (nice_to_have)');
console.log('- Predictive Analytics (nice_to_have)');

console.log('\n📊 Total skills that should be displayed on frontend:', result2.length);
