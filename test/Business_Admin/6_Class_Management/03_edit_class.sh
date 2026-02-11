#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Edit Class"
echo "POST $BASE_URL/BA/Edit_Class"

json_curl \
  -X POST "$BASE_URL/BA/Edit_Class" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d "{
    \"Class_Id\": $CLASS_ID,
    \"Class_Name\": \"Class 10-B\"
  }"
