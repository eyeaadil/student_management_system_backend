#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "SA - Unlink Student from Class"
echo "POST $BASE_URL/SA/Unlink_Student_Class"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$BASE_URL/SA/Unlink_Student_Class" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SA_TOKEN" \
  -d "{
    \"Enrollment_Id\": $ENROLLMENT_ID
  }"
