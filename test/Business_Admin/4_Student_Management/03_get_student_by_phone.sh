#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Get Student By Phone"
echo "POST $BASE_URL/BA/Get_Student_By_Phone"

json_curl \
  -X POST "$BASE_URL/BA/Get_Student_By_Phone" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d '{
    "Phone": "+919111111111"
  }'
