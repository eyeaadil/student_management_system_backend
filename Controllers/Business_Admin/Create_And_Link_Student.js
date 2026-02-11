import Supabase_Client from '../../Supabase_Client.js';


export const Create_Student_And_Link_To_Class_BA = async (req, res) => {
  const {
    School_Id,
    Class_Id,
    Roll_No,
    // Student Details
    Student_Name,
    Parent_Name,
    Phone,
    Email
  } = req.body;

  // 1. Validate Required Fields
  if (!School_Id || !Class_Id || !Student_Name || !Phone) {
    return res.status(400).json({ success: false, message: "Required: School_Id, Class_Id, Name, Phone." });
  }

  let Final_Student_Id = null;
  let School_Enrollment_Id = null;

  try {
    // --- STEP 1: PRE-CHECK (Only for Unique Email) ---
    // We DO NOT check for Phone uniqueness anymore (siblings share phones).
    if (Email) {
      const { data: Existing_Email } = await Supabase_Client
        .from('Student')
        .select('student_id')
        .eq('email', Email)
        .maybeSingle();

      if (Existing_Email) {
        return res.status(409).json({ success: false, message: "A Student with this Email already exists." });
      }
    }

    // --- STEP 2: VERIFY SCHOOL AND CLASS EXIST ---
    const [School_Check, Class_Check] = await Promise.all([
      Supabase_Client.from('School').select('school_id').eq('school_id', School_Id).single(),
      Supabase_Client.from('Class').select('school_id').eq('class_id', Class_Id).single()
    ]);

    if (School_Check.error || !School_Check.data) {
      return res.status(400).json({ success: false, message: "Invalid School_Id. School not found." });
    }

    if (Class_Check.error || !Class_Check.data) {
      return res.status(400).json({ success: false, message: "Invalid Class_Id. Class not found." });
    }

    // Verify class belongs to the specified school
    if (Class_Check.data.school_id != School_Id) {
      return res.status(400).json({ success: false, message: "Class does not belong to the specified school." });
    }

    // --- STEP 3: SMART ENROLLMENT (Phone + Exact Name Match) ---
    const { data: Existing_Students } = await Supabase_Client
      .from('Student')
      .select('student_id, student_name')
      .eq('phone', Phone); // Fetch all with same phone

    // Filter for exact name match
    const Matched_Student = Existing_Students?.find(s => s.student_name === Student_Name);

    let Is_New_Student = true;
    let Deactivated_Old_School = false;

    if (Matched_Student) {
      // --- EXISTING STUDENT FOUND: REUSE ID ---
      Final_Student_Id = Matched_Student.student_id;
      Is_New_Student = false;

      // Deactivate previous active enrollments (Transfer Logic)
      const { error: Deactivate_Err } = await Supabase_Client
        .from('Student_School_Enrollment')
        .update({ 
          is_active: false, 
          left_school_at: new Date().toISOString(),
          leaving_reason: 'Transferred to School ' + School_Id
        })
        .eq('student_id', Final_Student_Id)
        .eq('is_active', true);

      if (Deactivate_Err) throw Deactivate_Err;
      Deactivated_Old_School = true;

    } else {
      // --- NEW STUDENT OR SIBLING: CREATE NEW ---
      
      // Email Check
      if (Email) {
        const { data: Existing_Email } = await Supabase_Client
          .from('Student')
          .select('student_id')
          .eq('email', Email)
          .maybeSingle();

        if (Existing_Email) {
          return res.status(409).json({ success: false, message: "A Student with this Email already exists." });
        }
      }

      const { data: New_Student, error: Create_Err } = await Supabase_Client
        .from('Student')
        .insert([{
          student_name: Student_Name,
          parent_name: Parent_Name,
          phone: Phone,
          email: Email || null
        }])
        .select()
        .single();

      if (Create_Err) throw Create_Err;
      Final_Student_Id = New_Student.student_id;
    }

    // --- STEP 4: CREATE SCHOOL ENROLLMENT ---
    const { data: School_Enrollment, error: Enroll_Err } = await Supabase_Client
      .from('Student_School_Enrollment')
      .insert([{
        student_id: Final_Student_Id,
        school_id: School_Id,
        is_active: true
      }])
      .select()
      .single();

    if (Enroll_Err) {
      if (Is_New_Student) {
        await Supabase_Client.from('Student').delete().eq('student_id', Final_Student_Id);
      }
      throw Enroll_Err;
    }

    School_Enrollment_Id = School_Enrollment.enrollment_id;

    // --- STEP 5: LINK TO CLASS ---
    const { data: Class_Enrollment, error: Link_Error } = await Supabase_Client
      .from('Student_Class_Enrollment_Relation')
      .insert([{
        student_id: Final_Student_Id,
        class_id: Class_Id,
        roll_no: Roll_No || null
      }])
      .select()
      .single();

    if (Link_Error) {
      if (Link_Error.code === '23505' && Link_Error.details.includes('roll_no')) {
        return res.status(409).json({
          success: false,
          message: `Student Profile Created (ID: ${Final_Student_Id}), BUT Roll No ${Roll_No} is already taken in this class.`,
          student_id: Final_Student_Id,
          school_enrollment_id: School_Enrollment_Id,
          error_type: "ROLL_NO_COLLISION"
        });
      }
      // Rollback
      await Supabase_Client.from('Student_School_Enrollment').delete().eq('enrollment_id', School_Enrollment_Id);
      if (Is_New_Student) {
        await Supabase_Client.from('Student').delete().eq('student_id', Final_Student_Id);
      }
      throw Link_Error;
    }

    // --- SUCCESS ---
    res.status(201).json({
      success: true,
      message: Is_New_Student 
        ? "Student Created, Enrolled, and Linked Successfully."
        : "Existing Student Transferred, Enrolled, and Linked Successfully.",
      data: {
        student_id: Final_Student_Id,
        student_name: Student_Name,
        school_enrollment: School_Enrollment,
        class_enrollment: Class_Enrollment,
        is_transfer: !Is_New_Student
      }
    });

  } catch (Error) {
    console.error("Create & Link Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};