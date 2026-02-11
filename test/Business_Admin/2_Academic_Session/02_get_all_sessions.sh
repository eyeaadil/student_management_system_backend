#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Get All Academic Sessions"
echo "GET $BASE_URL/ALL/Get_All_Sessions"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X GET "$BASE_URL/ALL/Get_All_Sessions" \
  -H "Authorization: Bearer $BA_TOKEN"
