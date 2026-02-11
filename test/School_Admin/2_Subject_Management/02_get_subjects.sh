#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "SA - Get Subjects"
echo "GET $BASE_URL/SA/School_Get_Subjects?Session_Id=$SESSION_ID"

json_curl \
  -X GET "$BASE_URL/SA/School_Get_Subjects?Session_Id=$SESSION_ID" \
  -H "Authorization: Bearer $SA_TOKEN"
