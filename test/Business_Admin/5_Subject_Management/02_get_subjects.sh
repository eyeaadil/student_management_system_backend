#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Get Subjects"
echo "GET $BASE_URL/BA/Get_Subjects?School_Id=$SCHOOL_ID&Session_Id=$SESSION_ID"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X GET "$BASE_URL/BA/Get_Subjects?School_Id=$SCHOOL_ID&Session_Id=$SESSION_ID" \
  -H "Authorization: Bearer $BA_TOKEN"
