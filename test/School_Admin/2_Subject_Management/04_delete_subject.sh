#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "SA - Delete Subject"
echo "POST $BASE_URL/SA/School_Delete_Subject"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$BASE_URL/SA/School_Delete_Subject" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SA_TOKEN" \
  -d "{
    \"Subject_Id\": $SUBJECT_ID
  }"
