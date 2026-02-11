#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Create School"
echo "POST $BASE_URL/BA/Create_School"

json_curl \
  -X POST "$BASE_URL/BA/Create_School" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d '{
    "School_Name": "Woodbine Modern School",
    "Email": "WMS@gmail.com",
    "Phone": "+919876543000",
    "Tagline": "Believe in excellence",
    "Address": "123 WMS Street, City"
  }'

echo ""
echo ">>> Copy 'school_id' and update SCHOOL_ID in config.sh"
