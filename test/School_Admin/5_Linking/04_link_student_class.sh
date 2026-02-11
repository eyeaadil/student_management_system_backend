#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "SA - Link Student to Class"
echo "POST $BASE_URL/SA/Link_Student_Class"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$BASE_URL/SA/Link_Student_Class" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SA_TOKEN" \
  -d "{
    \"Student_Id\": $STUDENT_ID,
    \"Class_Id\": $CLASS_ID,
    \"Roll_No\": 1
  }"

echo ""
echo ">>> Copy 'enrollment_id' for unlink script"
