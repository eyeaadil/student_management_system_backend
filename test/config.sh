#!/bin/bash
# =============================================
#   SHARED CONFIG FOR ALL TEST SCRIPTS
# =============================================

BASE_URL="http://localhost:3000"

# -------- TOKENS (Paste after running login scripts) --------
BA_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlIjoiQnVzaW5lc3NfQWRtaW4iLCJmaXJlYmFzZV9pZCI6ImhBemtXT09MMmZYQ2RCSjNqdUQzcGc1SlliUzIiLCJpYXQiOjE3NzA4MjAwMjYsImV4cCI6MTc3MTQyNDgyNn0.QlMlrO1UcbIvcRa4hNac3hHsFYk9Yfaw9NYYVLAa-u8"
SA_TOKEN="PASTE_YOUR_SA_JWT_TOKEN_HERE"

# -------- IDs (Update after each create response) --------
SESSION_ID=1
SCHOOL_ID=7
STUDENT_ID=1
SUBJECT_ID=1
CLASS_ID=1
TEACHER_ID=1

# Relation IDs (from linking responses)
CLASS_SUBJECT_RELATION_ID=1
ENROLLMENT_ID=1
CLASS_TEACHER_RELATION_ID=1
SUBJECT_TEACHER_LINK_ID=1

# -------- HELPER --------
print_header() {
  echo ""
  echo "============================================="
  echo "  $1"
  echo "============================================="
  echo ""
}
