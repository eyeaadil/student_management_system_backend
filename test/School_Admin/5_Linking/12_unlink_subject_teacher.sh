#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "SA - Unlink Subject Teacher"
echo "POST $BASE_URL/SA/Unlink_ClassSubject_SubjectTeacher"

json_curl \
  -X POST "$BASE_URL/SA/Unlink_ClassSubject_SubjectTeacher" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SA_TOKEN" \
  -d "{
    \"Link_Id\": $SUBJECT_TEACHER_LINK_ID
  }"
