#!/bin/bash
source "$(dirname "$0")/../../config.sh"

FIREBASE_TOKEN="PASTE_FIREBASE_TOKEN_FROM_INDEX_HTML"

print_header "Student Login"
echo "POST $BASE_URL/Student/Login_Student"
echo "NOTE: Student login route may not be wired in Server.js yet."
echo ""

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$BASE_URL/Student/Login_Student" \
  -H "Content-Type: application/json" \
  -d "{
    \"Firebase_Token\": \"$FIREBASE_TOKEN\"
  }"

echo ""
echo ">>> If multiple profiles, you'll get an array of tokens (one per profile)"
