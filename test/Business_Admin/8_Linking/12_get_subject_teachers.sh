#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Get Subject Teachers"
echo "GET $BASE_URL/BA/Get_ClassSubject_SubjectTeachers?Class_Subject_Relation_Id=$CLASS_SUBJECT_RELATION_ID"

json_curl \
  -X GET "$BASE_URL/BA/Get_ClassSubject_SubjectTeachers?Class_Subject_Relation_Id=$CLASS_SUBJECT_RELATION_ID" \
  -H "Authorization: Bearer $BA_TOKEN"
