import Supabase_Client from '../../Supabase_Client.js';



// --- 1. LINK (ASSIGN) TEACHER TO SUBJECT (SA) ---
export const Link_ClassSubject_SubjectTeacher_SA = async (req, res) => {
  const My_School_Id = req.user.user_id; // From Token
  const { Class_Subject_Relation_Id, Teacher_Id } = req.body;

  if (!Class_Subject_Relation_Id || !Teacher_Id) {
    return res.status(400).json({ success: false, message: "Class_Subject_Relation_Id and Teacher_Id are required." });
  }

  try {
    // --- SECURITY CHECK 1: DOES THE SUBJECT BELONG TO MY SCHOOL? ---
    const { data: Subject_Check, error: Sub_Err } = await Supabase_Client
      .from('Class_Subject_Relation')
      .select(`
        class_subject_relation_id,
        Class ( school_id )
      `)
      .eq('class_subject_relation_id', Class_Subject_Relation_Id)
      .single();

    if (Sub_Err || !Subject_Check) {
      return res.status(404).json({ success: false, message: "Subject Relation not found." });
    }

    if (Subject_Check.Class.school_id != My_School_Id) {
      return res.status(403).json({ success: false, message: "Access Denied: This Subject/Class does not belong to your school." });
    }

    // --- SECURITY CHECK 2: IS TEACHER ENROLLED AT MY SCHOOL? ---
    const { data: Teacher_Enrollment } = await Supabase_Client
      .from('Teacher_School_Enrollment')
      .select('enrollment_id')
      .eq('teacher_id', Teacher_Id)
      .eq('school_id', My_School_Id)
      .eq('is_active', true)
      .maybeSingle();

    if (!Teacher_Enrollment) {
      return res.status(403).json({ success: false, message: "Access Denied: This Teacher is not employed at your school." });
    }

    // --- EXECUTE LINK ---
    const { data: Link, error } = await Supabase_Client
      .from('ClassSubject_SubjectTeacher_Relation')
      .insert([
        {
          class_subject_relation_id: Class_Subject_Relation_Id,
          teacher_id: Teacher_Id
        }
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ success: false, message: "Teacher is already assigned to this subject." });
      }
      throw error;
    }

    res.status(201).json({ success: true, message: "Subject Teacher assigned successfully.", data: Link });

  } catch (Error) {
    console.error("SA Link SubjectTeacher Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};




// --- 2. UNLINK (REMOVE) TEACHER FROM SUBJECT (SA) ---
export const Unlink_ClassSubject_SubjectTeacher_SA = async (req, res) => {
  const My_School_Id = req.user.user_id;
  const { Link_Id } = req.body;

  if (!Link_Id) {
    return res.status(400).json({ success: false, message: "Link_Id is required." });
  }

  try {
    // --- SECURITY CHECK: VERIFY OWNERSHIP ---
    const { data: Link_Check, error: Fetch_Err } = await Supabase_Client
      .from('ClassSubject_SubjectTeacher_Relation')
      .select(`
        link_id,
        Class_Subject_Relation (
          Class ( school_id )
        )
      `)
      .eq('link_id', Link_Id)
      .single();

    if (Fetch_Err || !Link_Check) {
      return res.status(404).json({ success: false, message: "Assignment Link not found." });
    }

    const Target_School_Id = Link_Check.Class_Subject_Relation?.Class?.school_id;

    if (Target_School_Id != My_School_Id) {
      return res.status(403).json({ success: false, message: "Access Denied: You cannot delete this assignment." });
    }

    // --- EXECUTE DELETE ---
    const { error: Delete_Err } = await Supabase_Client
      .from('ClassSubject_SubjectTeacher_Relation')
      .delete()
      .eq('link_id', Link_Id);

    if (Delete_Err) throw Delete_Err;

    res.json({ success: true, message: "Teacher removed from subject successfully." });

  } catch (Error) {
    console.error("SA Unlink SubjectTeacher Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};




// --- 3. GET TEACHERS FOR A SUBJECT (SA) ---
export const Get_ClassSubject_SubjectTeachers_SA = async (req, res) => {
  const My_School_Id = req.user.user_id;
  const { Class_Subject_Relation_Id } = req.query;

  if (!Class_Subject_Relation_Id) {
    return res.status(400).json({ success: false, message: "Class_Subject_Relation_Id is required." });
  }

  try {
    // --- SECURITY CHECK: DOES SUBJECT BELONG TO ME? ---
    const { data: Subject_Check } = await Supabase_Client
      .from('Class_Subject_Relation')
      .select(`Class ( school_id )`)
      .eq('class_subject_relation_id', Class_Subject_Relation_Id)
      .single();

    if (!Subject_Check || Subject_Check.Class.school_id != My_School_Id) {
      return res.status(403).json({ success: false, message: "Access Denied: This Subject does not belong to your school." });
    }

    // --- FETCH DATA ---
    const { data: List, error } = await Supabase_Client
      .from('ClassSubject_SubjectTeacher_Relation')
      .select(`
        link_id,
        created_at,
        Teacher (
          teacher_id,
          name,
          phone,
          email,
          is_active
        )
      `)
      .eq('class_subject_relation_id', Class_Subject_Relation_Id);

    if (error) throw error;

    const Formatted_List = List.map(Item => ({
      link_id: Item.link_id,
      assigned_at: Item.created_at,
      teacher_info: Item.Teacher
    }));

    res.json({
      success: true,
      class_subject_relation_id: Class_Subject_Relation_Id,
      count: Formatted_List.length,
      data: Formatted_List
    });

  } catch (Error) {
    console.error("SA Get SubjectTeachers Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};