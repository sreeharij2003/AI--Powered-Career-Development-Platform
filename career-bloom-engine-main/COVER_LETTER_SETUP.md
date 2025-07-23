# Cover Letter Generation Setup Guide

## Overview
This guide helps you set up the GPT-2 LoRA fine-tuned model integration for cover letter generation in your CareerBloom platform.

## Files Added/Modified

### Backend Files:
1. **`server/.env`** - Added GPT2_MODEL_PATH environment variable
2. **`server/scripts/generateCoverLetter.py`** - Python script for GPT-2 model inference
3. **`server/controllers/coverLetterController.ts`** - Node.js controller for cover letter API
4. **`server/routes/coverLetterRoutes.ts`** - Express routes for cover letter endpoints
5. **`server/index.ts`** - Added cover letter routes to main server
6. **`server/requirements-cover-letter.txt`** - Python dependencies

### Frontend Files:
1. **`src/components/career-tools/CoverLetterGenerator.tsx`** - Updated to use real API

### Test Files:
1. **`test-cover-letter-setup.js`** - Test script to verify setup

## Setup Instructions

### 1. Install Python Dependencies
```bash
cd server
pip install -r requirements-cover-letter.txt
```

Required packages:
- torch>=1.9.0
- transformers>=4.20.0
- peft>=0.3.0
- accelerate>=0.20.0

### 2. Verify Model Path
Make sure your GPT-2 LoRA model is at:
```
C:\Users\ASUS\Downloads\gpt2-lora-finetuned\gpt2-lora-finetuned
```

The directory should contain:
- adapter_config.json
- adapter_model.safetensors
- tokenizer files

### 3. Start the Server
```bash
cd server
npm run dev
```

### 4. Test the Setup

#### Option A: Automated Test (JSON API)
```bash
# From the root directory
node test-cover-letter-setup.js
```

#### Option B: Manual Test (File Upload)
1. Start the server: `cd server && npm run dev`
2. Open the frontend: `npm run dev` (from root directory)
3. Navigate to Cover Letter Generator
4. Upload the sample file: `test-resume.txt`
5. Enter a job description
6. Click "Generate Cover Letter"

#### Option C: Test with cURL (File Upload)
```bash
curl -X POST http://localhost:5000/api/cover-letter/generate \
  -F "resume=@test-resume.txt" \
  -F "jobDescription=Looking for a React developer with 3+ years experience"
```

## API Endpoints

### Generate Cover Letter
```
POST /api/cover-letter/generate
Content-Type: application/json

{
  "resumeText": "Your resume content here...",
  "jobDescription": "Job description here..."
}
```

**Response:**
```json
{
  "success": true,
  "coverLetter": "Generated cover letter content...",
  "message": "Cover letter generated successfully"
}
```

### Health Check
```
GET /api/cover-letter/health
```

**Response:**
```json
{
  "success": true,
  "healthy": true,
  "details": {
    "modelPathConfigured": true,
    "modelPathExists": true,
    "scriptExists": true,
    "pythonAvailable": true
  },
  "message": "Cover letter service is healthy"
}
```

## Frontend Usage

The cover letter generator component now:
1. **File Upload Support**: Accepts both PDF and text files (.pdf, .txt)
2. **Backend Processing**: Sends files to backend for text extraction using robust PDF parsing
3. **API Integration**: Sends extracted text + job description to GPT-2 model
4. **User Interface**: Displays generated cover letter with copy, download, and save functionality

### Supported File Types:
- **PDF files** (.pdf) - Extracted using pdf-parse library
- **Text files** (.txt) - Read directly as plain text
- **File size limit**: 10MB maximum

## Troubleshooting

### Common Issues:

1. **Python dependencies not installed**
   ```bash
   pip install torch transformers peft accelerate
   ```

2. **Model path not found**
   - Verify the path in `.env` file
   - Check if the model files exist

3. **Python not found**
   - Make sure Python is in your PATH
   - Try using `python3` instead of `python`

4. **Memory issues**
   - The model requires significant RAM
   - Close other applications if needed

5. **Timeout errors**
   - First generation might take longer (model loading)
   - Subsequent generations should be faster

### Debug Steps:

1. **Check health endpoint:**
   ```bash
   curl http://localhost:5000/api/cover-letter/health
   ```

2. **Test Python script directly:**
   ```bash
   cd server/scripts
   python generateCoverLetter.py "test resume" "test job description"
   ```

3. **Check server logs:**
   - Look for Python process errors
   - Check model loading messages

## Performance Notes

- **First request**: Takes longer due to model loading (~30-60 seconds)
- **Subsequent requests**: Much faster (~5-10 seconds)
- **Memory usage**: ~2-4GB RAM for the model
- **Timeout**: Set to 5 minutes for safety

## Security Considerations

- Model path is in environment variables
- Input validation on both frontend and backend
- No sensitive data logged
- Python process isolation

## Next Steps

1. Test with your actual fine-tuned model
2. Adjust prompts in Python script if needed
3. Fine-tune timeout and memory settings
4. Add more robust error handling
5. Consider caching for better performance
