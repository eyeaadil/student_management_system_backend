#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Create Student And Link To Class"
echo "POST $BASE_URL/BA/Create_Student_And_Link_To_Class"

json_curl \
  -X POST "$BASE_URL/BA/Create_Student_And_Link_To_Class" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d "{
    \"School_Id\": $SCHOOL_ID,
    \"Class_Id\": $CLASS_ID,
    \"Roll_No\": 2,
    \"Student_Name\": \"Priya Sharma\",
    \"Parent_Name\": \"Suresh Sharma\",
    \"Phone\": \"+919333333333\",
    \"Email\": \"priya@example.com\"
  }"
