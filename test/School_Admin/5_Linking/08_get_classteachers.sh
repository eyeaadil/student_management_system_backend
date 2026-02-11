#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "SA - Get Class Teachers"
echo "GET $BASE_URL/SA/Get_ClassTeacher_To_Class?Class_Id=$CLASS_ID"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X GET "$BASE_URL/SA/Get_ClassTeacher_To_Class?Class_Id=$CLASS_ID" \
  -H "Authorization: Bearer $SA_TOKEN"
