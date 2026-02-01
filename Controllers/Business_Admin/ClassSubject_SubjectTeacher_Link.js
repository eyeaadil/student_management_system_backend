import Supabase_Client from '../../Supabase_Client.js';




// --- 1. LINK (ASSIGN) TEACHER TO A CLASS SUBJECT ---
export const Link_ClassSubject_SubjectTeacher_BA = async (req, res) => {
  const { Class_Subject_Relation_Id, Teacher_Id } = req.body;

  if (!Class_Subject_Relation_Id || !Teacher_Id) {
    return res.status(400).json({ success: false, message: "Class_Subject_Relation_Id and Teacher_Id are required." });
  }

  try {
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
      if (error.code === '23505') { // Unique Constraint Violation
        return res.status(409).json({ success: false, message: "This teacher is already assigned to this subject." });
      }
      throw error;
    }

    res.status(201).json({ success: true, message: "Subject Teacher assigned successfully.", data: Link });

  } catch (Error) {
    console.error("Link SubjectTeacher BA Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};













// --- 2. UNLINK (REMOVE) TEACHER FROM SUBJECT ---
export const Unlink_ClassSubject_SubjectTeacher_BA = async (req, res) => {
  const { Link_Id } = req.body; // Using the PK 'link_id'

  if (!Link_Id) {
    return res.status(400).json({ success: false, message: "Link_Id is required." });
  }

  try {
    const { error } = await Supabase_Client
      .from('ClassSubject_SubjectTeacher_Relation')
      .delete()
      .eq('link_id', Link_Id);

    if (error) throw error;

    res.json({ success: true, message: "Teacher removed from subject successfully." });

  } catch (Error) {
    console.error("Unlink SubjectTeacher BA Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};









// --- 3. GET TEACHERS FOR A SUBJECT (READ) ---
export const Get_ClassSubject_SubjectTeachers_BA = async (req, res) => {
  const { Class_Subject_Relation_Id } = req.query;

  if (!Class_Subject_Relation_Id) {
    return res.status(400).json({ success: false, message: "Class_Subject_Relation_Id is required." });
  }

  try {
    // Fetch Link + Teacher Details
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

    // Format Data
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
    console.error("Get SubjectTeachers BA Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};