#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Delete Subject"
echo "POST $BASE_URL/BA/Delete_Subject"
echo ">>> WARNING: This deletes the subject. Only run to test deletion."

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$BASE_URL/BA/Delete_Subject" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d "{
    \"Subject_Id\": $SUBJECT_ID
  }"
