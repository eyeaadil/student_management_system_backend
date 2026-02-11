#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Delete Class"
echo "POST $BASE_URL/BA/Delete_Class"
echo ">>> WARNING: This deletes the class."

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$BASE_URL/BA/Delete_Class" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d "{
    \"Class_Id\": $CLASS_ID
  }"
