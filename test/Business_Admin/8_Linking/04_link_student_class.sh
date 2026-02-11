#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Link Student to Class (Enroll)"
echo "POST $BASE_URL/BA/Link_Student_Class"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$BASE_URL/BA/Link_Student_Class" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d "{
    \"Student_Id\": $STUDENT_ID,
    \"Class_Id\": $CLASS_ID,
    \"Roll_No\": 1
  }"

echo ""
echo ">>> Copy 'enrollment_id' and update ENROLLMENT_ID in config.sh"
