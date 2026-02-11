import Supabase_Client from '../../Supabase_Client.js';




export const Create_Student = async (req, res) => {
  // 1. Get Input
  const { School_Id, Student_Name, Parent_Name, Phone, Email } = req.body;

  // 2. Validate Required Fields
  if (!School_Id || !Student_Name || !Parent_Name || !Phone) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: School_Id, Student_Name, Parent_Name, and Phone."
    });
  }

  try {
    let Final_Student_Id = null;
    let Deactivated_Old_School = false;
    let Is_New_Student = true;

    // 3. SMART ENROLLMENT: Check if Student already exists (Phone + Exact Name Match)
    const { data: Existing_Students } = await Supabase_Client
      .from('Student')
      .select('student_id, student_name')
      .eq('phone', Phone); // Fetch all with same phone

    // Filter for exact name match (Case Insensitive or Exact?) -> Let's do Exact for safety
    const Matched_Student = Existing_Students?.find(s => s.student_name === Student_Name);

    if (Matched_Student) {
      // --- EXISTING STUDENT FOUND: REUSE ID ---
      Final_Student_Id = Matched_Student.student_id;
      Is_New_Student = false;

      // Deactivate ANY previous active enrollments (Transfer Logic)
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
      
      // Email Uniqueness Check (Only if creating new)
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

      // 4. Verify School exists
      const { data: School_Check, error: School_Error } = await Supabase_Client
        .from('School')
        .select('school_id')
        .eq('school_id', School_Id)
        .single();

      if (School_Error || !School_Check) {
        return res.status(400).json({ success: false, message: "Invalid School_Id. School not found." });
      }

      // 5. Insert New Student
      const { data: New_Student, error: Db_Error } = await Supabase_Client
        .from('Student')
        .insert([{
          student_name: Student_Name,
          parent_name: Parent_Name,
          phone: Phone,
          email: Email || null
        }])
        .select()
        .single();

      if (Db_Error) {
        if (Db_Error.code === '23505') return res.status(409).json({ success: false, message: "Email already in use." });
        throw Db_Error;
      }

      Final_Student_Id = New_Student.student_id;
    }

    // 6. Create NEW School Enrollment (Active)
    const { data: Enrollment, error: Enrollment_Error } = await Supabase_Client
      .from('Student_School_Enrollment')
      .insert([{
        student_id: Final_Student_Id,
        school_id: School_Id,
        is_active: true
      }])
      .select()
      .single();

    if (Enrollment_Error) {
      if (Is_New_Student) {
        // Rollback new student if enrollment fails
        await Supabase_Client.from('Student').delete().eq('student_id', Final_Student_Id);
      }
      throw Enrollment_Error;
    }

    // 7. Success Response
    res.status(201).json({
      success: true,
      message: Is_New_Student 
        ? "New Student created and enrolled successfully." 
        : "Existing Student transferred and enrolled successfully.",
      data: {
        student_id: Final_Student_Id,
        student_name: Student_Name,
        school_id: School_Id,
        enrollment_id: Enrollment.enrollment_id,
        is_transfer: !Is_New_Student,
        previous_school_deactivated: Deactivated_Old_School
      }
    });

  } catch (Error) {
    console.error("Create Student Error:", Error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: Error.message
    });
  }
};








export const Get_Students_By_School = async (req, res) => {
  // 1. Get School ID from Query Parameters (Best for GET requests)
  const School_Id = req.query.School_Id || req.body.School_Id;

  if (!School_Id) {
    return res.status(400).json({
      success: false,
      message: "School_Id is required."
    });
  }

  try {
    // 2. Fetch Students through Enrollment table 
    // Join: Student_School_Enrollment -> Student
    const { data: Enrollments, error: Db_Error } = await Supabase_Client
      .from('Student_School_Enrollment')
      .select(`
        enrollment_id,
        is_active,
        enrolled_at,
        Student (
          student_id, 
          student_name, 
          parent_name, 
          phone, 
          email, 
          is_active,
          created_at
        )
      `)
      .eq('school_id', School_Id)
      .eq('is_active', true)  // Only currently enrolled students
      .order('enrolled_at', { ascending: false });

    if (Db_Error) throw Db_Error;

    // 3. Flatten the data for easier frontend consumption
    const Student_List = Enrollments.map(e => ({
      student_id: e.Student.student_id,
      student_name: e.Student.student_name,
      parent_name: e.Student.parent_name,
      phone: e.Student.phone,
      email: e.Student.email,
      student_is_active: e.Student.is_active,  // Global student status
      enrollment_is_active: e.is_active,        // Enrollment at this school
      enrollment_id: e.enrollment_id,
      enrolled_at: e.enrolled_at,
      created_at: e.Student.created_at
    }));

    // 4. Success Response
    res.json({
      success: true,
      school_id: School_Id,
      count: Student_List.length,
      data: Student_List
    });

  } catch (Error) {
    console.error("Fetch Students Error:", Error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: Error.message
    });
  }
};












export const Get_Students_By_Phone = async (req, res) => {
  // 1. Get Phone from Body
  const { Phone } = req.body;

  if (!Phone) {
    return res.status(400).json({
      success: false,
      message: "Phone number is required."
    });
  }

  try {
    // 2. Fetch ALL Students linked to this Phone
    // Then join their active enrollments
    const { data: Students_List, error: Db_Error } = await Supabase_Client
      .from('Student')
      .select(`
        student_id, 
        student_name, 
        parent_name, 
        email, 
        phone, 
        is_active,
        Student_School_Enrollment (
          enrollment_id,
          school_id,
          is_active,
          enrolled_at,
          School ( school_id, school_name )
        )
      `)
      .eq('phone', Phone);

    if (Db_Error) throw Db_Error;

    // 3. Handle Empty Result
    if (!Students_List || Students_List.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No students found with this phone number."
      });
    }

    // 4. Format Data - Flatten enrollments for each student
    const Formatted_Data = Students_List.map(student => {
      // Get active enrollment(s) - usually just one
      const Active_Enrollments = student.Student_School_Enrollment
        .filter(e => e.is_active)
        .map(e => ({
          enrollment_id: e.enrollment_id,
          school_id: e.school_id,
          school_name: e.School?.school_name || "Unknown",
          enrolled_at: e.enrolled_at
        }));

      return {
        student_id: student.student_id,
        student_name: student.student_name,
        parent_name: student.parent_name,
        email: student.email,
        phone: student.phone,
        is_active: student.is_active,
        // For backwards compatibility, include primary school info
        school_id: Active_Enrollments[0]?.school_id || null,
        school_name: Active_Enrollments[0]?.school_name || "Not Enrolled",
        // Full enrollment details
        active_enrollments: Active_Enrollments,
        enrollment_count: Active_Enrollments.length
      };
    });

    // 5. Success Response
    res.json({
      success: true,
      count: Formatted_Data.length,
      data: Formatted_Data
    });

  } catch (Error) {
    console.error("Search Student Error:", Error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: Error.message
    });
  }
};











export const Edit_Student = async (req, res) => {
  // 1. Get Input (Removed School_Id - school changes go through transfer flow)
  const { Student_Id, Student_Name, Parent_Name, Phone, Email } = req.body;

  // Student_Id is mandatory to know WHO to edit
  if (!Student_Id) {
    return res.status(400).json({ success: false, message: "Student_Id is required." });
  }

  try {
    // --- STEP 2: PRE-CHECK FOR DUPLICATES (ONLY EMAIL) ---
    // We removed the Phone check here. Multiple students can share a phone.
    // We only check if the new EMAIL is already taken by ANOTHER student.
    if (Email) {
      const { data: Email_Conflict, error: Check_Error } = await Supabase_Client
        .from('Student')
        .select('student_id')
        .eq('email', Email)
        .neq('student_id', Student_Id) // Critical: Exclude current student
        .maybeSingle();

      if (Check_Error) throw Check_Error;

      if (Email_Conflict) {
        return res.status(409).json({ success: false, message: "This Email is already used by another student." });
      }
    }

    // --- STEP 3: FETCH CURRENT DATA (To detect Phone change) ---
    const { data: Current_Student, error: Fetch_Error } = await Supabase_Client
      .from('Student')
      .select('phone')
      .eq('student_id', Student_Id)
      .single();

    if (Fetch_Error || !Current_Student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    // Detect if Phone is changing
    // We convert both to String to ensure safe comparison
    const Is_Phone_Changing = Phone && (String(Phone) !== String(Current_Student.phone));

    // --- STEP 4: PREPARE UPDATE OBJECT ---
    const Updates = {};
    if (Student_Name) Updates.student_name = Student_Name;
    if (Parent_Name) Updates.parent_name = Parent_Name;
    if (Email !== undefined) Updates.email = Email; // Allows clearing email if sent as null
    if (Phone) Updates.phone = Phone; // Can be duplicate now

    // Safety: If phone changes, reset firebase_id to NULL
    // This forces the user to re-verify/link their account next time they login
    if (Is_Phone_Changing) {
      Updates.firebase_id = null;
    }

    // --- STEP 5: EXECUTE UPDATE ---
    const { data: Updated_Student, error: Update_Error } = await Supabase_Client
      .from('Student')
      .update(Updates)
      .eq('student_id', Student_Id)
      .select()
      .single();

    if (Update_Error) {
      // Fallback check just in case DB constraint still exists
      if (Update_Error.code === '23505') {
        return res.status(409).json({ success: false, message: "Duplicate Data Error (Email)." });
      }
      throw Update_Error;
    }

    // --- STEP 6: RESPONSE ---
    res.json({
      success: true,
      message: Is_Phone_Changing
        ? "Student updated. Phone changed (Firebase ID reset)."
        : "Student details updated successfully.",
      phone_changed: Is_Phone_Changing,
      data: Updated_Student
    });

  } catch (Error) {
    console.error("Edit Student Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};




// NEW FUNCTION: Get a single student with full enrollment history
export const Get_Student_Details = async (req, res) => {
  const Student_Id = req.query.Student_Id || req.body.Student_Id;

  if (!Student_Id) {
    return res.status(400).json({
      success: false,
      message: "Student_Id is required."
    });
  }

  try {
    const { data: Student, error: Db_Error } = await Supabase_Client
      .from('Student')
      .select(`
        student_id, 
        student_name, 
        parent_name, 
        email, 
        phone, 
        is_active,
        firebase_id,
        created_at,
        Student_School_Enrollment (
          enrollment_id,
          school_id,
          is_active,
          enrolled_at,
          left_school_at,
          leaving_reason,
          School ( school_id, school_name )
        )
      `)
      .eq('student_id', Student_Id)
      .single();

    if (Db_Error) {
      if (Db_Error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: "Student not found." });
      }
      throw Db_Error;
    }

    // Format enrollment history
    const Enrollment_History = Student.Student_School_Enrollment.map(e => ({
      enrollment_id: e.enrollment_id,
      school_id: e.school_id,
      school_name: e.School?.school_name || "Unknown",
      is_active: e.is_active,
      enrolled_at: e.enrolled_at,
      left_school_at: e.left_school_at,
      leaving_reason: e.leaving_reason
    }));

    // Find current active enrollment
    const Active_Enrollment = Enrollment_History.find(e => e.is_active);

    res.json({
      success: true,
      data: {
        student_id: Student.student_id,
        student_name: Student.student_name,
        parent_name: Student.parent_name,
        email: Student.email,
        phone: Student.phone,
        is_active: Student.is_active,
        has_firebase_linked: !!Student.firebase_id,
        created_at: Student.created_at,
        // Current school info (if enrolled)
        current_school: Active_Enrollment ? {
          school_id: Active_Enrollment.school_id,
          school_name: Active_Enrollment.school_name,
          enrolled_at: Active_Enrollment.enrolled_at
        } : null,
        // Full history
        enrollment_history: Enrollment_History
      }
    });

  } catch (Error) {
    console.error("Get Student Details Error:", Error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: Error.message
    });
  }
};