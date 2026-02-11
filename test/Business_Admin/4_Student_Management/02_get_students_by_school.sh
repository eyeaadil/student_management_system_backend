#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Get Students By School"
echo "GET $BASE_URL/BA/Get_Students_By_School?School_Id=$SCHOOL_ID"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X GET "$BASE_URL/BA/Get_Students_By_School?School_Id=$SCHOOL_ID" \
  -H "Authorization: Bearer $BA_TOKEN"
