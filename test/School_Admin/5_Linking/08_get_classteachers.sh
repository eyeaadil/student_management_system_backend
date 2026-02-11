#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "SA - Get Class Teachers"
echo "GET $BASE_URL/SA/Get_ClassTeacher_To_Class?Class_Id=$CLASS_ID"

json_curl \
  -X GET "$BASE_URL/SA/Get_ClassTeacher_To_Class?Class_Id=$CLASS_ID" \
  -H "Authorization: Bearer $SA_TOKEN"
