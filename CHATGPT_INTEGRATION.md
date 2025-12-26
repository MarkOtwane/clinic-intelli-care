# ChatGPT Integration for AI Analysis

## Overview
The AI Analysis module now supports both **Google Gemini** and **OpenAI ChatGPT** for symptom analysis. You can switch between them using environment variables.

## Configuration

### Environment Variables
Add these variables to your `.env` file:

```env
# Use ChatGPT (set to true) or Gemini (set to false)
USE_OPENAI=false
OPENAI_API_KEY="your-openai-api-key-here"

# If using Gemini (alternative provider)
AI_API_KEY="your-gemini-api-key-here"
AI_API_URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
```

### Getting an OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key and add it to your `.env` file as `OPENAI_API_KEY`

## How It Works

### Automatic Provider Selection
The `AIService` automatically selects the AI provider based on configuration:

- **If `USE_OPENAI=true`** and `OPENAI_API_KEY` is set → Uses ChatGPT (GPT-4 Turbo)
- **Otherwise** → Uses Google Gemini (fallback provider)

### ChatGPT API Details
- **Model**: `gpt-4-turbo` (or specify a different model)
- **Temperature**: 0.1 (low temperature for medical accuracy)
- **Max Tokens**: 2048

### Fallback Behavior
If both AI providers fail:
- The system falls back to `fallbackAnalysis()` which provides basic symptom-based recommendations
- This ensures the application continues to function without external dependencies

## Files Modified

### 1. **`backend/src/ai-analysis/ai.service.ts`**
   - Added OpenAI client initialization
   - New method: `analyzeSymptomsWithChatGPT()` - Handles ChatGPT API calls
   - Updated `analyzeSymptoms()` - Routes to appropriate provider
   - New method: `analyzeSymptomsWithGemini()` - Handles Gemini API calls

### 2. **`backend/.env.example`**
   - Added OpenAI API key configuration
   - Added `USE_OPENAI` flag for provider selection
   - Documented all AI-related environment variables

## Usage Example

### API Endpoint
POST `/ai-analysis/analyze`

```json
{
  "symptoms": ["fever", "cough", "sore throat"],
  "additionalInfo": {
    "severity": "moderate",
    "duration": 3,
    "location": "throat and chest",
    "medications": ["paracetamol"]
  }
}
```

### Response
```json
{
  "predictions": [
    {
      "disease": "Respiratory Infection",
      "probability": 85,
      "description": "Based on fever and cough symptoms...",
      "suggestedActions": ["Rest", "Stay hydrated", "Monitor symptoms"]
    }
  ],
  "recommendations": ["Consult a healthcare professional"],
  "confidence": 82,
  "followUpQuestions": ["How long have symptoms persisted?"]
}
```

## Switching Providers

To switch from Gemini to ChatGPT:
1. Update `.env`: `USE_OPENAI=true`
2. Ensure `OPENAI_API_KEY` is set
3. Restart the application

## Troubleshooting

### "AI API configuration is missing"
- Ensure `AI_API_KEY` and `AI_API_URL` are set if using Gemini
- Or ensure `OPENAI_API_KEY` is set if using ChatGPT

### ChatGPT not being used
- Check that `USE_OPENAI=true` in `.env`
- Verify `OPENAI_API_KEY` is valid and has active credits

### Invalid JSON Response
- The system attempts to clean markdown code blocks from responses
- If still failing, check API response format in logs

## Performance Notes

- **ChatGPT (GPT-4 Turbo)**: Higher accuracy for medical analysis, slightly slower
- **Gemini**: Faster response times, good for real-time analysis

Choose based on your requirements for speed vs accuracy.
