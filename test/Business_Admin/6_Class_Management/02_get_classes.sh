#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Get Classes"
echo "GET $BASE_URL/BA/Get_Classes?School_Id=$SCHOOL_ID&Session_Id=$SESSION_ID"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X GET "$BASE_URL/BA/Get_Classes?School_Id=$SCHOOL_ID&Session_Id=$SESSION_ID" \
  -H "Authorization: Bearer $BA_TOKEN"
