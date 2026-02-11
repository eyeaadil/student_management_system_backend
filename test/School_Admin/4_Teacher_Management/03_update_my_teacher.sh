#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "SA - Update My Teacher"
echo "POST $BASE_URL/SA/Update_My_Teacher"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$BASE_URL/SA/Update_My_Teacher" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SA_TOKEN" \
  -d "{
    \"Teacher_Id\": $TEACHER_ID,
    \"Name\": \"Neha Kumar Maam\",
    \"Is_Active\": true
  }"
