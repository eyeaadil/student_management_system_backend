#!/bin/bash
source "$(dirname "$0")/../../config.sh"

print_header "Toggle School Status (Suspend)"
echo "POST $BASE_URL/BA/Toggle_School_Status"

json_curl \
  -X POST "$BASE_URL/BA/Toggle_School_Status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d "{
    \"School_Id\": $SCHOOL_ID,
    \"Is_Suspending\": true,
    \"Reason\": \"Testing suspension\"
  }"

echo ""
echo "--- Now re-activating ---"

json_curl \
  -X POST "$BASE_URL/BA/Toggle_School_Status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BA_TOKEN" \
  -d "{
    \"School_Id\": $SCHOOL_ID,
    \"Is_Suspending\": false,
    \"Reason\": \"Testing re-activation\"
  }"
