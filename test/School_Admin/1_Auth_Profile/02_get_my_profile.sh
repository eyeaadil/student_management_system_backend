#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Get My School Profile"
echo "GET $BASE_URL/SA/Get_My_School_Profile"

json_curl \
  -X GET "$BASE_URL/SA/Get_My_School_Profile" \
  -H "Authorization: Bearer $SA_TOKEN"
