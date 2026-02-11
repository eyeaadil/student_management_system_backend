#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Create Academic Session"
echo "POST $BASE_URL/BA/Create_Academic_Session"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$BASE_URL/BA/Create_Academic_Session" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d '{
    "Session_Name": "2025-2026",
    "Start_Date": "2025-04-01",
    "End_Date": "2026-03-31"
  }'

echo ""
echo ">>> Copy 'session_id' and update SESSION_ID in config.sh"
