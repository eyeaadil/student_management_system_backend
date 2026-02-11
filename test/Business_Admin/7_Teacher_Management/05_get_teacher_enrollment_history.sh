#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Get Teacher Enrollment History"

curl -X GET "$BASE_URL/BA/Get_Teacher_Enrollment_History?Teacher_Id=$TEACHER_ID" \
  -H "Authorization: Bearer $BA_TOKEN" | json_pp
