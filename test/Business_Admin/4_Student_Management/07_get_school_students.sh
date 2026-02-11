#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Get All Students Enrolled in School $SCHOOL_ID"

curl -X GET "$BASE_URL/BA/Get_School_Students?School_Id=$SCHOOL_ID&Include_Inactive=true" \
  -H "Authorization: Bearer $BA_TOKEN" | json_pp
