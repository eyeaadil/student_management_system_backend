import Supabase_Client from '../../Supabase_Client.js';


// --- 1. LINK (ASSIGN) TEACHER TO CLASS ---
export const Link_ClassTeacher_To_Class_BA = async (req, res) => {
  const { Class_Id, Teacher_Id } = req.body;

  if (!Class_Id || !Teacher_Id) {
    return res.status(400).json({ success: false, message: "Class_Id and Teacher_Id are required." });
  }

  try {
    // Attempt Insert
    const { data: Relation, error } = await Supabase_Client
      .from('Class_ClassTeacher_Relation')
      .insert([
        { class_id: Class_Id, teacher_id: Teacher_Id }
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique Constraint Violation
        return res.status(409).json({ success: false, message: "This teacher is already assigned to this class." });
      }
      throw error;
    }

    res.status(201).json({ success: true, message: "Class Teacher assigned successfully.", data: Relation });

  } catch (Error) {
    console.error("Link ClassTeacher BA Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};







// --- 2. UNLINK (REMOVE) TEACHER FROM CLASS ---
export const Unlink_ClassTeacher_To_Class_BA  = async (req, res) => {
  // Use the relation ID (Primary Key of the relation table)
  const { Relation_Id } = req.body;

  if (!Relation_Id) {
    return res.status(400).json({ success: false, message: "Relation_Id is required." });
  }

  try {
    const { error } = await Supabase_Client
      .from('Class_ClassTeacher_Relation')
      .delete()
      .eq('id', Relation_Id);

    if (error) throw error;

    res.json({ success: true, message: "Teacher removed from class successfully." });

  } catch (Error) {
    console.error("Unlink ClassTeacher BA Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};






// --- 3. GET CLASS TEACHERS (READ) ---
export const Get_ClassTeacher_To_Class_BA  = async (req, res) => {
  const { Class_Id } = req.query;

  if (!Class_Id) {
    return res.status(400).json({ success: false, message: "Class_Id is required." });
  }

  try {
    // Fetch Relation + Teacher Details
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

    // Format Data
    const Formatted_List = List.map(Item => ({
      relation_id: Item.id, // Used for Unlinking
      assigned_at: Item.created_at,
      teacher_info: Item.Teacher // Nested teacher object
    }));

    res.json({
      success: true,
      class_id: Class_Id,
      count: Formatted_List.length,
      data: Formatted_List
    });

  } catch (Error) {
    console.error("Get ClassTeachers BA Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};