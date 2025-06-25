import json
import sys
import os
from transformers import pipeline

def predict_career_path(current_skills, target_role):
    try:
        # Use a relative path for the model
        model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'finetuned_resume_model')
        
        # Check if model exists
        if not os.path.exists(model_path):
            raise Exception(f"Model not found at {model_path}. Please ensure the model is properly installed.")
            
        try:
            generator = pipeline('text2text-generation', model=model_path)
        except Exception as model_error:
            print(json.dumps({
                'error': f"Failed to load model: {str(model_error)}",
                'title': f"Path to {target_role}",
                'steps': [{
                    'year': 2024,
                    'title': 'Getting Started',
                    'description': 'Begin your journey by focusing on fundamental skills.',
                    'skills': current_skills,
                    'resources': []
                }],
                'missingSkills': [],
                'learningModules': []
            }))
            return 1
        
        # Create a prompt for the LLM
        prompt = f"""
        Analyze the career path from current skills to target role:
        
        Current Skills: {', '.join(current_skills)}
        Target Role: {target_role}
        
        Please provide:
        1. Missing skills required for the target role
        2. A step-by-step career path with timeline
        3. Learning resources for each step
        4. Suggested learning modules
        
        Format the response as a structured JSON with:
        - missingSkills: list of required skills
        - steps: list of career steps with year, title, description, skills, and resources
        - learningModules: list of suggested learning resources
        """
        
        # Generate the career path with improved parameters
        try:
            generated_text = generator(
                prompt,
                max_length=1000,
                num_return_sequences=1,
                no_repeat_ngram_size=3,
                temperature=0.7,
                do_sample=True
            )[0]['generated_text']
        except Exception as gen_error:
            print(json.dumps({
                'error': f"Text generation failed: {str(gen_error)}",
                'title': f"Path to {target_role}",
                'steps': create_fallback_steps(current_skills, target_role),
                'missingSkills': [],
                'learningModules': []
            }))
            return 1
        
        # Parse the generated text as JSON
        try:
            response = json.loads(generated_text)
        except json.JSONDecodeError:
            # If the model doesn't return valid JSON, create a structured response
            response = {
                "title": f"Path to {target_role}",
                "query": target_role,
                "missingSkills": extract_missing_skills(generated_text, current_skills, target_role),
                "steps": extract_steps(generated_text, current_skills, target_role),
                "learningModules": extract_learning_modules(generated_text)
            }
        
        print(json.dumps(response))
        return 0
        
    except Exception as e:
        print(json.dumps({
            'error': str(e),
            'title': f"Path to {target_role}",
            'steps': create_fallback_steps(current_skills, target_role),
            'missingSkills': [],
            'learningModules': []
        }))
        return 1

def create_fallback_steps(current_skills, target_role):
    return [
        {
            "year": 2024,
            "title": "Foundation Building",
            "description": f"Focus on strengthening your existing skills in {', '.join(current_skills)} while preparing for {target_role}.",
            "skills": current_skills,
            "resources": [
                {
                    "name": "Online Learning Platforms",
                    "url": "https://www.coursera.org"
                },
                {
                    "name": "Professional Certifications",
                    "url": "https://www.udacity.com"
                }
            ]
        }
    ]

def extract_missing_skills(text, current_skills, target_role):
    # Basic skill extraction based on role
    common_skills = {
        "developer": ["System Design", "Cloud Architecture", "Team Leadership"],
        "engineer": ["Project Management", "Technical Architecture", "Cross-functional Collaboration"],
        "manager": ["Leadership", "Strategic Planning", "Team Management"],
        "analyst": ["Data Analysis", "Statistical Methods", "Business Intelligence"]
    }
    
    # Find matching role category
    role_category = next((k for k in common_skills.keys() if k in target_role.lower()), "developer")
    return [skill for skill in common_skills[role_category] if skill.lower() not in [s.lower() for s in current_skills]]

def extract_steps(text, current_skills, target_role):
    # Create basic career progression steps
    return [
        {
            "year": 2024,
            "title": "Foundation Strengthening",
            "description": f"Master your current skills in {', '.join(current_skills)}",
            "skills": current_skills,
            "resources": [
                {
                    "name": "Online Courses",
                    "url": "https://www.udemy.com"
                }
            ]
        },
        {
            "year": 2025,
            "title": f"Transition to {target_role}",
            "description": f"Begin specializing in skills specific to {target_role}",
            "skills": extract_missing_skills(text, current_skills, target_role),
            "resources": [
                {
                    "name": "Professional Certification",
                    "url": "https://www.coursera.org"
                }
            ]
        }
    ]

def extract_learning_modules(text):
    return [
        {
            "name": "Professional Development Course",
            "url": "https://www.coursera.org",
            "type": "Course"
        },
        {
            "name": "Technical Certification",
            "url": "https://www.udacity.com",
            "type": "Certification"
        },
        {
            "name": "Practical Projects",
            "url": "https://www.github.com",
            "type": "Hands-on Practice"
        }
    ]

if __name__ == "__main__":
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())
        
        # Validate input
        if not input_data.get('skills') or not input_data.get('role'):
            print(json.dumps({
                'error': 'Invalid input: skills and role are required',
                'title': 'Error',
                'steps': [],
                'missingSkills': [],
                'learningModules': []
            }))
            sys.exit(1)
        
        # Generate career path
        exit_code = predict_career_path(
            input_data['skills'],
            input_data['role']
        )
        
        sys.exit(exit_code)
    except Exception as e:
        print(json.dumps({
            'error': f"Input processing error: {str(e)}",
            'title': 'Error',
            'steps': [],
            'missingSkills': [],
            'learningModules': []
        }))
        sys.exit(1) 