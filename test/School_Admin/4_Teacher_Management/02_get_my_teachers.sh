#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "SA - Get My Teachers"
echo "GET $BASE_URL/SA/Get_My_Teachers"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X GET "$BASE_URL/SA/Get_My_Teachers" \
  -H "Authorization: Bearer $SA_TOKEN"
