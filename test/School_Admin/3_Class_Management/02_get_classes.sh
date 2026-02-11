#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "SA - Get Classes"
echo "GET $BASE_URL/SA/Get_Classes?Session_Id=$SESSION_ID"

json_curl \
  -X GET "$BASE_URL/SA/Get_Classes?Session_Id=$SESSION_ID" \
  -H "Authorization: Bearer $SA_TOKEN"
