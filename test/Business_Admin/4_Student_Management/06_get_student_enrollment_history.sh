#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Get Student Enrollment History"

json_curl \
  -X GET "$BASE_URL/BA/Get_Student_Enrollment_History?Student_Id=$STUDENT_ID" \
  -H "Authorization: Bearer $BA_TOKEN"
