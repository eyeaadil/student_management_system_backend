#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "SA - Unlink Student from Class"
echo "POST $BASE_URL/SA/Unlink_Student_Class"

json_curl \
  -X POST "$BASE_URL/SA/Unlink_Student_Class" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SA_TOKEN" \
  -d "{
    \"Enrollment_Id\": $ENROLLMENT_ID
  }"
