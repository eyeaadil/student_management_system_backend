#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "SA - Link Subject to Class"
echo "POST $BASE_URL/SA/Link_Subject"

json_curl \
  -X POST "$BASE_URL/SA/Link_Subject" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SA_TOKEN" \
  -d "{
    \"Class_Id\": $CLASS_ID,
    \"Subject_Id\": $SUBJECT_ID
  }"

echo ""
echo ">>> Copy 'class_subject_relation_id' for linking subject teachers"
