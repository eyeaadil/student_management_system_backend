#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Get Teachers"
echo "GET $BASE_URL/BA/Get_Teachers?School_Id=$SCHOOL_ID"

json_curl \
  -X GET "$BASE_URL/BA/Get_Teachers?School_Id=$SCHOOL_ID" \
  -H "Authorization: Bearer $BA_TOKEN"
