#!/bin/bash
set -e

BASE=http://localhost:3000/api

echo "=== AI SYMPTOM ANALYSIS TEST ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Patient Authentication
echo "1. Patient Authentication..."
PATIENT_EMAIL="test.patient+ai@local.dev"
PATIENT_PASS='Password123!'

# Signup (ignore if already exists)
curl -sS -X POST "$BASE/auth/signup" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$PATIENT_EMAIL\",\"password\":\"$PATIENT_PASS\"}" >/dev/null 2>&1 || true

# Login
PATIENT_TOKEN=$(curl -sS -X POST "$BASE/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$PATIENT_EMAIL\",\"password\":\"$PATIENT_PASS\"}" \
  | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).accessToken")

if [ -z "$PATIENT_TOKEN" ] || [ "$PATIENT_TOKEN" = "undefined" ]; then
  echo -e "${RED}❌ Patient login FAILED${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Patient authenticated${NC}"

# Step 2: Test AI Symptom Analysis
echo ""
echo "2. Testing AI Symptom Analysis..."
ANALYSIS_RESPONSE=$(curl -sS -X POST "$BASE/ai-analysis/analyze" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -d '{
    "symptoms": ["fever", "dry cough", "headache", "fatigue", "body aches"],
    "severity": "MODERATE",
    "duration": 3,
    "location": "chest",
    "medications": ["paracetamol"]
  }')

# Check if response contains analysis data
HAS_ANALYSIS=$(echo "$ANALYSIS_RESPONSE" | node -pe "try { const d = JSON.parse(require('fs').readFileSync(0,'utf8')); d.analysis ? 'YES' : 'NO' } catch(e) { 'ERROR' }")

if [ "$HAS_ANALYSIS" = "YES" ]; then
  ANALYSIS_ID=$(echo "$ANALYSIS_RESPONSE" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).analysis.id")
  PREDICTIONS_COUNT=$(echo "$ANALYSIS_RESPONSE" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).analysis.predictions.length")
  CONFIDENCE=$(echo "$ANALYSIS_RESPONSE" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).analysis.confidence")
  FIRST_DISEASE=$(echo "$ANALYSIS_RESPONSE" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).analysis.predictions[0].disease")
  FIRST_PROBABILITY=$(echo "$ANALYSIS_RESPONSE" | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).analysis.predictions[0].probability")
  
  echo -e "${GREEN}✅ AI Analysis SUCCESS${NC}"
  echo "   - Analysis ID: $ANALYSIS_ID"
  echo "   - Predictions: $PREDICTIONS_COUNT"
  echo "   - Top Prediction: $FIRST_DISEASE"
  echo "   - Probability: $FIRST_PROBABILITY%"
  echo "   - Confidence: $CONFIDENCE%"
  
  # Step 3: Test Analysis Save
  echo ""
  echo "3. Testing Analysis Save..."
  SAVE_RESPONSE=$(curl -sS -X POST "$BASE/ai-analysis/$ANALYSIS_ID/save" \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $PATIENT_TOKEN" \
    -d '{}')
  
  if echo "$SAVE_RESPONSE" | grep -q "id\|updatedAt"; then
    echo -e "${GREEN}✅ Analysis saved successfully${NC}"
  else
    echo -e "${YELLOW}⚠️  Save response: $SAVE_RESPONSE${NC}"
  fi
  
  # Step 4: Display Sample Prediction
  echo ""
  echo "4. Sample Prediction Details:"
  echo "$ANALYSIS_RESPONSE" | node -pe "const d = JSON.parse(require('fs').readFileSync(0,'utf8')); JSON.stringify(d.analysis.predictions[0], null, 2)"
  
  echo ""
  echo -e "${GREEN}=== ✅ AI SYMPTOM ANALYSIS TEST COMPLETE ===${NC}"
  
else
  echo -e "${RED}❌ AI Analysis FAILED${NC}"
  echo "Response: $ANALYSIS_RESPONSE"
  exit 1
fi
