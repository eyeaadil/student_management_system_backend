#!/bin/bash
source "$(dirname "$0")/../../config.sh"

FIREBASE_TOKEN="PASTE_FIREBASE_TOKEN_FROM_INDEX_HTML"

print_header "SA Login"
echo "POST $BASE_URL/SA/Login_School_Admin"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$BASE_URL/SA/Login_School_Admin" \
  -H "Content-Type: application/json" \
  -d "{
    \"Firebase_Token\": \"$FIREBASE_TOKEN\"
  }"

echo ""
echo ">>> Copy the 'token' value and paste as SA_TOKEN in config.sh"
