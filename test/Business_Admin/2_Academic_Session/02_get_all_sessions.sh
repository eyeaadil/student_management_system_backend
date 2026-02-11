#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Get All Academic Sessions"
echo "GET $BASE_URL/ALL/Get_All_Sessions"

json_curl \
  -X GET "$BASE_URL/ALL/Get_All_Sessions" \
  -H "Authorization: Bearer $BA_TOKEN"
