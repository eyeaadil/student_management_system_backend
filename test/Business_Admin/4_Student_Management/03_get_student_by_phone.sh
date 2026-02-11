#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Get Student By Phone"
echo "POST $BASE_URL/BA/Get_Student_By_Phone"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$BASE_URL/BA/Get_Student_By_Phone" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d '{
    "Phone": "+919111111111"
  }'
