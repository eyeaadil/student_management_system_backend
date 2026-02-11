#!/bin/bash
# =============================================
#   SHARED CONFIG FOR ALL TEST SCRIPTS
# =============================================

BASE_URL="http://localhost:3000"

# -------- TOKENS (Paste after running login scripts) --------
BA_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlIjoiQnVzaW5lc3NfQWRtaW4iLCJmaXJlYmFzZV9pZCI6ImhBemtXT09MMmZYQ2RCSjNqdUQzcGc1SlliUzIiLCJpYXQiOjE3NzA4MjAwMjYsImV4cCI6MTc3MTQyNDgyNn0.QlMlrO1UcbIvcRa4hNac3hHsFYk9Yfaw9NYYVLAa-u8"
SA_TOKEN="PASTE_YOUR_SA_JWT_TOKEN_HERE"

# -------- IDs (Update after each create response) --------
SESSION_ID=1
SCHOOL_ID=7
STUDENT_ID=1
SUBJECT_ID=1
CLASS_ID=1
TEACHER_ID=1

# Relation IDs (from linking responses)
CLASS_SUBJECT_RELATION_ID=1
ENROLLMENT_ID=1
CLASS_TEACHER_RELATION_ID=1
SUBJECT_TEACHER_LINK_ID=1

# -------- HELPER --------
print_header() {
  echo ""
  echo "============================================="
  echo "  $1"
  echo "============================================="
  echo ""
}

# -------- JSON CURL HELPER --------
json_curl() {
    # Capture response + status code
    # We append -s -w "\n%{http_code}" to the arguments
    RESPONSE=$(curl -s -w "\n%{http_code}" "$@")
    
    # Extract Body (all lines except last) and Status (last line)
    BODY=$(echo "$RESPONSE" | sed '$d')
    HTTP_STATUS=$(echo "$RESPONSE" | tail -n 1)
    
    # Format JSON
    if [ -n "$BODY" ]; then
      # Try Python JSON tool first
      if echo "$BODY" | python3 -m json.tool > /dev/null 2>&1; then
          echo "$BODY" | python3 -m json.tool
      else
          # Fallback to raw output if not valid JSON
          echo "$BODY"
      fi
    else
        echo "(No Body)"
    fi
    
    echo ""
    echo "HTTP Status: $HTTP_STATUS"
    echo ""
}
