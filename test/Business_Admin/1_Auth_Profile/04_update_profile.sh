#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Update Business Admin Profile"
echo "POST $BASE_URL/BA/Update_Business_Admin_Profile"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$BASE_URL/BA/Update_Business_Admin_Profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d '{
    "Name": "Updated Admin Name",
    "Email": "updatedadmin@example.com"
  }'
