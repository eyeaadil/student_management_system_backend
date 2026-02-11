#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Create Business Admin"
echo "POST $BASE_URL/BA/Create_Business_Admin"

json_curl \
  -X POST "$BASE_URL/BA/Create_Business_Admin" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d '{
    "Name": "Test Admin",
    "Email": "testadmin@example.com",
    "Phone": "+911234567890"
  }'
