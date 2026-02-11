#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "SA - Create Teacher"
echo "POST $BASE_URL/SA/Create_Teacher"

json_curl \
  -X POST "$BASE_URL/SA/Create_Teacher" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SA_TOKEN" \
  -d '{
    "Name": "Neha Maam",
    "Phone": "+919444444444",
    "Email": "neha@school.com"
  }'

echo ""
echo ">>> Copy 'teacher_id' for use in linking scripts"
