#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Create Class"
echo "POST $BASE_URL/BA/Create_Class"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$BASE_URL/BA/Create_Class" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d "{
    \"School_Id\": $SCHOOL_ID,
    \"Session_Id\": $SESSION_ID,
    \"Class_Name\": \"Class 10-A\"
  }"

echo ""
echo ">>> Copy 'class_id' and update CLASS_ID in config.sh"
