#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "SA - Delete Class"
echo "POST $BASE_URL/SA/Delete_Class"

json_curl \
  -X POST "$BASE_URL/SA/Delete_Class" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SA_TOKEN" \
  -d "{
    \"Class_Id\": $CLASS_ID
  }"
