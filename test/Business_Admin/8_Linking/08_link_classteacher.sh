#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Link ClassTeacher to Class"
echo "POST $BASE_URL/BA/Link_ClassTeacher_To_Class"

json_curl \
  -X POST "$BASE_URL/BA/Link_ClassTeacher_To_Class" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d "{
    \"Class_Id\": $CLASS_ID,
    \"Teacher_Id\": $TEACHER_ID
  }"

echo ""
echo ">>> Copy 'id' from response and update CLASS_TEACHER_RELATION_ID in config.sh"
