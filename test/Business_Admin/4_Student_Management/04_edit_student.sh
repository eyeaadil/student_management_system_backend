#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Edit Student"
echo "POST $BASE_URL/BA/Edit_Student"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$BASE_URL/BA/Edit_Student" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d "{
    \"Student_Id\": $STUDENT_ID,
    \"Student_Name\": \"Rahul Kumar Updated\",
    \"Parent_Name\": \"Rajesh Kumar\"
  }"
