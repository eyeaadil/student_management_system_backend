#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "SA - Unlink Subject from Class"
echo "POST $BASE_URL/SA/Unlink_Subject"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$BASE_URL/SA/Unlink_Subject" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SA_TOKEN" \
  -d "{
    \"Relation_Id\": $CLASS_SUBJECT_RELATION_ID
  }"
