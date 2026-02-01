import Supabase_Client from '../../Supabase_Client.js'; 




// --- 1. LINK SUBJECT TO CLASS (SA) ---
export const Link_Subject_To_Class_SA = async (req, res) => {
  const My_School_Id = req.user.user_id;
  const { Class_Id, Subject_Id } = req.body;

  if (!Class_Id || !Subject_Id) return res.status(400).json({ success: false, message: "IDs required." });

  try {
    // --- SECURITY CHECK ---
    // 1. Check if Class belongs to me
    const { data: Class_Check } = await Supabase_Client
      .from('Class')
      .select('class_id')
      .eq('class_id', Class_Id)
      .eq('school_id', My_School_Id)
      .single();

    if (!Class_Check) return res.status(403).json({ success: false, message: "Invalid Class (Access Denied)." });

    // 2. Check if Subject belongs to me
    const { data: Subject_Check } = await Supabase_Client
      .from('Subject')
      .select('subject_id')
      .eq('subject_id', Subject_Id)
      .eq('school_id', My_School_Id)
      .single();

    if (!Subject_Check) return res.status(403).json({ success: false, message: "Invalid Subject (Access Denied)." });

    // --- EXECUTE LINK ---
    const { data, error } = await Supabase_Client
      .from('Class_Subject_Relation')
      .insert([{ class_id: Class_Id, subject_id: Subject_Id }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return res.status(409).json({ success: false, message: "Already linked." });
      throw error;
    }

    res.status(201).json({ success: true, message: "Subject Linked.", data: data });

  } catch (Error) {
    res.status(500).json({ success: false, error: Error.message });
  }
};

// --- 2. UNLINK (SA) ---
export const Unlink_Subject_From_Class_SA = async (req, res) => {
  const My_School_Id = req.user.user_id;
  const { Relation_Id } = req.body;

  try {
    // SECURITY: We need to make sure this Relation belongs to a Class that belongs to Me.
    // We do a delete with a join filter essentially.
    
    // 1. Fetch Relation first to check ownership
    const { data: Rel_Info, error: Fetch_Err } = await Supabase_Client
      .from('Class_Subject_Relation')
      .select(`
        class_id,
        Class!inner ( school_id ) 
      `)
      .eq('class_subject_relation_id', Relation_Id)
      .single();
      
    if (Fetch_Err || !Rel_Info) return res.status(404).json({ success: false, message: "Relation not found." });

    // 2. Verify School ID matches Token
    if (Rel_Info.Class.school_id != My_School_Id) {
      return res.status(403).json({ success: false, message: "Unauthorized Action." });
    }

    // 3. Delete
    const { error: Del_Err } = await Supabase_Client
      .from('Class_Subject_Relation')
      .delete()
      .eq('class_subject_relation_id', Relation_Id);

    if (Del_Err) throw Del_Err;

    res.json({ success: true, message: "Unlinked Successfully." });

  } catch (Error) {
    res.status(500).json({ success: false, error: Error.message });
  }
};

// --- 3. GET CLASS SUBJECTS (SA) ---
export const Get_Class_Subjects_SA = async (req, res) => {
  const My_School_Id = req.user.user_id;
  const { Class_Id } = req.query;

  try {
    // 1. Security Check (Does this class belong to me?)
    const { data: Class_Check } = await Supabase_Client
      .from('Class')
      .select('school_id')
      .eq('class_id', Class_Id)
      .single();

    if (!Class_Check || Class_Check.school_id != My_School_Id) {
      return res.status(403).json({ success: false, message: "Access Denied." });
    }

    // 2. Fetch Subjects
    const { data, error } = await Supabase_Client
      .from('Class_Subject_Relation')
      .select(`
        class_subject_relation_id,
        Subject ( subject_id, subject_name )
      `)
      .eq('class_id', Class_Id);

    if (error) throw error;

    const Formatted = data.map(item => ({
      relation_id: item.class_subject_relation_id,
      subject_id: item.Subject.subject_id,
      subject_name: item.Subject.subject_name
    }));

    res.json({ success: true, count: Formatted.length, data: Formatted });

  } catch (Error) {
    res.status(500).json({ success: false, error: Error.message });
  }
};