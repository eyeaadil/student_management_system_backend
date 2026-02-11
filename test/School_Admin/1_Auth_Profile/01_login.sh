#!/bin/bash
source "$(dirname "$0")/../../config.sh"

FIREBASE_TOKEN="PASTE_FIREBASE_TOKEN_FROM_INDEX_HTML"

print_header "SA Login"
echo "POST $BASE_URL/SA/Login_School_Admin"

json_curl \
  -X POST "$BASE_URL/SA/Login_School_Admin" \
  -H "Content-Type: application/json" \
  -d "{
    \"Firebase_Token\": \"$FIREBASE_TOKEN\"
  }"

echo ""
echo ">>> Copy the 'token' value and paste as SA_TOKEN in config.sh"
