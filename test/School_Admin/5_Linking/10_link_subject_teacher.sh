#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "SA - Link Subject Teacher"
echo "POST $BASE_URL/SA/Link_ClassSubject_SubjectTeacher"

json_curl \
  -X POST "$BASE_URL/SA/Link_ClassSubject_SubjectTeacher" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SA_TOKEN" \
  -d "{
    \"Class_Subject_Relation_Id\": $CLASS_SUBJECT_RELATION_ID,
    \"Teacher_Id\": $TEACHER_ID
  }"

echo ""
echo ">>> Copy 'link_id' for unlink script"
