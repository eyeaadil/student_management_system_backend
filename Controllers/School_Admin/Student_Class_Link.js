

import Supabase_Client from '../../Supabase_Client.js'; 



// --- 1. LINK (ENROLL) STUDENT (SA) ---
export const Link_Student_To_Class_SA = async (req, res) => {
  const My_School_Id = req.user.user_id; // From Token
  const { Student_Id, Class_Id, Roll_No } = req.body;

  if (!Student_Id || !Class_Id) {
    return res.status(400).json({ success: false, message: "Student_Id and Class_Id are required." });
  }

  try {
    // --- SECURITY VERIFICATION (Parallel Check) ---
    // We fetch the school_id for both the Student and the Class to ensure they belong to YOU.
    const [Student_Check, Class_Check] = await Promise.all([
      Supabase_Client.from('Student').select('school_id').eq('student_id', Student_Id).single(),
      Supabase_Client.from('Class').select('school_id').eq('class_id', Class_Id).single()
    ]);

    // Check 1: Does Student exist and belong to my school?
    if (Student_Check.error || Student_Check.data.school_id != My_School_Id) {
      return res.status(403).json({ success: false, message: "Access Denied: This Student does not belong to your school." });
    }

    // Check 2: Does Class exist and belong to my school?
    if (Class_Check.error || Class_Check.data.school_id != My_School_Id) {
      return res.status(403).json({ success: false, message: "Access Denied: This Class does not belong to your school." });
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
        if (Db_Error.details.includes('student_id')) return res.status(409).json({ success: false, message: "Student is already enrolled in a class." });
        if (Db_Error.details.includes('roll_no')) return res.status(409).json({ success: false, message: "Roll Number already taken in this class." });
      }
      throw Db_Error;
    }

    res.status(201).json({ success: true, message: "Student Enrolled Successfully.", data: Enrollment });

  } catch (Error) {
    console.error("Enrollment SA Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};







// Controllers/Enrollment/Enrollment_SA.js

export const Unlink_Student_SA = async (req, res) => {
  const My_School_Id = req.user.user_id;
  const { Enrollment_Id } = req.body;

  if (!Enrollment_Id) {
    return res.status(400).json({ success: false, message: "Enrollment_Id is required." });
  }

  try {
    // --- SECURITY VERIFICATION ---
    // We need to find the Class this enrollment belongs to, 
    // and then check if that Class belongs to My School.
    
    const { data: Enrollment_Data, error: Fetch_Error } = await Supabase_Client
      .from('Student_Class_Enrollment_Relation')
      .select(`
        enrollment_id,
        Class!inner ( school_id ) 
      `)
      // 'Class!inner' ensures we get the joined class data. 
      // If the Class doesn't exist, this returns null.
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