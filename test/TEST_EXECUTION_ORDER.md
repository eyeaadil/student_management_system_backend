
---

## 🔄 Phase 3: Transfer & History (New Feature)

To test transferring students/teachers, you need a **second school**.

### 11. Create Second School (Destination)
```bash
bash test/Business_Admin/3_School_Management/01_create_school.sh
```
👉 **Action:** Note this new ID as `NEW_SCHOOL_ID` (e.g., 2).

### 12. Transfer Student
*Moves student from School 1 to School 2*
```bash
# Edit the script to set NEW_SCHOOL_ID if it's not 2
bash test/Business_Admin/4_Student_Management/05_transfer_student.sh
```

### 13. Verify Student History
*Shows inactive enrollment at School 1 and active at School 2*
```bash
bash test/Business_Admin/4_Student_Management/06_get_student_enrollment_history.sh
```

### 14. Transfer Teacher
*Moves teacher from School 1 to School 2*
```bash
bash test/Business_Admin/7_Teacher_Management/04_transfer_teacher.sh
```

### 15. Verify Teacher History
```bash
bash test/Business_Admin/7_Teacher_Management/05_get_teacher_enrollment_history.sh
```
