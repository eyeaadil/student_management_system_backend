#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "SA - Create Subject"
echo "POST $BASE_URL/SA/School_Create_Subject"

json_curl \
  -X POST "$BASE_URL/SA/School_Create_Subject" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SA_TOKEN" \
  -d "{
    \"Session_Id\": $SESSION_ID,
    \"Subject_Name\": \"Science\"
  }"

echo ""
echo ">>> Copy 'subject_id' for use in linking scripts"
