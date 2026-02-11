#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Update My School Profile"
echo "POST $BASE_URL/SA/Update_My_School_Profile"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$BASE_URL/SA/Update_My_School_Profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SA_TOKEN" \
  -d '{
    "School_Name": "My Updated School Name",
    "Tagline": "Excellence in Education",
    "Address": "456 School Road"
  }'
