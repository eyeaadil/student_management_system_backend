import Supabase_Client from '../../Supabase_Client.js';




// --- 1. CREATE CLASS ---
export const Create_Class_BA = async (req, res) => {
  const { School_Id, Session_Id, Class_Name } = req.body;

  if (!School_Id || !Session_Id || !Class_Name) {
    return res.status(400).json({ success: false, message: "Missing required fields: School_Id, Session_Id, Class_Name." });
  }

  try {
    const { data: New_Class, error: Db_Error } = await Supabase_Client
      .from('Class') // Table Name
      .insert([
        { 
          school_id: School_Id, 
          session_id: Session_Id, 
          class_name: Class_Name 
        }
      ])
      .select()
      .single();

    if (Db_Error) {
      // Check for Unique Constraint (School + Session + ClassName)
      if (Db_Error.code === '23505') {
        return res.status(409).json({ success: false, message: "This Class already exists in this Session for this School." });
      }
      throw Db_Error;
    }

    res.status(201).json({ success: true, message: "Class Created Successfully.", data: New_Class });

  } catch (Error) {
    console.error("Create Class Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};

// --- 2. READ ALL CLASSES (For a specific School) ---
export const Get_Classes_BA = async (req, res) => {
  // Use Query Params for GET requests (e.g., ?School_Id=1)
  const { School_Id, Session_Id } = req.query;

  if (!School_Id) {
    return res.status(400).json({ success: false, message: "School_Id is required." });
  }

  try {
    let Query = Supabase_Client
      .from('Class')
      .select(`
        class_id, 
        class_name, 
        session_id,
        AcademicSession ( session_name )
      `)
      .eq('school_id', School_Id)
      .order('class_name', { ascending: true }); // A, B, C...

    // Optional: Filter by Session
    if (Session_Id) {
      Query = Query.eq('session_id', Session_Id);
    }

    const { data: Class_List, error } = await Query;

    if (error) throw error;

    res.json({ success: true, count: Class_List.length, data: Class_List });

  } catch (Error) {
    console.error("Fetch Classes Error:", Error.message);
    res.status(500).json({ success: false, error: Error.message });
  }
};

// --- 3. EDIT CLASS ---
export const Edit_Class_BA = async (req, res) => {
  const { Class_Id, Class_Name } = req.body;

  if (!Class_Id || !Class_Name) {
    return res.status(400).json({ success: false, message: "Class_Id and new Class_Name are required." });
  }

  try {
    const { data: Updated_Class, error } = await Supabase_Client
      .from('Class')
      .update({ class_name: Class_Name })
      .eq('class_id', Class_Id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return res.status(409).json({ success: false, message: "Class Name already exists in this session." });
      throw error;
    }

    res.json({ success: true, message: "Class Name Updated.", data: Updated_Class });

  } catch (Error) {
    console.error("Edit Class Error:", Error.message);
    res.status(500).json({ success: false, error: Error.message });
  }
};

// --- 4. DELETE CLASS ---
export const Delete_Class_BA = async (req, res) => {
  const { Class_Id } = req.body;

  if (!Class_Id) {
    return res.status(400).json({ success: false, message: "Class_Id is required." });
  }

  try {
    const { error } = await Supabase_Client
      .from('Class')
      .delete()
      .eq('class_id', Class_Id);

    if (error) throw error;

    res.json({ success: true, message: "Class Deleted Successfully." });

  } catch (Error) {
    console.error("Delete Class Error:", Error.message);
    res.status(500).json({ success: false, error: Error.message });
  }
};