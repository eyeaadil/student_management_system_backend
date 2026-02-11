#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Update Teacher"
echo "POST $BASE_URL/BA/Update_Teacher"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$BASE_URL/BA/Update_Teacher" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d "{
    \"Teacher_Id\": $TEACHER_ID,
    \"Name\": \"Amit Kumar Sir\",
    \"Email\": \"amitkumar@school.com\"
  }"
