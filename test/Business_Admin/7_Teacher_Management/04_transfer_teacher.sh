#!/bin/bash
source "$(dirname "$0")/../../config.sh"

# You need a SECOND school ID to test transfer.
NEW_SCHOOL_ID=1

print_header "Transfer Teacher to New School"

curl -X POST "$BASE_URL/BA/Transfer_Teacher" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d '{
    "Teacher_Id": '$TEACHER_ID',
    "New_School_Id": '$NEW_SCHOOL_ID',
    "Leaving_Reason": "Transferred by management"
  }' | json_pp
