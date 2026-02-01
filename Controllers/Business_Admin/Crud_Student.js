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
    // 3. PRE-CHECK: Check ONLY if Email already exists
    // (We removed the Phone check so siblings can share the same number)
    if (Email) {
      const { data: Existing_Email, error: Check_Error } = await Supabase_Client
        .from('Student')
        .select('student_id')
        .eq('email', Email)
        .maybeSingle(); // Returns null if not found, object if found

      if (Check_Error) throw Check_Error;

      if (Existing_Email) {
        return res.status(409).json({ success: false, message: "A Student with this Email already exists." });
      }
    }

    // 4. Insert into Student Table
    // Note: Phone number duplicates are now allowed by DB and Controller
    const { data: New_Student, error: Db_Error } = await Supabase_Client
      .from('Student')
      .insert([
        {
          school_id: School_Id,
          student_name: Student_Name,
          parent_name: Parent_Name,
          phone: Phone,     // Can be same as another student
          email: Email || null
        }
      ])
      .select()
      .single();

    if (Db_Error) {
      // Foreign Key Error (School doesn't exist)
      if (Db_Error.code === '23503') {
        return res.status(400).json({ success: false, message: "Invalid School_Id. School not found." });
      }
      // Unique Constraint Error (Just in case specific DB email constraint hits)
      if (Db_Error.code === '23505') {
        return res.status(409).json({ success: false, message: "This Email is already in use." });
      }
      throw Db_Error;
    }

    // 5. Success Response
    res.status(201).json({
      success: true,
      message: "New Student created successfully.",
      data: New_Student
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
  // or req.body if you prefer POST
  const School_Id = req.query.School_Id || req.body.School_Id;

  if (!School_Id) {
    return res.status(400).json({
      success: false,
      message: "School_Id is required."
    });
  }

  try {
    // 2. Fetch Students from DB
    const { data: Student_List, error: Db_Error } = await Supabase_Client
      .from('Student')
      .select('student_id, student_name, parent_name, phone, email, is_active, created_at')
      .eq('school_id', School_Id)
      .order('student_name', { ascending: true }); // Sort Alphabetically

    if (Db_Error) throw Db_Error;

    // 3. Success Response
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
    // Removed .single() to allow Array response
    const { data: Students_List, error: Db_Error } = await Supabase_Client
      .from('Student')
      .select(`
        student_id, 
        student_name, 
        parent_name, 
        email, 
        phone, 
        school_id, 
        is_active,
        School ( school_name ) 
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

    // 4. Format Data (Flatten the School Name for each student)
    const Formatted_Data = Students_List.map(student => ({
      student_id: student.student_id,
      student_name: student.student_name,
      parent_name: student.parent_name,
      email: student.email,
      phone: student.phone,
      is_active: student.is_active,
      school_id: student.school_id,
      // Handle nested School object safely
      school_name: student.School ? student.School.school_name : "Unknown"
    }));

    // 5. Success Response
    res.json({
      success: true,
      count: Formatted_Data.length, // Helpful for frontend to know if 1 or multiple
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
  // 1. Get Input
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
      // Fallback check just in case DB constraint still exists (it shouldn't if you ran the ALTER cmd)
      if (Update_Error.code === '23505') {
        return res.status(409).json({ success: false, message: "Duplicate Data Error (Email or Phone)." });
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