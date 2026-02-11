#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "SA - Edit Subject"
echo "POST $BASE_URL/SA/School_Edit_Subject"

json_curl \
  -X POST "$BASE_URL/SA/School_Edit_Subject" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SA_TOKEN" \
  -d "{
    \"Subject_Id\": $SUBJECT_ID,
    \"Subject_Name\": \"Advanced Science\"
  }"
