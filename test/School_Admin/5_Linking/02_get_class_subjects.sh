#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "SA - Get Class Subjects"
echo "GET $BASE_URL/SA/Get_Class_Subjects?Class_Id=$CLASS_ID"

json_curl \
  -X GET "$BASE_URL/SA/Get_Class_Subjects?Class_Id=$CLASS_ID" \
  -H "Authorization: Bearer $SA_TOKEN"
