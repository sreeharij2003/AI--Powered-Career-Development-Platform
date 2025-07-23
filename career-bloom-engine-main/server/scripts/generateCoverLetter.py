#!/usr/bin/env python3
"""
Cover Letter Generation Script using GPT-2 LoRA Fine-tuned Model
Input: Resume text + Job description (via command line arguments)
Output: Generated cover letter (printed to stdout)
"""

import sys
import json
import os
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel
import torch

def load_model(model_path):
    """Load the GPT-2 LoRA fine-tuned model"""
    try:
        print(f"Loading model from: {model_path}", file=sys.stderr)
        
        # Load base model and tokenizer
        base_model_name = "gpt2"
        tokenizer = AutoTokenizer.from_pretrained(base_model_name)
        base_model = AutoModelForCausalLM.from_pretrained(base_model_name)
        
        # Add padding token if it doesn't exist
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        
        # Load LoRA adapter
        model = PeftModel.from_pretrained(base_model, model_path)
        
        print("Model loaded successfully", file=sys.stderr)
        return model, tokenizer
        
    except Exception as e:
        print(f"Error loading model: {str(e)}", file=sys.stderr)
        raise

def generate_cover_letter(model, tokenizer, resume_text, job_description, max_length=800):
    """Generate cover letter using the fine-tuned model"""
    try:
        # Clean and truncate inputs
        resume_text = resume_text.strip()[:1000]  # Limit resume length
        job_description = job_description.strip()[:500]  # Limit job description length

        # Create input prompt - try different formats based on your training
        # You can uncomment different formats to test which works best with your model

        # Format 1: Instruction-based
        prompt = f"Write a professional cover letter based on this resume and job description.\n\nResume:\n{resume_text}\n\nJob Description:\n{job_description}\n\nCover Letter:\nDear Hiring Manager,\n\n"

        # Format 2: Simple concatenation (uncomment to try)
        # prompt = f"Resume: {resume_text}\n\nJob Description: {job_description}\n\nCover Letter:"

        # Format 3: Template-based (uncomment to try)
        # prompt = f"Given the following resume and job description, write a cover letter:\n\nRESUME:\n{resume_text}\n\nJOB:\n{job_description}\n\nCOVER LETTER:\n"

        # Prompt info (removed for cleaner output)

        # Tokenize input with better parameters
        inputs = tokenizer.encode(prompt, return_tensors="pt", truncation=True, max_length=300)

        # Input tokens info (removed for cleaner output)

        # Generate cover letter with improved parameters
        with torch.no_grad():
            outputs = model.generate(
                inputs,
                max_length=max_length,
                min_length=inputs.shape[1] + 100,  # Ensure minimum generation
                num_return_sequences=1,
                temperature=0.8,  # Slightly higher for creativity
                do_sample=True,
                top_p=0.9,  # Nucleus sampling
                top_k=50,   # Top-k sampling
                pad_token_id=tokenizer.eos_token_id,
                no_repeat_ngram_size=3,  # Avoid repetition
                repetition_penalty=1.2,  # Penalize repetition
                early_stopping=True
            )

        # Decode the generated text
        generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

        # Generated text info (removed for cleaner output)

        # Extract only the cover letter part (after the prompt)
        cover_letter = generated_text[len(prompt):].strip()

        # Check if the output is reasonable
        quality_check = is_poor_quality(cover_letter)

        if len(cover_letter) < 50 or quality_check:
            # Use fallback without showing message in terminal
            cover_letter = create_fallback_cover_letter(resume_text, job_description)
        else:
            # Post-process the cover letter
            cover_letter = post_process_cover_letter(cover_letter)

        return cover_letter

    except Exception as e:
        print(f"Error generating cover letter: {str(e)}", file=sys.stderr)
        raise

def post_process_cover_letter(cover_letter):
    """Clean up and improve the generated cover letter"""
    try:
        # Remove incomplete sentences at the end
        sentences = cover_letter.split('.')
        if len(sentences) > 1 and len(sentences[-1].strip()) < 10:
            sentences = sentences[:-1]

        cover_letter = '. '.join(sentences)
        if not cover_letter.endswith('.'):
            cover_letter += '.'

        # Add proper closing if missing
        if 'sincerely' not in cover_letter.lower() and 'regards' not in cover_letter.lower():
            cover_letter += '\n\nSincerely,\n[Your Name]'

        # Clean up extra whitespace
        lines = [line.strip() for line in cover_letter.split('\n')]
        cover_letter = '\n'.join(line for line in lines if line)

        return cover_letter

    except Exception as e:
        print(f"Error in post-processing: {str(e)}", file=sys.stderr)
        return cover_letter

def is_poor_quality(text):
    """Check if the generated text is of poor quality"""
    # Check for common signs of poor generation
    if len(text) < 50:
        return True

    # Check for excessive repetition
    words = text.lower().split()
    unique_ratio = len(set(words)) / len(words) if len(words) > 0 else 0
    if unique_ratio < 0.3:  # Less than 30% unique words
        return True

    # Check for incomplete sentences
    if not any(text.endswith(punct) for punct in ['.', '!', '?']):
        return True

    # Check for garbled text patterns
    garbled_patterns = ['algorithmspython', 'applicationresearch', 'qualifications/certifications']
    for pattern in garbled_patterns:
        if pattern in text.lower():
            return True

    return False

def create_fallback_cover_letter(resume_text, job_description):
    """Create a structured cover letter as fallback"""
    # Extract key information
    skills = extract_skills_from_resume(resume_text)
    company_info = extract_company_from_job(job_description)

    cover_letter = f"""Dear Hiring Manager,

I am writing to express my strong interest in the position described in your job posting{company_info}. After reviewing the requirements, I am confident that my background and skills make me an excellent candidate for this role.

Based on my resume, I bring the following relevant qualifications:

• Technical expertise in {', '.join(skills[:3]) if skills else 'software development and programming'}
• Proven experience in full-stack development and modern technologies
• Strong problem-solving abilities and attention to detail
• Excellent communication and collaboration skills

The requirements outlined in your job description align perfectly with my experience and career goals. I am particularly excited about the opportunity to contribute to your team and apply my skills in a challenging and dynamic environment.

I would welcome the opportunity to discuss how my background and enthusiasm can contribute to your organization's success. Thank you for considering my application.

Sincerely,
[Your Name]"""

    return cover_letter

def extract_skills_from_resume(resume_text):
    """Extract technical skills from resume"""
    common_skills = ['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Java', 'HTML', 'CSS', 'MongoDB', 'Express', 'Machine Learning', 'Deep Learning', 'Data Science']
    found_skills = []

    resume_lower = resume_text.lower()
    for skill in common_skills:
        if skill.lower() in resume_lower:
            found_skills.append(skill)

    return found_skills[:5]  # Return top 5 skills

def extract_company_from_job(job_description):
    """Try to extract company name from job description"""
    # Simple extraction - look for common patterns
    lines = job_description.split('\n')
    for line in lines[:3]:  # Check first few lines
        if 'company' in line.lower() or 'organization' in line.lower():
            return f" at {line.strip()}"

    return ""

def main():
    """Main function to handle command line arguments and generate cover letter"""
    try:
        # Check if correct number of arguments provided
        if len(sys.argv) != 3:
            print("Usage: python generateCoverLetter.py <resume_text> <job_description>", file=sys.stderr)
            sys.exit(1)
        
        resume_text = sys.argv[1]
        job_description = sys.argv[2]
        
        # Get model path from environment variable
        model_path = os.getenv('GPT2_MODEL_PATH')
        if not model_path:
            raise ValueError("GPT2_MODEL_PATH environment variable not set")
        
        if not os.path.exists(model_path):
            raise ValueError(f"Model path does not exist: {model_path}")
        
        print("Starting cover letter generation...", file=sys.stderr)
        
        # Load model
        model, tokenizer = load_model(model_path)
        
        # Generate cover letter
        cover_letter = generate_cover_letter(model, tokenizer, resume_text, job_description)
        
        # Create response JSON
        response = {
            "success": True,
            "coverLetter": cover_letter,
            "message": "Cover letter generated successfully"
        }
        
        # Output JSON response to stdout
        print(json.dumps(response))
        
    except Exception as e:
        # Output error JSON to stdout
        error_response = {
            "success": False,
            "error": str(e),
            "coverLetter": ""
        }
        print(json.dumps(error_response))
        sys.exit(1)

if __name__ == "__main__":
    main()
