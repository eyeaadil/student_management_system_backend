#!/bin/bash
source "$(dirname "$0")/../../config.sh"

# You need a SECOND school ID to test transfer.
# If you only have one school, create another one first.
NEW_SCHOOL_ID=4

print_header "Transfer Student to New School"

curl -X POST "$BASE_URL/BA/Transfer_Student" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d '{
    "Student_Id": '$STUDENT_ID',
    "New_School_Id": '$NEW_SCHOOL_ID',
    "Leaving_Reason": "Relocating to new city"
  }' | json_pp
