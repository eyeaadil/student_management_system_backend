import Supabase_Client from '../../Supabase_Client.js';





// --- 1. LINK SUBJECT TO CLASS (BA) ---
export const Link_Subject_To_Class_BA = async (req, res) => {
  const { Class_Id, Subject_Id } = req.body;

  if (!Class_Id || !Subject_Id) return res.status(400).json({ success: false, message: "Class_Id and Subject_Id required." });

  try {
    const { data, error } = await Supabase_Client
      .from('Class_Subject_Relation')
      .insert([{ class_id: Class_Id, subject_id: Subject_Id }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return res.status(409).json({ success: false, message: "This Subject is already mapped to this Class." });
      throw error;
    }

    res.status(201).json({ success: true, message: "Subject Linked to Class.", data: data });

  } catch (Error) {
    res.status(500).json({ success: false, error: Error.message });
  }
};




// --- 2. UNLINK SUBJECT (BA) ---
export const Unlink_Subject_From_Class_BA = async (req, res) => {
  const { Relation_Id } = req.body; // Or pass Class_Id + Subject_Id

  try {
    const { error } = await Supabase_Client
      .from('Class_Subject_Relation')
      .delete()
      .eq('class_subject_relation_id', Relation_Id);

    if (error) throw error;
    res.json({ success: true, message: "Unlinked Successfully." });

  } catch (Error) {
    res.status(500).json({ success: false, error: Error.message });
  }
};

// --- 3. GET MAPPED SUBJECTS FOR A CLASS (BA) ---
export const Get_Class_Subjects_BA = async (req, res) => {
  const { Class_Id } = req.query; // GET request

  try {
    const { data, error } = await Supabase_Client
      .from('Class_Subject_Relation')
      .select(`
        class_subject_relation_id,
        Subject ( subject_id, subject_name )
      `)
      .eq('class_id', Class_Id);

    if (error) throw error;

    // Flattening structure for easier frontend use
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