

import Supabase_Client from '../../Supabase_Client.js';



// --- 1. LINK (ENROLL) STUDENT TO CLASS (SA) ---
export const Link_Student_To_Class_SA = async (req, res) => {
  const My_School_Id = req.user.user_id; // From Token
  const { Student_Id, Class_Id, Roll_No } = req.body;

  if (!Student_Id || !Class_Id) {
    return res.status(400).json({ success: false, message: "Student_Id and Class_Id are required." });
  }

  try {
    // --- SECURITY VERIFICATION ---
    // 1. Check if student is enrolled at MY school (via Student_School_Enrollment)
    // 2. Check if class belongs to MY school

    const [Enrollment_Check, Class_Check] = await Promise.all([
      Supabase_Client
        .from('Student_School_Enrollment')
        .select('enrollment_id')
        .eq('student_id', Student_Id)
        .eq('school_id', My_School_Id)
        .eq('is_active', true)
        .maybeSingle(),
      Supabase_Client
        .from('Class')
        .select('school_id')
        .eq('class_id', Class_Id)
        .single()
    ]);

    // Check 1: Does Student have active enrollment at my school?
    if (!Enrollment_Check.data) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: This Student is not enrolled at your school."
      });
    }

    // Check 2: Does Class exist and belong to my school?
    if (Class_Check.error || !Class_Check.data || Class_Check.data.school_id != My_School_Id) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: This Class does not belong to your school."
      });
    }

    // --- EXECUTE ENROLLMENT ---
    const { data: Enrollment, error: Db_Error } = await Supabase_Client
      .from('Student_Class_Enrollment_Relation')
      .insert([
        {
          student_id: Student_Id,
          class_id: Class_Id,
          roll_no: Roll_No || null
        }
      ])
      .select()
      .single();

    if (Db_Error) {
      if (Db_Error.code === '23505') {
        if (Db_Error.details.includes('student_id')) {
          return res.status(409).json({ success: false, message: "Student is already enrolled in a class." });
        }
        if (Db_Error.details.includes('roll_no')) {
          return res.status(409).json({ success: false, message: "Roll Number already taken in this class." });
        }
      }
      throw Db_Error;
    }

    res.status(201).json({ success: true, message: "Student Enrolled Successfully.", data: Enrollment });

  } catch (Error) {
    console.error("Enrollment SA Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};






// --- 2. UNLINK STUDENT FROM CLASS (SA) ---
export const Unlink_Student_SA = async (req, res) => {
  const My_School_Id = req.user.user_id;
  const { Enrollment_Id } = req.body;

  if (!Enrollment_Id) {
    return res.status(400).json({ success: false, message: "Enrollment_Id is required." });
  }

  try {
    // --- SECURITY VERIFICATION ---
    // Find the Class this enrollment belongs to, and check if that Class belongs to My School

    const { data: Enrollment_Data, error: Fetch_Error } = await Supabase_Client
      .from('Student_Class_Enrollment_Relation')
      .select(`
        enrollment_id,
        Class!inner ( school_id ) 
      `)
      .eq('enrollment_id', Enrollment_Id)
      .single();

    if (Fetch_Error || !Enrollment_Data) {
      return res.status(404).json({ success: false, message: "Enrollment record not found." });
    }

    // Check Ownership
    if (Enrollment_Data.Class.school_id != My_School_Id) {
      return res.status(403).json({ success: false, message: "Access Denied: You cannot delete this enrollment." });
    }

    // --- EXECUTE REMOVAL ---
    const { error: Delete_Error } = await Supabase_Client
      .from('Student_Class_Enrollment_Relation')
      .delete()
      .eq('enrollment_id', Enrollment_Id);

    if (Delete_Error) throw Delete_Error;

    res.json({ success: true, message: "Student unlinked successfully." });

  } catch (Error) {
    console.error("Unlink SA Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};




// --- 3. GET CLASS STUDENTS (SA) ---
export const Get_Class_Students_SA = async (req, res) => {
  const My_School_Id = req.user.user_id;
  const { Class_Id } = req.query;

  if (!Class_Id) {
    return res.status(400).json({ success: false, message: "Class_Id is required." });
  }

  try {
    // --- SECURITY CHECK ---
    // Verify that this Class belongs to My School
    const { data: Class_Info, error: Class_Error } = await Supabase_Client
      .from('Class')
      .select('school_id')
      .eq('class_id', Class_Id)
      .single();

    if (Class_Error || !Class_Info || Class_Info.school_id != My_School_Id) {
      return res.status(403).json({ success: false, message: "Access Denied: You cannot view this class." });
    }

    // --- FETCH STUDENTS ---
    // Student no longer has school_id, so we just get student info directly
    const { data: List, error } = await Supabase_Client
      .from('Student_Class_Enrollment_Relation')
      .select(`
        enrollment_id,
        roll_no,
        created_at,
        Student ( 
          student_id, 
          student_name, 
          parent_name, 
          phone, 
          email,
          is_active,
          firebase_id
        )
      `)
      .eq('class_id', Class_Id)
      .order('roll_no', { ascending: true });

    if (error) throw error;

    // --- FORMAT DATA ---
    const Formatted_List = List.map(Item => ({
      enrollment_id: Item.enrollment_id,
      roll_no: Item.roll_no,
      student_id: Item.Student.student_id,
      student_name: Item.Student.student_name,
      parent_name: Item.Student.parent_name,
      phone: Item.Student.phone,
      email: Item.Student.email,
      is_active: Item.Student.is_active,
      firebase_status: Item.Student.firebase_id ? "Linked" : "Not Linked"
    }));

    res.json({
      success: true,
      class_id: Class_Id,
      count: Formatted_List.length,
      data: Formatted_List
    });

  } catch (Error) {
    console.error("Fetch Class Students SA Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};




// --- 4. GET STUDENTS ENROLLED IN MY SCHOOL (SA) ---
// New function to get all students enrolled at this school
export const Get_School_Students_SA = async (req, res) => {
  const My_School_Id = req.user.user_id;

  try {
    // Fetch all active enrollments at my school
    const { data: Enrollments, error: Db_Error } = await Supabase_Client
      .from('Student_School_Enrollment')
      .select(`
        enrollment_id,
        enrolled_at,
        Student (
          student_id,
          student_name,
          parent_name,
          phone,
          email,
          is_active
        )
      `)
      .eq('school_id', My_School_Id)
      .eq('is_active', true)
      .order('enrolled_at', { ascending: false });

    if (Db_Error) throw Db_Error;

    // Flatten data
    const Students = Enrollments.map(e => ({
      enrollment_id: e.enrollment_id,
      enrolled_at: e.enrolled_at,
      student_id: e.Student.student_id,
      student_name: e.Student.student_name,
      parent_name: e.Student.parent_name,
      phone: e.Student.phone,
      email: e.Student.email,
      is_active: e.Student.is_active
    }));

    res.json({
      success: true,
      school_id: My_School_Id,
      count: Students.length,
      data: Students
    });

  } catch (Error) {
    console.error("Get School Students SA Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};