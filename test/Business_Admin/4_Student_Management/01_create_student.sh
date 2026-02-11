#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Create Student"
echo "POST $BASE_URL/BA/Create_Student"

json_curl \
  -X POST "$BASE_URL/BA/Create_Student" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d "{
    \"School_Id\": 4,
    \"Student_Name\": \"Akai\",
    \"Parent_Name\": \"Virat Kohli\",
    \"Phone\": \"+918111111111\",
    \"Email\": \"akai@example.com\"
  }"

echo ""
echo ">>> Copy 'student_id' and update STUDENT_ID in config.sh"
