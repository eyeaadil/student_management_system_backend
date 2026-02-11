#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "SA - Delete Subject"
echo "POST $BASE_URL/SA/School_Delete_Subject"

json_curl \
  -X POST "$BASE_URL/SA/School_Delete_Subject" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SA_TOKEN" \
  -d "{
    \"Subject_Id\": $SUBJECT_ID
  }"
