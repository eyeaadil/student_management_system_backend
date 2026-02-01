import Supabase_Client from '../../Supabase_Client.js'; 


export const School_Create_Subject_SA = async (req, res) => {
  // 1. Get School ID from Token
  const My_School_Id = req.user.user_id;
  
  // 2. Get Input
  const { Session_Id, Subject_Name } = req.body;

  if (!Session_Id || !Subject_Name) {
    return res.status(400).json({ success: false, message: "Session_Id and Subject_Name are required." });
  }

  try {
    const { data: New_Subject, error: Db_Error } = await Supabase_Client
      .from('Subject')
      .insert([
        { 
          school_id: My_School_Id, // Auto-filled from token
          session_id: Session_Id, 
          subject_name: Subject_Name 
        }
      ])
      .select()
      .single();

    if (Db_Error) {
      if (Db_Error.code === '23505') return res.status(409).json({ success: false, message: "This subject already exists in this session." });
      throw Db_Error;
    }

    res.status(201).json({ success: true, message: "Subject Created.", data: New_Subject });

  } catch (Error) {
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};
















export const School_Get_Subjects_SA = async (req, res) => {
  const My_School_Id = req.user.user_id;
  const { Session_Id } = req.query; // Mandatory now

  // 🔴 Validation: Session_Id is required
  if (!Session_Id) {
    return res.status(400).json({
      success: false,
      error: "Session_Id is required"
    });
  }

  try {
    const { data: List, error } = await Supabase_Client
      .from('Subject')
      .select(`
        subject_id, 
        subject_name, 
        session_id,
        AcademicSession ( session_name )
      `)
      .eq('school_id', My_School_Id)
      .eq('session_id', Session_Id) // ✅ Always applied
      .order('subject_name', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      count: List.length,
      data: List
    });

  } catch (Error) {
    res.status(500).json({
      success: false,
      error: Error.message
    });
  }
};














export const School_Edit_Subject_SA = async (req, res) => {
  const My_School_Id = req.user.user_id;
  const { Subject_Id, Subject_Name } = req.body;

  if (!Subject_Id || !Subject_Name) {
    return res.status(400).json({ success: false, message: "Subject_Id and Subject_Name required." });
  }

  try {
    const { data: Updated, error } = await Supabase_Client
      .from('Subject')
      .update({ subject_name: Subject_Name })
      .eq('subject_id', Subject_Id)
      .eq('school_id', My_School_Id) // SECURITY: Must belong to this school
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return res.status(409).json({ success: false, message: "Name conflict." });
      // If .single() fails because row wasn't found (wrong school_id), it throws 'PGRST116'
      if (error.code === 'PGRST116') return res.status(404).json({ success: false, message: "Subject not found or access denied." });
      throw error;
    }

    res.json({ success: true, message: "Subject Updated.", data: Updated });

  } catch (Error) {
    res.status(500).json({ success: false, error: Error.message });
  }
};









export const School_Delete_Subject_SA = async (req, res) => {
  const My_School_Id = req.user.user_id;
  const { Subject_Id } = req.body;

  try {
    // 1. Perform Delete with Ownership Check
    const { error, count } = await Supabase_Client // 'count' requires explicit select if using delete? 
    // Easier way: just attempt delete with composite key
      .from('Subject')
      .delete()
      .eq('subject_id', Subject_Id)
      .eq('school_id', My_School_Id); // SECURITY

    if (error) throw error;

    // Supabase delete doesn't throw error if 0 rows deleted, so we assume success.
    // If you strictly need to know if it existed, you'd fetch before delete, 
    // but for simple deletes, this is usually acceptable.
    
    res.json({ success: true, message: "Subject Deleted (if it existed)." });

  } catch (Error) {
    res.status(500).json({ success: false, error: Error.message });
  }
};