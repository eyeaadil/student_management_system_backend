#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Withdraw Teacher $TEACHER_ID from School $SCHOOL_ID"

curl -X POST "$BASE_URL/BA/Withdraw_Teacher_From_School" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d '{
    "Teacher_Id": '$TEACHER_ID',
    "School_Id": '$SCHOOL_ID',
    "Leaving_Reason": "Resigned"
  }' | json_pp
