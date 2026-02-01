import Supabase_Client from '../../Supabase_Client.js'; 




// --- 1. LINK (ASSIGN) TEACHER TO CLASS (SA) ---
export const Link_ClassTeacher_To_Class_SA = async (req, res) => {
  const My_School_Id = req.user.user_id; // From Token
  const { Class_Id, Teacher_Id } = req.body;

  if (!Class_Id || !Teacher_Id) {
    return res.status(400).json({ success: false, message: "Class_Id and Teacher_Id are required." });
  }

  try {
    // --- SECURITY CHECK 1: DOES THE CLASS BELONG TO ME? ---
    const { data: Class_Check } = await Supabase_Client
      .from('Class')
      .select('school_id')
      .eq('class_id', Class_Id)
      .single();

    if (!Class_Check || Class_Check.school_id != My_School_Id) {
      return res.status(403).json({ success: false, message: "Access Denied: This Class does not belong to your school." });
    }

    // --- SECURITY CHECK 2: DOES THE TEACHER BELONG TO ME? ---
    const { data: Teacher_Check } = await Supabase_Client
      .from('Teacher')
      .select('school_id')
      .eq('teacher_id', Teacher_Id)
      .single();

    if (!Teacher_Check || Teacher_Check.school_id != My_School_Id) {
      return res.status(403).json({ success: false, message: "Access Denied: This Teacher does not belong to your school." });
    }

    // --- EXECUTE LINK ---
    const { data: Relation, error } = await Supabase_Client
      .from('Class_ClassTeacher_Relation')
      .insert([
        { class_id: Class_Id, teacher_id: Teacher_Id }
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ success: false, message: "Teacher is already assigned to this class." });
      }
      throw error;
    }

    res.status(201).json({ success: true, message: "Class Teacher assigned successfully.", data: Relation });

  } catch (Error) {
    console.error("SA Link ClassTeacher Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};











// --- 2. UNLINK (REMOVE) TEACHER FROM CLASS (SA) ---
export const Unlink_ClassTeacher_To_Class_SA = async (req, res) => {
  const My_School_Id = req.user.user_id;
  const { Relation_Id } = req.body;

  if (!Relation_Id) {
    return res.status(400).json({ success: false, message: "Relation_Id is required." });
  }

  try {
    // --- SECURITY CHECK: VERIFY RELATION OWNERSHIP ---
    // We fetch the relation AND the linked Class to see the School ID
    const { data: Relation_Check, error: Fetch_Err } = await Supabase_Client
      .from('Class_ClassTeacher_Relation')
      .select(`
        id,
        Class (
          school_id
        )
      `)
      .eq('id', Relation_Id)
      .single();

    if (Fetch_Err || !Relation_Check) {
      return res.status(404).json({ success: false, message: "Assignment not found." });
    }

    // Check if the Class in this relationship belongs to My School
    if (Relation_Check.Class.school_id != My_School_Id) {
      return res.status(403).json({ success: false, message: "Access Denied: You cannot delete this assignment." });
    }

    // --- EXECUTE DELETE ---
    const { error: Delete_Err } = await Supabase_Client
      .from('Class_ClassTeacher_Relation')
      .delete()
      .eq('id', Relation_Id);

    if (Delete_Err) throw Delete_Err;

    res.json({ success: true, message: "Teacher removed from class successfully." });

  } catch (Error) {
    console.error("SA Unlink ClassTeacher Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};










// --- 3. GET CLASS TEACHERS (SA) ---
export const Get_ClassTeacher_To_Class_SA = async (req, res) => {
  const My_School_Id = req.user.user_id;
  const { Class_Id } = req.query;

  if (!Class_Id) {
    return res.status(400).json({ success: false, message: "Class_Id is required." });
  }

  try {
    // --- SECURITY CHECK: DOES CLASS BELONG TO ME? ---
    const { data: Class_Check } = await Supabase_Client
      .from('Class')
      .select('school_id')
      .eq('class_id', Class_Id)
      .single();

    if (!Class_Check || Class_Check.school_id != My_School_Id) {
      return res.status(403).json({ success: false, message: "Access Denied: This Class does not belong to your school." });
    }

    // --- FETCH DATA ---
    const { data: List, error } = await Supabase_Client
      .from('Class_ClassTeacher_Relation')
      .select(`
        id,
        created_at,
        Teacher (
          teacher_id,
          name,
          phone,
          email,
          is_active
        )
      `)
      .eq('class_id', Class_Id);

    if (error) throw error;

    const Formatted_List = List.map(Item => ({
      relation_id: Item.id,
      assigned_at: Item.created_at,
      teacher_info: Item.Teacher
    }));

    res.json({
      success: true,
      class_id: Class_Id,
      count: Formatted_List.length,
      data: Formatted_List
    });

  } catch (Error) {
    console.error("SA Get ClassTeachers Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};