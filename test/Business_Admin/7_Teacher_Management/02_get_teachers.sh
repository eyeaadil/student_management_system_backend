#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Get Teachers"
echo "GET $BASE_URL/BA/Get_Teachers?School_Id=$SCHOOL_ID"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X GET "$BASE_URL/BA/Get_Teachers?School_Id=$SCHOOL_ID" \
  -H "Authorization: Bearer $BA_TOKEN"
