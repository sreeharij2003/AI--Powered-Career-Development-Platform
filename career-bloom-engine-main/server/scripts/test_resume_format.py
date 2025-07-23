#!/usr/bin/env python3
"""
Test script for the updated resume + job description format
"""

import json
import subprocess
import sys
from pathlib import Path

def test_cover_letter_generation():
    """Test cover letter generation with resume + job description format"""
    
    print("🧪 Testing Cover Letter Generation with Resume + Job Description Format")
    print("=" * 70)
    
    # Sample resume text
    sample_resume = """John Doe
Software Developer
Email: john.doe@email.com
Phone: (555) 123-4567

EXPERIENCE:
- 3 years of Python development experience
- Built web applications using React and Node.js
- Experience with databases (MongoDB, PostgreSQL)
- Worked on machine learning projects using TensorFlow
- Strong problem-solving and communication skills

EDUCATION:
- Bachelor's in Computer Science
- Relevant coursework in algorithms, data structures, and software engineering

SKILLS:
- Programming: Python, JavaScript, TypeScript, Java
- Web Development: React, Node.js, Express, HTML, CSS
- Databases: MongoDB, PostgreSQL, MySQL
- Tools: Git, Docker, AWS, Linux"""

    # Sample job description
    sample_job_description = """We are looking for a talented Software Developer to join our team at TechCorp. 

Requirements:
- 2+ years of Python development experience
- Experience with React and modern web technologies
- Knowledge of databases and API development
- Strong problem-solving skills
- Excellent communication abilities

Responsibilities:
- Develop and maintain web applications
- Collaborate with cross-functional teams
- Write clean, maintainable code
- Participate in code reviews"""

    # Test data in the format expected by your LoRA model
    test_data = {
        "resume": sample_resume,
        "jobDescription": {
            "company": "TechCorp",
            "description": sample_job_description,
            "job_listing": sample_job_description
        },
        "style": "classic"
    }
    
    print("📝 Test Input Format:")
    print("Resume length:", len(sample_resume), "characters")
    print("Job description length:", len(sample_job_description), "characters")
    print("Style:", test_data["style"])
    print()
    
    try:
        # Run the cover letter generator
        print("🚀 Running cover letter generator...")
        result = subprocess.run(
            [sys.executable, "cover_letter_generator.py"],
            input=json.dumps(test_data),
            text=True,
            capture_output=True,
            cwd=Path(__file__).parent,
            timeout=60  # 60 second timeout
        )
        
        print(f"📊 Process return code: {result.returncode}")
        
        if result.stderr:
            print(f"📤 STDERR:")
            print(result.stderr)
            print()
        
        if result.returncode == 0:
            try:
                output = json.loads(result.stdout)
                
                if "coverLetter" in output:
                    print("✅ Cover letter generation successful!")
                    print("📄 Generated Cover Letter:")
                    print("=" * 50)
                    print(output["coverLetter"])
                    print("=" * 50)
                    print(f"📏 Length: {len(output['coverLetter'])} characters")
                    return True
                elif "error" in output:
                    print(f"❌ Error from generator: {output['error']}")
                    return False
                else:
                    print(f"❌ Unexpected output format: {output}")
                    return False
                    
            except json.JSONDecodeError:
                print(f"❌ Invalid JSON output:")
                print(result.stdout)
                return False
        else:
            print(f"❌ Process failed with return code {result.returncode}")
            print(f"STDOUT: {result.stdout}")
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ Process timed out after 60 seconds")
        return False
    except Exception as e:
        print(f"❌ Test failed with exception: {e}")
        return False

def main():
    """Main test function"""
    print("🎯 Resume + Job Description Format Test")
    print("This test verifies that your LoRA model works with the new format")
    print()
    
    success = test_cover_letter_generation()
    
    if success:
        print("\n🎉 Test completed successfully!")
        print("\n📋 Next steps:")
        print("1. Start your backend server: cd .. && npm run dev")
        print("2. Open the frontend Cover Letter Generator")
        print("3. Upload a resume PDF/text file")
        print("4. Paste a job description")
        print("5. Generate your cover letter!")
    else:
        print("\n⚠️ Test failed. Check the error messages above.")
        print("Your LoRA model might need different prompting or parameters.")

if __name__ == "__main__":
    main()
