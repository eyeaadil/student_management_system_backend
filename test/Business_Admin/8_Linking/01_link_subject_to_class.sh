#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Link Subject to Class"
echo "POST $BASE_URL/BA/Link_Subject"

json_curl \
  -X POST "$BASE_URL/BA/Link_Subject" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d "{
    \"Class_Id\": $CLASS_ID,
    \"Subject_Id\": $SUBJECT_ID
  }"

echo ""
echo ">>> Copy 'class_subject_relation_id' and update CLASS_SUBJECT_RELATION_ID in config.sh"
