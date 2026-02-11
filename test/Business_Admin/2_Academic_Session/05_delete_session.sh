#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Delete Academic Session"
echo "POST $BASE_URL/BA/Delete_Session"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$BASE_URL/BA/Delete_Session" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d "{
    \"Session_Id\": $SESSION_ID
  }"

echo ""
echo ">>> WARNING: This deletes the session. Only run if you want to clean up."
