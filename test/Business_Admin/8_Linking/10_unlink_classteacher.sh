#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Unlink ClassTeacher from Class"
echo "POST $BASE_URL/BA/Unlink_ClassTeacher_To_Class"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$BASE_URL/BA/Unlink_ClassTeacher_To_Class" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d "{
    \"Relation_Id\": $CLASS_TEACHER_RELATION_ID
  }"
