import Supabase_Client from '../../Supabase_Client.js';




// --- A. BUSINESS ADMIN (Creates Teacher for ANY School) ---
export const Create_Teacher_BA = async (req, res) => {
  const { School_Id, Name, Phone, Email } = req.body;

  if (!School_Id || !Name || !Phone) {
    return res.status(400).json({ success: false, message: "School_Id, Name, and Phone are required." });
  }

  try {
    // 1. Verify School exists
    const { data: School_Check, error: School_Error } = await Supabase_Client
      .from('School')
      .select('school_id')
      .eq('school_id', School_Id)
      .single();

    if (School_Error || !School_Check) {
      return res.status(400).json({ success: false, message: "Invalid School_Id. School not found." });
    }

    // 2. Create Teacher (without school_id - now managed via enrollments)
    const { data: New_Teacher, error } = await Supabase_Client
      .from('Teacher')
      .insert([{
        name: Name,
        phone: Phone,
        email: Email || null,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique Constraint Violation
        return res.status(409).json({
          success: false,
          message: "This Phone Number or Email already exists in the database. Please contact the Technical Team."
        });
      }
      throw error;
    }

    // 3. Create School Enrollment
    const { data: Enrollment, error: Enrollment_Error } = await Supabase_Client
      .from('Teacher_School_Enrollment')
      .insert([{
        teacher_id: New_Teacher.teacher_id,
        school_id: School_Id,
        is_active: true
      }])
      .select()
      .single();

    if (Enrollment_Error) {
      // Rollback: Delete teacher if enrollment fails
      await Supabase_Client.from('Teacher').delete().eq('teacher_id', New_Teacher.teacher_id);
      throw Enrollment_Error;
    }

    res.status(201).json({
      success: true,
      message: "Teacher created and enrolled successfully.",
      data: {
        ...New_Teacher,
        school_id: School_Id,
        enrollment_id: Enrollment.enrollment_id
      }
    });

  } catch (Error) {
    console.error("Create Teacher BA Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};




// --- 1. GET ALL TEACHERS OF A SCHOOL (BA) ---
export const Get_Teachers_BA = async (req, res) => {
  const { School_Id } = req.query;

  if (!School_Id) return res.status(400).json({ success: false, message: "School_Id is required." });

  try {
    // Query through enrollment table
    const { data: Enrollments, error } = await Supabase_Client
      .from('Teacher_School_Enrollment')
      .select(`
        enrollment_id,
        is_active,
        joined_at,
        Teacher (
          teacher_id,
          name,
          phone,
          email,
          firebase_id,
          is_active,
          created_at
        )
      `)
      .eq('school_id', School_Id)
      .eq('is_active', true)
      .order('joined_at', { ascending: false });

    if (error) throw error;

    // Flatten data
    const Teachers = Enrollments.map(e => ({
      teacher_id: e.Teacher.teacher_id,
      name: e.Teacher.name,
      phone: e.Teacher.phone,
      email: e.Teacher.email,
      firebase_id: e.Teacher.firebase_id,
      teacher_is_active: e.Teacher.is_active,
      enrollment_is_active: e.is_active,
      enrollment_id: e.enrollment_id,
      joined_at: e.joined_at,
      created_at: e.Teacher.created_at
    }));

    res.json({ success: true, school_id: School_Id, count: Teachers.length, data: Teachers });

  } catch (Error) {
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};




// --- 2. UPDATE TEACHER (BA) ---
export const Update_Teacher_BA = async (req, res) => {
  const { Teacher_Id, Name, Phone, Email, Is_Active } = req.body;

  if (!Teacher_Id) return res.status(400).json({ success: false, message: "Teacher_Id is required." });

  try {
    // A. Check Current Data (To detect Phone Change)
    const { data: Current, error: Fetch_Err } = await Supabase_Client
      .from('Teacher')
      .select('phone')
      .eq('teacher_id', Teacher_Id)
      .single();

    if (Fetch_Err || !Current) return res.status(404).json({ success: false, message: "Teacher not found." });

    // B. Prepare Update Object
    const Updates = {};
    if (Name !== undefined) Updates.name = Name;
    if (Email !== undefined) Updates.email = Email;
    if (Is_Active !== undefined) Updates.is_active = Is_Active;

    // C. Handle Phone Change Logic
    if (Phone && Phone !== Current.phone) {
      Updates.phone = Phone;
      Updates.firebase_id = null; // Security: Force Logout
    }

    // D. Perform Update
    const { data: Updated_Teacher, error: Update_Err } = await Supabase_Client
      .from('Teacher')
      .update(Updates)
      .eq('teacher_id', Teacher_Id)
      .select()
      .single();

    if (Update_Err) {
      if (Update_Err.code === '23505') {
        return res.status(409).json({ success: false, message: "Phone or Email already in use. Contact Technical Team." });
      }
      throw Update_Err;
    }

    res.json({ success: true, message: "Teacher updated successfully.", data: Updated_Teacher });

  } catch (Error) {
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};




// --- 3. GET TEACHER DETAILS WITH ENROLLMENT HISTORY (BA) ---
export const Get_Teacher_Details_BA = async (req, res) => {
  const Teacher_Id = req.query.Teacher_Id || req.body.Teacher_Id;

  if (!Teacher_Id) {
    return res.status(400).json({ success: false, message: "Teacher_Id is required." });
  }

  try {
    const { data: Teacher, error } = await Supabase_Client
      .from('Teacher')
      .select(`
        teacher_id,
        name,
        phone,
        email,
        firebase_id,
        is_active,
        created_at,
        Teacher_School_Enrollment (
          enrollment_id,
          school_id,
          is_active,
          joined_at,
          left_at,
          leaving_reason,
          School ( school_id, school_name )
        )
      `)
      .eq('teacher_id', Teacher_Id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, message: "Teacher not found." });
      }
      throw error;
    }

    // Format enrollment history
    const Enrollment_History = Teacher.Teacher_School_Enrollment.map(e => ({
      enrollment_id: e.enrollment_id,
      school_id: e.school_id,
      school_name: e.School?.school_name || "Unknown",
      is_active: e.is_active,
      joined_at: e.joined_at,
      left_at: e.left_at,
      leaving_reason: e.leaving_reason
    }));

    // Current active employment
    const Active_Employment = Enrollment_History.find(e => e.is_active);

    res.json({
      success: true,
      data: {
        teacher_id: Teacher.teacher_id,
        name: Teacher.name,
        phone: Teacher.phone,
        email: Teacher.email,
        is_active: Teacher.is_active,
        has_firebase_linked: !!Teacher.firebase_id,
        created_at: Teacher.created_at,
        current_school: Active_Employment ? {
          school_id: Active_Employment.school_id,
          school_name: Active_Employment.school_name,
          joined_at: Active_Employment.joined_at
        } : null,
        employment_history: Enrollment_History
      }
    });

  } catch (Error) {
    console.error("Get Teacher Details Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};