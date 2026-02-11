#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "SA - Link ClassTeacher to Class"
echo "POST $BASE_URL/SA/Link_ClassTeacher_To_Class"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$BASE_URL/SA/Link_ClassTeacher_To_Class" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SA_TOKEN" \
  -d "{
    \"Class_Id\": $CLASS_ID,
    \"Teacher_Id\": $TEACHER_ID
  }"

echo ""
echo ">>> Copy 'id' for unlink script"
