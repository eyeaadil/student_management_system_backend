#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "SA - Edit Class"
echo "POST $BASE_URL/SA/Edit_Class"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$BASE_URL/SA/Edit_Class" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SA_TOKEN" \
  -d "{
    \"Class_Id\": $CLASS_ID,
    \"Class_Name\": \"Class 9-B\"
  }"
