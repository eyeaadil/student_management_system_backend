#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Link Subject Teacher"
echo "POST $BASE_URL/BA/Link_ClassSubject_SubjectTeacher"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$BASE_URL/BA/Link_ClassSubject_SubjectTeacher" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d "{
    \"Class_Subject_Relation_Id\": $CLASS_SUBJECT_RELATION_ID,
    \"Teacher_Id\": $TEACHER_ID
  }"

echo ""
echo ">>> Copy 'link_id' from response and update SUBJECT_TEACHER_LINK_ID in config.sh"
