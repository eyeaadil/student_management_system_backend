#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Get Class Students"
echo "GET $BASE_URL/BA/Get_Class_Students?Class_Id=$CLASS_ID"

json_curl \
  -X GET "$BASE_URL/BA/Get_Class_Students?Class_Id=$CLASS_ID" \
  -H "Authorization: Bearer $BA_TOKEN"
