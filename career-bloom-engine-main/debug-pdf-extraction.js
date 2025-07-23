const fs = require('fs');
const pdfParse = require('pdf-parse');

async function debugPdfExtraction() {
  try {
    console.log('🔍 Testing PDF extraction...');
    
    // You'll need to put your resume PDF in the server directory
    // For now, let's create a test to see what's being extracted
    
    console.log('📋 To debug your resume parsing:');
    console.log('1. Upload your resume through the web interface');
    console.log('2. Check the server logs for the "DEBUGGING: Full extracted text" output');
    console.log('3. The issue is in the parseResumeStructure function in resumeCustomizationController.ts');
    
    console.log('\n🔧 The parsing logic needs to be fixed to properly extract:');
    console.log('- Your actual name (SREEHARI J)');
    console.log('- Your education details (B.Tech, XII)');
    console.log('- Your projects section');
    console.log('- Your professional summary');
    console.log('- Your core competencies');
    
    console.log('\n⚠️ Current issues:');
    console.log('- Name parsing picks up "PROFILE SUMMARY" instead of "SREEHARI J"');
    console.log('- Education section is empty');
    console.log('- Projects section is empty');
    console.log('- Skills parsing may be working but needs verification');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugPdfExtraction();
