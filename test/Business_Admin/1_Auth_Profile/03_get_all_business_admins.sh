#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Get All Business Admins"
echo "GET $BASE_URL/BA/Get_All_Business_Admins"

json_curl \
  -X GET "$BASE_URL/BA/Get_All_Business_Admins" \
  -H "Authorization: Bearer $BA_TOKEN"
