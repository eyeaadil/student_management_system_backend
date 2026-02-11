#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Unlink Subject Teacher"
echo "POST $BASE_URL/BA/Unlink_ClassSubject_SubjectTeacher"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$BASE_URL/BA/Unlink_ClassSubject_SubjectTeacher" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d "{
    \"Link_Id\": $SUBJECT_TEACHER_LINK_ID
  }"
