import Supabase_Client from '../../Supabase_Client.js';









export const Create_Subject_BA = async (req, res) => {
  const { School_Id, Session_Id, Subject_Name } = req.body;

  if (!School_Id || !Session_Id || !Subject_Name) {
    return res.status(400).json({ success: false, message: "School_Id, Session_Id, and Subject_Name are required." });
  }

  try {
    const { data: New_Subject, error: Db_Error } = await Supabase_Client
      .from('Subject')
      .insert([
        { 
          school_id: School_Id, 
          session_id: Session_Id, 
          subject_name: Subject_Name 
        }
      ])
      .select()
      .single();

    if (Db_Error) {
      // Handle Unique Constraint (Same subject in same session for same school)
      if (Db_Error.code === '23505') {
        return res.status(409).json({ success: false, message: "This Subject already exists in this Session for this School." });
      }
      throw Db_Error;
    }

    res.status(201).json({ success: true, message: "Subject Created.", data: New_Subject });

  } catch (Error) {
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};






export const Edit_Subject_BA = async (req, res) => {
  const { Subject_Id, Subject_Name } = req.body;

  if (!Subject_Id || !Subject_Name) {
    return res.status(400).json({ success: false, message: "Subject_Id and new Subject_Name required." });
  }

  try {
    const { data: Updated, error } = await Supabase_Client
      .from('Subject')
      .update({ subject_name: Subject_Name })
      .eq('subject_id', Subject_Id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return res.status(409).json({ success: false, message: "Name conflict: This subject already exists." });
      throw error;
    }

    res.json({ success: true, message: "Subject Updated.", data: Updated });

  } catch (Error) {
    res.status(500).json({ success: false, error: Error.message });
  }
};









export const Get_Subjects_BA = async (req, res) => {
  const { School_Id, Session_Id } = req.query; // Using Query Params for GET

  if (!School_Id) {
    return res.status(400).json({ success: false, message: "School_Id is required." });
  }

  try {
    let Query = Supabase_Client
      .from('Subject')
      .select(`
        subject_id, 
        subject_name, 
        session_id,
        AcademicSession ( session_name ) 
      `)
      .eq('school_id', School_Id)
      .order('subject_name', { ascending: true });

    // Optional: Filter by specific session (e.g., 2024-2025 only)
    if (Session_Id) {
      Query = Query.eq('session_id', Session_Id);
    }

    const { data: List, error } = await Query;

    if (error) throw error;

    res.json({ success: true, count: List.length, data: List });

  } catch (Error) {
    res.status(500).json({ success: false, error: Error.message });
  }
};










export const Delete_Subject_BA = async (req, res) => {
  const { Subject_Id } = req.body;

  if (!Subject_Id) return res.status(400).json({ success: false, message: "Subject_Id required." });

  try {
    const { error } = await Supabase_Client
      .from('Subject')
      .delete()
      .eq('subject_id', Subject_Id);

    if (error) throw error;

    res.json({ success: true, message: "Subject Deleted." });

  } catch (Error) {
    res.status(500).json({ success: false, error: Error.message });
  }
};