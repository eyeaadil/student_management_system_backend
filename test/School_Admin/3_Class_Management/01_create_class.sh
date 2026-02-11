#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "SA - Create Class"
echo "POST $BASE_URL/SA/Create_Class"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$BASE_URL/SA/Create_Class" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SA_TOKEN" \
  -d "{
    \"Session_Id\": $SESSION_ID,
    \"Class_Name\": \"Class 9-A\"
  }"

echo ""
echo ">>> Copy 'class_id' for use in linking scripts"
