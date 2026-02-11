#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Unlink Subject from Class"
echo "POST $BASE_URL/BA/Unlink_Subject"
echo ">>> WARNING: This removes the subject-class link."

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$BASE_URL/BA/Unlink_Subject" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d "{
    \"Relation_Id\": $CLASS_SUBJECT_RELATION_ID
  }"
