#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Edit Subject"
echo "POST $BASE_URL/BA/Edit_Subject"

json_curl \
  -X POST "$BASE_URL/BA/Edit_Subject" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d "{
    \"Subject_Id\": $SUBJECT_ID,
    \"Subject_Name\": \"Advanced Mathematics\"
  }"
