# Local GPT-2 Model Setup for Cover Letter Generation

This guide will help you set up your local fine-tuned GPT-2 model for cover letter generation in CareerBloom.

## 📋 Prerequisites

- Python 3.8+
- Your fine-tuned GPT-2 model files
- Node.js backend server

## 🚀 Quick Setup

### 1. Run the Setup Script

```bash
cd server/scripts
python setup_local_model.py
```

This script will:
- Ask for your model path
- Create environment configuration
- Test your model
- Provide next steps

### 2. Manual Setup (Alternative)

If you prefer manual setup:

1. **Create a `.env` file** in the `server` directory:
```env
LOCAL_GPT2_PATH=/path/to/your/gpt2/model
USE_LOCAL_MODEL=true
MODEL_TYPE=causal
```

2. **Place your model files** in the specified directory:
```
your-gpt2-model/
├── config.json
├── pytorch_model.bin (or model.safetensors)
├── tokenizer.json
├── vocab.json
├── merges.txt
└── tokenizer_config.json
```

## 🧪 Testing Your Model

### Test via Script
```bash
cd server/scripts
python setup_local_model.py
# Choose "y" when asked to test
```

### Test via API
```bash
# Start your backend server
cd server
npm run dev

# Test the API endpoint
curl -X POST http://localhost:5000/api/coverletter/generate \
  -H "Content-Type: application/json" \
  -d '{
    "jobDescription": {
      "company": "TechCorp",
      "description": "Looking for a Python developer"
    },
    "userProfile": {
      "skills": ["Python", "React", "JavaScript"]
    },
    "style": "classic"
  }'
```

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LOCAL_GPT2_PATH` | Path to your GPT-2 model directory | `./gpt2-local` |
| `USE_LOCAL_MODEL` | Enable/disable local model | `true` |
| `MODEL_TYPE` | Model type (always `causal` for GPT-2) | `causal` |

### Model Requirements

Your GPT-2 model directory should contain:
- **config.json**: Model configuration
- **pytorch_model.bin** or **model.safetensors**: Model weights
- **tokenizer.json**: Tokenizer configuration
- **vocab.json**: Vocabulary file
- **merges.txt**: BPE merges file

## 🎯 Usage

### From Frontend
1. Navigate to Dashboard → Cover Letter tab
2. Fill in company name and skills
3. Click "Generate Cover Letter"
4. Your local GPT-2 model will generate the content

### API Integration
The system automatically:
1. Tries to load your local model first
2. Falls back to online GPT-2 if local model fails
3. Provides error messages for debugging

## 🐛 Troubleshooting

### Common Issues

**Model not loading:**
- Check file paths in `.env`
- Ensure all required files are present
- Check Python dependencies: `pip install transformers torch`

**Memory issues:**
- Use CPU-only mode: Set `device=-1` in the script
- Reduce `max_length` parameter
- Use model quantization if available

**Generation quality:**
- Adjust `temperature` (0.1-1.0)
- Modify `max_length` parameter
- Fine-tune prompts in the script

### Debug Mode
Enable debug logging by adding to your `.env`:
```env
DEBUG_MODEL=true
```

## 📝 Customization

### Modify Prompts
Edit `server/scripts/cover_letter_generator.py`:
```python
def build_prompt(company, skills, job_listing, style):
    # Customize your prompts here
    if style == "modern":
        prompt = f"Your custom modern prompt..."
    else:
        prompt = f"Your custom classic prompt..."
    return prompt
```

### Adjust Generation Parameters
```python
result = generator(
    prompt, 
    max_length=200,        # Adjust output length
    temperature=0.7,       # Adjust creativity (0.1-1.0)
    do_sample=True,        # Enable sampling
    top_p=0.9,            # Nucleus sampling
    top_k=50              # Top-k sampling
)
```

## 🔄 Fallback Behavior

If your local model fails:
1. System automatically falls back to online GPT-2
2. Error message displayed to user
3. Generation continues with fallback model
4. No interruption to user experience

## 📊 Performance Tips

- **GPU Usage**: Model automatically uses GPU if available
- **Memory**: Monitor RAM usage with large models
- **Speed**: Local models are typically faster than API calls
- **Quality**: Fine-tuned models should provide better results

## 🆘 Support

If you encounter issues:
1. Check the console logs in browser developer tools
2. Check backend server logs
3. Verify model files are complete and valid
4. Test with the setup script first

## 🎉 Success!

Once set up correctly, you should see:
- ✅ "Local GPT-2 model loaded successfully!" in server logs
- ✅ Cover letters generated using your fine-tuned model
- ✅ Faster generation times compared to online APIs
- ✅ Customized output based on your training data
