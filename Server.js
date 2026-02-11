import express from 'express';
import dotenv from 'dotenv';
dotenv.config();




import { Business_Admin_Login } from './Controllers/Business_Admin/Login_Buisiness_Admin.js';
import { Create_Academic_Session, Create_Business_Admin, Get_All_Business_Admins, Update_Business_Admin_Profile } from './Controllers/Business_Admin/Crud_Business_Admin.js';
import { Require_Business_Admin } from './Middlewares/Require_Business_Admin.js';
import { Require_Auth } from './Middlewares/Require_Auth.js.js';
import { Create_School, Edit_School, Get_All_Schools } from './Controllers/Business_Admin/Crud_New_School.js';
import { School_Admin_Login } from './Controllers/School_Admin/Login_School_Admin.js';
import { Toggle_School_Status } from './Controllers/Business_Admin/Toggle_School_Status.js';
import { Get_My_School_Profile, Update_My_School_Profile } from './Controllers/School_Admin/Crud_My_School.js';
import { Require_School_Admin } from './Middlewares/Require_School_Admin.js';
import { Activate_Session, Deactivate_Session, Delete_Session, Get_All_Sessions, Get_Active_Session } from './Controllers/Academic_Session/Crud_Academic_Session.js';
import { Create_Student, Edit_Student, Get_Students_By_Phone, Get_Students_By_School, Get_Student_Details } from './Controllers/Business_Admin/Crud_Student.js';
import { Create_Subject_BA, Delete_Subject_BA, Edit_Subject_BA, Get_Subjects_BA } from './Controllers/Business_Admin/Crud_School_Subject.js';
import { School_Create_Subject_SA, School_Delete_Subject_SA, School_Edit_Subject_SA, School_Get_Subjects_SA } from './Controllers/School_Admin/Crud_My_Subjects.js';
import { Create_Class_BA, Delete_Class_BA, Edit_Class_BA, Get_Classes_BA } from './Controllers/Business_Admin/Crud_Class.js';
import { Create_Class_SA, Delete_Class_SA, Edit_Class_SA, Get_Classes_SA } from './Controllers/School_Admin/Crud_My_Class.js';
import { Get_Class_Subjects_BA, Link_Subject_To_Class_BA, Unlink_Subject_From_Class_BA } from './Controllers/Business_Admin/Class_Subject_Link.js';
import { Get_Class_Subjects_SA, Link_Subject_To_Class_SA, Unlink_Subject_From_Class_SA } from './Controllers/School_Admin/Class_Subject_Link.js';
import { Get_Class_Students_BA, Link_Student_To_Class_BA, Unlink_Student_BA } from './Controllers/Business_Admin/Student_Class_Link.js';
import { Get_Class_Students_SA, Get_School_Students_SA, Link_Student_To_Class_SA, Unlink_Student_SA } from './Controllers/School_Admin/Student_Class_Link.js';
import { Transfer_Student_BA, Get_Student_Enrollment_History_BA, Get_School_Students_BA, Enroll_Student_In_School_BA, Withdraw_Student_From_School_BA } from './Controllers/Business_Admin/Student_Transfer.js';
import { Create_Student_And_Link_To_Class_BA } from './Controllers/Business_Admin/Create_And_Link_Student.js';
import { Create_Teacher_BA, Get_Teachers_BA, Update_Teacher_BA, Get_Teacher_Details_BA } from './Controllers/Business_Admin/Crud_Teacher.js';
import { Create_Teacher_SA, Get_My_Teachers_SA, Update_My_Teacher_SA, Get_School_Teachers_SA } from './Controllers/School_Admin/Crud_Teacher.js';
import { Transfer_Teacher_BA, Get_Teacher_Enrollment_History_BA, Get_School_Teachers_BA, Enroll_Teacher_In_School_BA, Withdraw_Teacher_From_School_BA } from './Controllers/Business_Admin/Teacher_Transfer.js';
import { Get_ClassTeacher_To_Class_BA, Link_ClassTeacher_To_Class_BA, Unlink_ClassTeacher_To_Class_BA } from './Controllers/Business_Admin/Class_ClassTeacher_Link.js';
import { Get_ClassTeacher_To_Class_SA, Link_ClassTeacher_To_Class_SA, Unlink_ClassTeacher_To_Class_SA } from './Controllers/School_Admin/Class_ClassTeacher_Link.js';
import { Get_ClassSubject_SubjectTeachers_BA, Link_ClassSubject_SubjectTeacher_BA, Unlink_ClassSubject_SubjectTeacher_BA } from './Controllers/Business_Admin/ClassSubject_SubjectTeacher_Link.js';
import { Get_ClassSubject_SubjectTeachers_SA, Link_ClassSubject_SubjectTeacher_SA, Unlink_ClassSubject_SubjectTeacher_SA } from './Controllers/School_Admin/ClassSubject_SubjectTeacher_Link.js';







const App = express();
App.use(express.json());






// --- ROUTES ---
App.post('/BA/Login_Business_Admin', Business_Admin_Login);

App.post('/BA/Create_Business_Admin', Require_Auth, Require_Business_Admin, Create_Business_Admin);

App.post('/BA/Create_School', Require_Auth, Require_Business_Admin, Create_School);

App.post('/BA/Toggle_School_Status', Require_Auth, Require_Business_Admin, Toggle_School_Status);


App.get(
  '/BA/Get_All_Business_Admins',
  Require_Auth,
  Require_Business_Admin,
  Get_All_Business_Admins
);



// 2. Edit Own Profile (Update Access)
// Uses POST or PUT
App.post(
  '/BA/Update_Business_Admin_Profile',
  Require_Auth,
  Require_Business_Admin,
  Update_Business_Admin_Profile
);



// 1. Read All Schools
App.get(
  '/BA/Get_All_Schools',
  Require_Auth,
  Require_Business_Admin,
  Get_All_Schools
);

// 2. Edit School
App.post(
  '/BA/Edit_School',
  Require_Auth,
  Require_Business_Admin,
  Edit_School
);






// --- STUDENT MANAGEMENT (Business Admin) ---
App.post(
  '/BA/Create_Student',
  Require_Auth,
  Require_Business_Admin, // Only Business Admin access
  Create_Student
);



// /get-students-by-school?School_Id=1
App.get(
  '/BA/Get_Students_By_School',
  Require_Auth,
  Require_Business_Admin,
  Get_Students_By_School
);


App.post(
  '/BA/Get_Student_By_Phone',
  Require_Auth,
  Require_Business_Admin,
  Get_Students_By_Phone
);


App.post(
  '/BA/Edit_Student',
  Require_Auth,
  Require_Business_Admin,
  Edit_Student
);


// Get single student with enrollment history
App.get(
  '/BA/Get_Student_Details',
  Require_Auth,
  Require_Business_Admin,
  Get_Student_Details
);


// --- STUDENT TRANSFER & ENROLLMENT MANAGEMENT (Business Admin) ---

// Transfer student from one school to another
App.post(
  '/BA/Transfer_Student',
  Require_Auth,
  Require_Business_Admin,
  Transfer_Student_BA
);

// Get student's enrollment history across all schools
App.get(
  '/BA/Get_Student_Enrollment_History',
  Require_Auth,
  Require_Business_Admin,
  Get_Student_Enrollment_History_BA
);

// Get all students enrolled at a specific school
App.get(
  '/BA/Get_School_Students',
  Require_Auth,
  Require_Business_Admin,
  Get_School_Students_BA
);

// Enroll existing student in a school (auto-deactivates previous school)
App.post(
  '/BA/Enroll_Student_In_School',
  Require_Auth,
  Require_Business_Admin,
  Enroll_Student_In_School_BA
);

// Withdraw student from a school
App.post(
  '/BA/Withdraw_Student_From_School',
  Require_Auth,
  Require_Business_Admin,
  Withdraw_Student_From_School_BA
);












// --- SUBJECT MANAGEMENT by BA---

// 1. Create
App.post('/BA/Create_Subject', Require_Auth, Require_Business_Admin, Create_Subject_BA);

// 2. Read (Query Params: ?School_Id=1&Session_Id=2)
App.get('/BA/Get_Subjects', Require_Auth, Require_Business_Admin, Get_Subjects_BA);

// 3. Edit
App.post('/BA/Edit_Subject', Require_Auth, Require_Business_Admin, Edit_Subject_BA);

// 4. Delete
App.post('/BA/Delete_Subject', Require_Auth, Require_Business_Admin, Delete_Subject_BA);

















/////////////////////////////////         school routes /////////////////////////////////////////////////////

App.post('/SA/Login_School_Admin', School_Admin_Login);


App.get(
  '/SA/Get_My_School_Profile',
  Require_Auth,
  Require_School_Admin, // Only School Admins
  Get_My_School_Profile
);



// 2. "Update My Profile"
App.post(
  '/SA/Update_My_School_Profile',
  Require_Auth,
  Require_School_Admin,
  Update_My_School_Profile
);




// --- SCHOOL ADMIN: SUBJECT MANAGEMENT ---

App.post('/SA/School_Create_Subject', Require_Auth, Require_School_Admin, School_Create_Subject_SA);
App.get('/SA/School_Get_Subjects', Require_Auth, Require_School_Admin, School_Get_Subjects_SA);
App.post('/SA/School_Edit_Subject', Require_Auth, Require_School_Admin, School_Edit_Subject_SA);
App.post('/SA/School_Delete_Subject', Require_Auth, Require_School_Admin, School_Delete_Subject_SA);






// --- CLASS MANAGEMENT (Business Admin) ---

// 1. Create Class
// POST http://localhost:4000/BA/Create_Class_BA
App.post(
  '/BA/Create_Class',
  Require_Auth,
  Require_Business_Admin,
  Create_Class_BA
);

// 2. Read Classes
// GET http://localhost:4000/BA/Get_Classes_BA?School_Id=1
App.get(
  '/BA/Get_Classes',
  Require_Auth,
  Require_Business_Admin,
  Get_Classes_BA
);

// 3. Edit Class
// POST http://localhost:4000/BA/Edit_Class_BA
App.post(
  '/BA/Edit_Class',
  Require_Auth,
  Require_Business_Admin,
  Edit_Class_BA
);

// 4. Delete Class
// POST http://localhost:4000/BA/Delete_Class_BA
App.post(
  '/BA/Delete_Class',
  Require_Auth,
  Require_Business_Admin,
  Delete_Class_BA
);















// --- ACADEMIC SESSION MANAGEMENT ---

// 1. Create (Default Inactive)
App.post('/BA/Create_Academic_Session', Require_Auth, Require_Business_Admin, Create_Academic_Session);

// 2. Read All
App.get('/ALL/Get_All_Sessions', Require_Auth, Get_All_Sessions); // Open to all auth users?

// 3. Activate (Strict Check)
App.post('/BA/Activate_Session', Require_Auth, Require_Business_Admin, Activate_Session);

// 4. Deactivate
App.post('/BA/Deactivate_Session', Require_Auth, Require_Business_Admin, Deactivate_Session);

// 5. Delete
App.post('/BA/Delete_Session', Require_Auth, Require_Business_Admin, Delete_Session);

// 6. Get Active Session
App.get('/ALL/Get_Active_Session', Require_Auth, Get_Active_Session);














// --- CLASS MANAGEMENT (School Admin) ---

// 1. Create
// POST http://localhost:4000/SA/Create_Class_SA
App.post('/SA/Create_Class', Require_Auth, Require_School_Admin, Create_Class_SA);

// 2. Read
// GET http://localhost:4000/SA/Get_Classes_SA (or ?Session_Id=2)
App.get('/SA/Get_Classes', Require_Auth, Require_School_Admin, Get_Classes_SA);

// 3. Edit
// POST http://localhost:4000/SA/Edit_Class_SA
App.post('/SA/Edit_Class', Require_Auth, Require_School_Admin, Edit_Class_SA);

// 4. Delete
// POST http://localhost:4000/SA/Delete_Class_SA
App.post('/SA/Delete_Class', Require_Auth, Require_School_Admin, Delete_Class_SA);











// --- BUSINESS ADMIN MAPPING ---
App.post('/BA/Link_Subject', Require_Auth, Require_Business_Admin, Link_Subject_To_Class_BA);
App.post('/BA/Unlink_Subject', Require_Auth, Require_Business_Admin, Unlink_Subject_From_Class_BA);
App.get('/BA/Get_Class_Subjects', Require_Auth, Require_Business_Admin, Get_Class_Subjects_BA);




// --- SCHOOL ADMIN MAPPING ---
App.post('/SA/Link_Subject', Require_Auth, Require_School_Admin, Link_Subject_To_Class_SA);
App.post('/SA/Unlink_Subject', Require_Auth, Require_School_Admin, Unlink_Subject_From_Class_SA);
App.get('/SA/Get_Class_Subjects', Require_Auth, Require_School_Admin, Get_Class_Subjects_SA);







// 1. Enroll a Student into a Class
// Body: { "Student_Id": 101, "Class_Id": 5, "Roll_No": 12 }
App.post(
  '/BA/Link_Student_Class',
  Require_Auth,
  Require_Business_Admin,
  Link_Student_To_Class_BA
);

// 2. Remove a Student from a Class
// Body: { "Student_Id": 101 }
App.post(
  '/BA/Unlink_Student_Class',
  Require_Auth,
  Require_Business_Admin,
  Unlink_Student_BA
);




// URL: http://localhost:4000/BA/Get_Class_Students?Class_Id=10
App.get(
  '/BA/Get_Class_Students',
  Require_Auth,
  Require_Business_Admin,
  Get_Class_Students_BA
);













//////////// link unlinkread student of a class 
// 1. Enroll a Student into a Class
// Body: { "Student_Id": 101, "Class_Id": 5, "Roll_No": 12 }
App.post(
  '/SA/Link_Student_Class',
  Require_Auth,
  Require_School_Admin,
  Link_Student_To_Class_SA
);

// 2. Remove a Student from a Class
// Body: { "Student_Id": 101 }
App.post(
  '/SA/Unlink_Student_Class',
  Require_Auth,
  Require_School_Admin,
  Unlink_Student_SA
);




// URL: http://localhost:4000/SA/Get_Class_Students?Class_Id=10
App.get(
  '/SA/Get_Class_Students',
  Require_Auth,
  Require_School_Admin,
  Get_Class_Students_SA
);

// Get all students enrolled at my school
App.get(
  '/SA/Get_School_Students',
  Require_Auth,
  Require_School_Admin,
  Get_School_Students_SA
);




// Body: { "Class_Id": 5, "Phone": "999", "Student_Name": "Rahul", ... } (No School_Id needed in body)
App.post(
  '/BA/Create_Student_And_Link_To_Class',
  Require_Auth,
  Require_Business_Admin,
  Create_Student_And_Link_To_Class_BA
);







// --- TEACHER MANAGEMENT (Business Admin) ---
// Body: { "School_Id": 1, "Name": "Amit Sir", "Phone": "9876543210", "Email": "amit@school.com" }
App.post(
  '/BA/Create_Teacher',
  Require_Auth,
  Require_Business_Admin,
  Create_Teacher_BA
);

App.get(
  '/BA/Get_Teachers',
  Require_Auth,
  Require_Business_Admin,
  Get_Teachers_BA
);

// 2. Update: Edit any detail (Name, Phone, Email, Status)
App.post(
  '/BA/Update_Teacher',
  Require_Auth,
  Require_Business_Admin,
  Update_Teacher_BA
);

// Get single teacher with employment history
App.get(
  '/BA/Get_Teacher_Details',
  Require_Auth,
  Require_Business_Admin,
  Get_Teacher_Details_BA
);


// --- TEACHER TRANSFER & ENROLLMENT MANAGEMENT (Business Admin) ---

// Transfer teacher from one school to another
App.post(
  '/BA/Transfer_Teacher',
  Require_Auth,
  Require_Business_Admin,
  Transfer_Teacher_BA
);

// Get teacher's employment history across all schools
App.get(
  '/BA/Get_Teacher_Enrollment_History',
  Require_Auth,
  Require_Business_Admin,
  Get_Teacher_Enrollment_History_BA
);

// Get all teachers employed at a specific school
App.get(
  '/BA/Get_School_Teachers',
  Require_Auth,
  Require_Business_Admin,
  Get_School_Teachers_BA
);

// Enroll existing teacher in a school (auto-deactivates previous school)
App.post(
  '/BA/Enroll_Teacher_In_School',
  Require_Auth,
  Require_Business_Admin,
  Enroll_Teacher_In_School_BA
);

// Withdraw teacher from a school
App.post(
  '/BA/Withdraw_Teacher_From_School',
  Require_Auth,
  Require_Business_Admin,
  Withdraw_Teacher_From_School_BA
);










// --- TEACHER MANAGEMENT (School Admin) ---
// Body: { "Name": "Priya Mam", "Phone": "9988776655", "Email": "priya@school.com" }
App.post(
  '/SA/Create_Teacher',
  Require_Auth,
  Require_School_Admin,
  Create_Teacher_SA
);


App.get(
  '/SA/Get_My_Teachers',
  Require_Auth,
  Require_School_Admin,
  Get_My_Teachers_SA
);

// 4. Update: Edit allowed details (Name, Status) - Phone/Email ignored
App.post(
  '/SA/Update_My_Teacher',
  Require_Auth,
  Require_School_Admin,
  Update_My_Teacher_SA
);

// Get all teachers enrolled at my school
App.get(
  '/SA/Get_School_Teachers',
  Require_Auth,
  Require_School_Admin,
  Get_School_Teachers_SA
);





// --- CLASS - CLASS_TEACHER ASSIGNMENT (Business Admin) ---

// 1. Assign Teacher to Class
// Body: { "Class_Id": 5, "Teacher_Id": 20 }
App.post(
  '/BA/Link_ClassTeacher_To_Class',
  Require_Auth,
  Require_Business_Admin,
  Link_ClassTeacher_To_Class_BA
);

// 2. Remove Teacher from Class
// Body: { "Relation_Id": 55 } (This ID comes from the GET route below)
App.post(
  '/BA/Unlink_ClassTeacher_To_Class',
  Require_Auth,
  Require_Business_Admin,
  Unlink_ClassTeacher_To_Class_BA
);

// 3. View Teachers of a Class
// URL: http://localhost:4000/BA/Get_ClassTeachers?Class_Id=5
App.get(
  '/BA/Get_ClassTeacher_To_Class',
  Require_Auth,
  Require_Business_Admin,
  Get_ClassTeacher_To_Class_BA
);








// --- CLASS - CLASS_TEACHER ASSIGNMENT (School Admin) ---

// 1. Assign Teacher
// Body: { "Class_Id": 10, "Teacher_Id": 25 }
App.post(
  '/SA/Link_ClassTeacher_To_Class',
  Require_Auth,
  Require_School_Admin,
  Link_ClassTeacher_To_Class_SA
);

// 2. Unlink Teacher
// Body: { "Relation_Id": 55 }
App.post(
  '/SA/Unlink_ClassTeacher_To_Class',
  Require_Auth,
  Require_School_Admin,
  Unlink_ClassTeacher_To_Class_SA
);

// 3. View Class Teachers
// URL: .../SA/Get_ClassTeachers?Class_Id=10
App.get(
  '/SA/Get_ClassTeacher_To_Class',
  Require_Auth,
  Require_School_Admin,
  Get_ClassTeacher_To_Class_SA
);








// --- SUBJECT TEACHER ASSIGNMENT (Business Admin) ---

// 1. Assign Teacher to a Subject in a Class
// Body: { "Class_Subject_Relation_Id": 100, "Teacher_Id": 25 }
App.post(
  '/BA/Link_ClassSubject_SubjectTeacher',
  Require_Auth,
  Require_Business_Admin,
  Link_ClassSubject_SubjectTeacher_BA
);

// 2. Remove Teacher from Subject
// Body: { "Link_Id": 55 }
App.post(
  '/BA/Unlink_ClassSubject_SubjectTeacher',
  Require_Auth,
  Require_Business_Admin,
  Unlink_ClassSubject_SubjectTeacher_BA
);

// 3. View Teachers for a Subject
// URL: .../BA/Get_SubjectTeachers?Class_Subject_Relation_Id=100
App.get(
  '/BA/Get_ClassSubject_SubjectTeachers',
  Require_Auth,
  Require_Business_Admin,
  Get_ClassSubject_SubjectTeachers_BA
);






// --- SUBJECT TEACHER ASSIGNMENT (School Admin) ---

// 1. Assign Teacher to Subject
// Body: { "Class_Subject_Relation_Id": 100, "Teacher_Id": 25 }
App.post(
  '/SA/Link_ClassSubject_SubjectTeacher',
  Require_Auth,
  Require_School_Admin,
  Link_ClassSubject_SubjectTeacher_SA
);

// 2. Remove Teacher from Subject
// Body: { "Link_Id": 55 }
App.post(
  '/SA/Unlink_ClassSubject_SubjectTeacher',
  Require_Auth,
  Require_School_Admin,
  Unlink_ClassSubject_SubjectTeacher_SA
);

// 3. View Teachers for a Subject
// URL: .../SA/Get_ClassSubject_SubjectTeachers?Class_Subject_Relation_Id=100
App.get(
  '/SA/Get_ClassSubject_SubjectTeachers',
  Require_Auth,
  Require_School_Admin,
  Get_ClassSubject_SubjectTeachers_SA
);







const PORT = process.env.PORT || 4000;
App.listen(PORT, () => console.log(`Server running on port ${PORT}`));







