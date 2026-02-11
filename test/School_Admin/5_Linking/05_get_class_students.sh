#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "SA - Get Class Students"
echo "GET $BASE_URL/SA/Get_Class_Students?Class_Id=$CLASS_ID"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X GET "$BASE_URL/SA/Get_Class_Students?Class_Id=$CLASS_ID" \
  -H "Authorization: Bearer $SA_TOKEN"
