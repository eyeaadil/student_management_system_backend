#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Update Business Admin Profile"
echo "POST $BASE_URL/BA/Update_Business_Admin_Profile"

json_curl \
  -X POST "$BASE_URL/BA/Update_Business_Admin_Profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d '{
    "Name": "Updated Admin Name",
    "Email": "updatedadmin@example.com"
  }'
