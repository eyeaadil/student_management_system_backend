#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Create Teacher"
echo "POST $BASE_URL/BA/Create_Teacher"

json_curl \
  -X POST "$BASE_URL/BA/Create_Teacher" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d "{
    \"School_Id\": $SCHOOL_ID,
    \"Name\": \"Amit Sir\",
    \"Phone\": \"+919222222222\",
    \"Email\": \"amit@school.com\"
  }"

echo ""
echo ">>> Copy 'teacher_id' and update TEACHER_ID in config.sh"
