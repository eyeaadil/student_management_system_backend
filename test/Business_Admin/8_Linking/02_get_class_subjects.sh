#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Get Class Subjects"
echo "GET $BASE_URL/BA/Get_Class_Subjects?Class_Id=$CLASS_ID"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X GET "$BASE_URL/BA/Get_Class_Subjects?Class_Id=$CLASS_ID" \
  -H "Authorization: Bearer $BA_TOKEN"
