#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Get All Schools"
echo "GET $BASE_URL/BA/Get_All_Schools"

json_curl \
  -X GET "$BASE_URL/BA/Get_All_Schools" \
  -H "Authorization: Bearer $BA_TOKEN"
