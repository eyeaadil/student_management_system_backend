#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Create Subject"
echo "POST $BASE_URL/BA/Create_Subject"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$BASE_URL/BA/Create_Subject" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d "{
    \"School_Id\": $SCHOOL_ID,
    \"Session_Id\": $SESSION_ID,
    \"Subject_Name\": \"Mathematics\"
  }"

echo ""
echo ">>> Copy 'subject_id' and update SUBJECT_ID in config.sh"
