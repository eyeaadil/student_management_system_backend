import Supabase_Client from '../../Supabase_Client.js'; 






// --- 1. CREATE CLASS (School Admin) ---
export const Create_Class_SA = async (req, res) => {
  // 1. Get My School ID (From Token)
  const My_School_Id = req.user.user_id;

  // 2. Get Input
  const { Session_Id, Class_Name } = req.body;

  if (!Session_Id || !Class_Name) {
    return res.status(400).json({ success: false, message: "Session_Id and Class_Name are required." });
  }

  try {
    const { data: New_Class, error: Db_Error } = await Supabase_Client
      .from('Class')
      .insert([
        { 
          school_id: My_School_Id, // Auto-filled
          session_id: Session_Id, 
          class_name: Class_Name 
        }
      ])
      .select()
      .single();

    if (Db_Error) {
      if (Db_Error.code === '23505') {
        return res.status(409).json({ success: false, message: "Class already exists in this session." });
      }
      throw Db_Error;
    }

    res.status(201).json({ success: true, message: "Class Created.", data: New_Class });

  } catch (Error) {
    console.error("Create Class SA Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};




// --- 2. READ MY CLASSES ---
export const Get_Classes_SA = async (req, res) => {
  const My_School_Id = req.user.user_id;
  const { Session_Id } = req.query; // 🔴 Mandatory now

  // 🔒 Validation: Session_Id is required
  if (!Session_Id) {
    return res.status(400).json({
      success: false,
      error: "Session_Id is required"
    });
  }

  try {
    const { data: My_Classes, error } = await Supabase_Client
      .from('Class')
      .select(`
        class_id, 
        class_name, 
        session_id,
        AcademicSession ( session_name )
      `)
      .eq('school_id', My_School_Id)   // Strict Filter
      .eq('session_id', Session_Id)    // ✅ Always applied
      .order('class_name', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      count: My_Classes.length,
      data: My_Classes
    });

  } catch (Error) {
    console.error("Fetch Classes SA Error:", Error.message);
    res.status(500).json({
      success: false,
      error: Error.message
    });
  }
};







// --- 3. EDIT MY CLASS ---
export const Edit_Class_SA = async (req, res) => {
  const My_School_Id = req.user.user_id;
  const { Class_Id, Class_Name } = req.body;

  if (!Class_Id || !Class_Name) {
    return res.status(400).json({ success: false, message: "Class_Id and Class_Name required." });
  }

  try {
    const { data: Updated, error } = await Supabase_Client
      .from('Class')
      .update({ class_name: Class_Name })
      .eq('class_id', Class_Id)
      .eq('school_id', My_School_Id) // SECURITY: Must belong to me
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return res.status(409).json({ success: false, message: "Name conflict." });
      // If not found (wrong school id)
      if (error.code === 'PGRST116') return res.status(404).json({ success: false, message: "Class not found." });
      throw error;
    }

    res.json({ success: true, message: "Class Updated.", data: Updated });

  } catch (Error) {
    console.error("Edit Class SA Error:", Error.message);
    res.status(500).json({ success: false, error: Error.message });
  }
};





// --- 4. DELETE MY CLASS ---
export const Delete_Class_SA = async (req, res) => {
  const My_School_Id = req.user.user_id;
  const { Class_Id } = req.body;

  // 🔴 Validation
  if (!Class_Id) {
    return res.status(400).json({
      success: false,
      message: "Class_Id is required."
    });
  }

  try {
    const { error, count } = await Supabase_Client
      .from('Class')
      .delete({ count: 'exact' })      // 👈 ensures we know if delete happened
      .eq('class_id', Class_Id)
      .eq('school_id', My_School_Id);  // 🔒 Ownership check

    if (error) throw error;

    // ❌ Not found OR not owned by this school
    if (count === 0) {
      return res.status(404).json({
        success: false,
        message: "Class not found or not owned by this school."
      });
    }

    // ✅ Successfully deleted
    res.json({
      success: true,
      message: "Class deleted successfully."
    });

  } catch (Error) {
    console.error("Delete Class SA Error:", Error.message);
    res.status(500).json({
      success: false,
      error: Error.message
    });
  }
};




