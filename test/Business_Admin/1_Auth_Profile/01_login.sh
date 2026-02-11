#!/bin/bash
source "$(dirname "$0")/../../config.sh"

FIREBASE_TOKEN="eyJhbGciOiJSUzI1NiIsImtpZCI6IjRiMTFjYjdhYjVmY2JlNDFlOTQ4MDk0ZTlkZjRjNWI1ZWNhMDAwOWUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc3R1ZGVudC1tYW5hZ2VtZW50LXN5c3RlLWM1Njc0IiwiYXVkIjoic3R1ZGVudC1tYW5hZ2VtZW50LXN5c3RlLWM1Njc0IiwiYXV0aF90aW1lIjoxNzcwODE3MDAwLCJ1c2VyX2lkIjoiaEF6a1dPT0wyZlhDZEJKM2p1RDNwZzVKWWJTMiIsInN1YiI6ImhBemtXT09MMmZYQ2RCSjNqdUQzcGc1SlliUzIiLCJpYXQiOjE3NzA4MTcwMDAsImV4cCI6MTc3MDgyMDYwMCwicGhvbmVfbnVtYmVyIjoiKzkxOTk5OTk5OTk5OSIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiKzkxOTk5OTk5OTk5OSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBob25lIn19.qHAAe08PyjhkPqv84VH_PjwXezOh-GiEb4vL-sxI_HLlfXgi6sxN3lrOYAWRtSdvCub_pJrQI3GjuqMv2XrGKtOs8mcGkFvnNz4hKA9PbZb23LBSOi4HlmlQ9BfDOgtz4mhAQ-MdB7O9NARdpoZXL0cX7s5IlA0iiw_9mhcoH0B5ImadTRgX8SmOZdeZGFSdKqSFsSUo2w6Ewo37AOiknHVGmWyDzrTTCTNGbzCWOt6uVUDIPg0j-0-M9SSENBnFrka_-9_KdAJ-e6L8Nx9yZUjxnaqfcnkcXPD0_7ArzNZG-NqTXHa0kR_O9cCz7A_B9IwBx2deXylX1jSnbfxLkQ"

print_header "BA Login"
echo "POST $BASE_URL/BA/Login_Business_Admin"

curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$BASE_URL/BA/Login_Business_Admin" \
  -H "Content-Type: application/json" \
  -d "{
    \"Firebase_Token\": \"$FIREBASE_TOKEN\"
  }"

echo ""
echo ">>> Copy the 'token' value and paste as BA_TOKEN in config.sh"
