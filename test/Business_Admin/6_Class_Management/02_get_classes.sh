#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Get Classes"
echo "GET $BASE_URL/BA/Get_Classes?School_Id=$SCHOOL_ID&Session_Id=$SESSION_ID"

json_curl \
  -X GET "$BASE_URL/BA/Get_Classes?School_Id=$SCHOOL_ID&Session_Id=$SESSION_ID" \
  -H "Authorization: Bearer $BA_TOKEN"
