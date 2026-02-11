#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "SA - Get Subject Teachers"
echo "GET $BASE_URL/SA/Get_ClassSubject_SubjectTeachers?Class_Subject_Relation_Id=$CLASS_SUBJECT_RELATION_ID"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X GET "$BASE_URL/SA/Get_ClassSubject_SubjectTeachers?Class_Subject_Relation_Id=$CLASS_SUBJECT_RELATION_ID" \
  -H "Authorization: Bearer $SA_TOKEN"
