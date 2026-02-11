# Test Scripts — Execution Order Guide

## Prerequisites
1. Start the server: `node Server.js`
2. Open `index.html` in browser to generate Firebase tokens via OTP

## How to Run
```bash
bash test/Business_Admin/1_Auth_Profile/01_login.sh
```

## Step-by-Step Execution Order

### Phase 1: Business Admin Setup

**1. Login & Auth** → `Business_Admin/1_Auth_Profile/`
```
01_login.sh          ← Paste Firebase token, get BA JWT → put in config.sh as BA_TOKEN
02_create_business_admin.sh
03_get_all_business_admins.sh
04_update_profile.sh
```

**2. Academic Session** → `Business_Admin/2_Academic_Session/`
```
01_create_session.sh    ← Copy session_id → config.sh SESSION_ID
02_get_all_sessions.sh
03_activate_session.sh  ← Must activate before creating classes/subjects
04_deactivate_session.sh (test, then re-activate using 03)
05_delete_session.sh    (SKIP unless cleaning up)
```

**3. School Management** → `Business_Admin/3_School_Management/`
```
01_create_school.sh     ← Copy school_id → config.sh SCHOOL_ID
02_get_all_schools.sh
03_edit_school.sh
04_toggle_school_status.sh (suspends then re-activates)
```

**4. Student Management** → `Business_Admin/4_Student_Management/`
```
01_create_student.sh    ← Copy student_id → config.sh STUDENT_ID
02_get_students_by_school.sh
03_get_student_by_phone.sh
04_edit_student.sh
```

**5. Subject Management** → `Business_Admin/5_Subject_Management/`
```
01_create_subject.sh    ← Copy subject_id → config.sh SUBJECT_ID
02_get_subjects.sh
03_edit_subject.sh
04_delete_subject.sh    (SKIP — you need the subject for linking)
```

**6. Class Management** → `Business_Admin/6_Class_Management/`
```
01_create_class.sh      ← Copy class_id → config.sh CLASS_ID
02_get_classes.sh
03_edit_class.sh
04_delete_class.sh      (SKIP — you need the class for linking)
```

**7. Teacher Management** → `Business_Admin/7_Teacher_Management/`
```
01_create_teacher.sh    ← Copy teacher_id → config.sh TEACHER_ID
02_get_teachers.sh
03_update_teacher.sh
```

**8. Linking** → `Business_Admin/8_Linking/`
```
01_link_subject_to_class.sh     ← Copy relation_id → config.sh CLASS_SUBJECT_RELATION_ID
02_get_class_subjects.sh
03_unlink_subject_from_class.sh (re-run 01 after if testing further)
04_link_student_class.sh        ← Copy enrollment_id → config.sh ENROLLMENT_ID
05_get_class_students.sh
06_unlink_student_class.sh
07_create_and_link_student.sh
08_link_classteacher.sh         ← Copy id → config.sh CLASS_TEACHER_RELATION_ID
09_get_classteachers.sh
10_unlink_classteacher.sh
11_link_subject_teacher.sh      ← Copy link_id → config.sh SUBJECT_TEACHER_LINK_ID
12_get_subject_teachers.sh
13_unlink_subject_teacher.sh
```

---

### Phase 2: School Admin Testing

**9. Login** → `School_Admin/1_Auth_Profile/`
```
01_login.sh             ← Use the school's phone number in Firebase OTP
                           Copy token → config.sh SA_TOKEN
02_get_my_profile.sh
03_update_my_profile.sh
```

**10-13. CRUD & Linking** → `School_Admin/2–5`
Run in folder number order (2 → 3 → 4 → 5), files in numbered order.
Same pattern as BA but scoped to own school.

---

### Phase 3: Student

**14.** → `Student/1_Auth/`
```
01_login.sh    ← Use student's phone in Firebase OTP
```

---

## Config Checklist
After running creates, update these in `config.sh`:
- [ ] `BA_TOKEN` — from BA login
- [ ] `SESSION_ID` — from create session
- [ ] `SCHOOL_ID` — from create school
- [ ] `STUDENT_ID` — from create student
- [ ] `SUBJECT_ID` — from create subject
- [ ] `CLASS_ID` — from create class
- [ ] `TEACHER_ID` — from create teacher
- [ ] `CLASS_SUBJECT_RELATION_ID` — from link subject to class
- [ ] `ENROLLMENT_ID` — from link student to class
- [ ] `CLASS_TEACHER_RELATION_ID` — from link classteacher
- [ ] `SUBJECT_TEACHER_LINK_ID` — from link subject teacher
- [ ] `SA_TOKEN` — from SA login
