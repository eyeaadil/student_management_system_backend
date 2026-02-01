import Supabase_Client from '../../Supabase_Client.js';


export const   Create_Student_And_Link_To_Class_BA = async (req, res) => {
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

    // --- STEP 2: CREATE NEW STUDENT ---
    // We always insert a NEW row because phone numbers are not unique IDs anymore.
    const { data: New_Student, error: Create_Err } = await Supabase_Client
      .from('Student')
      .insert([{
        school_id: School_Id,
        student_name: Student_Name,
        parent_name: Parent_Name,
        phone: Phone,
        email: Email || null
        // Note: Student table only has these columns
        // password, address, gender, dob do not exist in the schema
      }])
      .select()
      .single();

    if (Create_Err) throw Create_Err;

    Final_Student_Id = New_Student.student_id;

    // --- STEP 3: LINK TO CLASS ---
    const { data: Enrollment, error: Link_Error } = await Supabase_Client
      .from('Student_Class_Enrollment_Relation')
      .insert([{
        student_id: Final_Student_Id,
        class_id: Class_Id,
        roll_no: Roll_No || null
      }])
      .select()
      .single();

    if (Link_Error) {
      // HANDLE ROLL NUMBER COLLISION
      if (Link_Error.code === '23505' && Link_Error.details.includes('roll_no')) {
        return res.status(409).json({
          success: false,
          // IMPORTANT: We tell frontend the Student ID so they can retry linking later
          message: `Student Profile Created (ID: ${Final_Student_Id}), BUT Roll No ${Roll_No} is already taken in this class. Please update Roll No.`,
          student_id: Final_Student_Id,
          error_type: "ROLL_NO_COLLISION"
        });
      }
      throw Link_Error;
    }

    // --- SUCCESS ---
    res.status(201).json({
      success: true,
      message: "Student Created and Enrolled Successfully.",
      data: {
        student: New_Student,
        enrollment: Enrollment
      }
    });

  } catch (Error) {
    console.error("Create & Link Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};