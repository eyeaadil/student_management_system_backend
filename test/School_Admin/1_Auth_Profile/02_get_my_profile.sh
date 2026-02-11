#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Get My School Profile"
echo "GET $BASE_URL/SA/Get_My_School_Profile"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X GET "$BASE_URL/SA/Get_My_School_Profile" \
  -H "Authorization: Bearer $SA_TOKEN"
