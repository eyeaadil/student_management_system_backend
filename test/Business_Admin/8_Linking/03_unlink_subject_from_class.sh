#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Unlink Subject from Class"
echo "POST $BASE_URL/BA/Unlink_Subject"
echo ">>> WARNING: This removes the subject-class link."

json_curl \
  -X POST "$BASE_URL/BA/Unlink_Subject" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d "{
    \"Relation_Id\": $CLASS_SUBJECT_RELATION_ID
  }"
