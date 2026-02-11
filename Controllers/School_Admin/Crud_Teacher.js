import Supabase_Client from "../../Supabase_Client.js";




export const Create_Teacher_SA = async (req, res) => {
  const My_School_Id = req.user.user_id; // From Token
  const { Name, Phone, Email } = req.body;

  if (!Name || !Phone) {
    return res.status(400).json({ success: false, message: "Name and Phone are required." });
  }

  try {
    // 1. Create Teacher (without school_id - now managed via enrollments)
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
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: "This Phone Number or Email already exists in the database. Please contact the Technical Team."
        });
      }
      throw error;
    }

    // 2. Create School Enrollment (for MY school)
    const { data: Enrollment, error: Enrollment_Error } = await Supabase_Client
      .from('Teacher_School_Enrollment')
      .insert([{
        teacher_id: New_Teacher.teacher_id,
        school_id: My_School_Id,
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
      message: "Teacher created successfully.",
      data: {
        ...New_Teacher,
        school_id: My_School_Id,
        enrollment_id: Enrollment.enrollment_id
      }
    });

  } catch (Error) {
    console.error("Create Teacher SA Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};




// --- 3. GET MY TEACHERS (SA) ---
export const Get_My_Teachers_SA = async (req, res) => {
  const My_School_Id = req.user.user_id; // From Token

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
      .eq('school_id', My_School_Id)
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
      enrollment_id: e.enrollment_id,
      joined_at: e.joined_at,
      created_at: e.Teacher.created_at
    }));

    res.json({ success: true, count: Teachers.length, data: Teachers });

  } catch (Error) {
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};




// --- 4. UPDATE MY TEACHER (SA) ---
export const Update_My_Teacher_SA = async (req, res) => {
  const My_School_Id = req.user.user_id;
  const { Teacher_Id, Name, Is_Active } = req.body;

  if (!Teacher_Id) return res.status(400).json({ success: false, message: "Teacher_Id is required." });

  try {
    // A. SECURITY CHECK: Verify teacher is enrolled at MY school
    const { data: Enrollment_Check } = await Supabase_Client
      .from('Teacher_School_Enrollment')
      .select('enrollment_id')
      .eq('teacher_id', Teacher_Id)
      .eq('school_id', My_School_Id)
      .eq('is_active', true)
      .maybeSingle();

    if (!Enrollment_Check) {
      return res.status(403).json({ success: false, message: "Access Denied: This teacher is not employed at your school." });
    }

    // B. Prepare Updates (ONLY Name and Status for SA)
    const Updates = {};
    if (Name !== undefined) Updates.name = Name;
    if (Is_Active !== undefined) Updates.is_active = Is_Active;

    // Optimization: If nothing to update, return early
    if (Object.keys(Updates).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields provided (Name or Is_Active)." });
    }

    // C. Update
    const { data: Updated_Teacher, error: Update_Err } = await Supabase_Client
      .from('Teacher')
      .update(Updates)
      .eq('teacher_id', Teacher_Id)
      .select()
      .single();

    if (Update_Err) throw Update_Err;

    res.json({ success: true, message: "Teacher details updated successfully.", data: Updated_Teacher });

  } catch (Error) {
    console.error("Update Teacher SA Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};




// --- 5. GET ALL TEACHERS ENROLLED IN MY SCHOOL (SA) ---
export const Get_School_Teachers_SA = async (req, res) => {
  const My_School_Id = req.user.user_id;

  try {
    const { data: Enrollments, error } = await Supabase_Client
      .from('Teacher_School_Enrollment')
      .select(`
        enrollment_id,
        joined_at,
        Teacher (
          teacher_id,
          name,
          phone,
          email,
          is_active
        )
      `)
      .eq('school_id', My_School_Id)
      .eq('is_active', true)
      .order('joined_at', { ascending: false });

    if (error) throw error;

    const Teachers = Enrollments.map(e => ({
      enrollment_id: e.enrollment_id,
      joined_at: e.joined_at,
      teacher_id: e.Teacher.teacher_id,
      name: e.Teacher.name,
      phone: e.Teacher.phone,
      email: e.Teacher.email,
      is_active: e.Teacher.is_active
    }));

    res.json({
      success: true,
      school_id: My_School_Id,
      count: Teachers.length,
      data: Teachers
    });

  } catch (Error) {
    console.error("Get School Teachers SA Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};