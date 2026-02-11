#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Activate Academic Session"
echo "POST $BASE_URL/BA/Activate_Session"

json_curl \
  -X POST "$BASE_URL/BA/Activate_Session" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d "{
    \"Session_Id\": $SESSION_ID
  }"
