#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Edit School"
echo "POST $BASE_URL/BA/Edit_School"

json_curl \
  -X POST "$BASE_URL/BA/Edit_School" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d "{
    \"School_Id\": $SCHOOL_ID,
    \"School_Name\": \"Updated Test School\",
    \"Tagline\": \"Updated Tagline\"
  }"
