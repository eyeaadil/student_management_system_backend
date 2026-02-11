#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Withdraw Student from School $SCHOOL_ID"

curl -X POST "$BASE_URL/BA/Withdraw_Student_From_School" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d '{
    "Student_Id": '$STUDENT_ID',
    "School_Id": '$SCHOOL_ID',
    "Leaving_Reason": "Dropped out"
  }' | json_pp
