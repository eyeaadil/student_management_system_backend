#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "SA - Unlink ClassTeacher from Class"
echo "POST $BASE_URL/SA/Unlink_ClassTeacher_To_Class"

json_curl \
  -X POST "$BASE_URL/SA/Unlink_ClassTeacher_To_Class" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SA_TOKEN" \
  -d "{
    \"Relation_Id\": $CLASS_TEACHER_RELATION_ID
  }"
