import Supabase_Client from '../../Supabase_Client.js'; 




// --- A. BUSINESS ADMIN (Creates Teacher for ANY School) ---
export const Create_Teacher_BA = async (req, res) => {
  const { School_Id, Name, Phone, Email } = req.body;

  if (!School_Id || !Name || !Phone) {
    return res.status(400).json({ success: false, message: "School_Id, Name, and Phone are required." });
  }

  try {
    const { data: New_Teacher, error } = await Supabase_Client
      .from('Teacher')
      .insert([{
        school_id: School_Id,
        name: Name,
        phone: Phone,
        email: Email || null,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique Constraint Violation
        return res.status(409).json({ 
          success: false, 
          message: "This Phone Number or Email already exists in the database. Please contact the Technical Team." 
        });
      }
      throw error;
    }

    res.status(201).json({ success: true, message: "Teacher created successfully.", data: New_Teacher });

  } catch (Error) {
    console.error("Create Teacher BA Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};
























// --- 1. GET ALL TEACHERS OF A SCHOOL (BA) ---
export const Get_Teachers_BA = async (req, res) => {
  const { School_Id } = req.query;

  if (!School_Id) return res.status(400).json({ success: false, message: "School_Id is required." });

  try {
    const { data: Teachers, error } = await Supabase_Client
      .from('Teacher')
      .select('*')
      .eq('school_id', School_Id)
      .order('name', { ascending: true });

    if (error) throw error;

    res.json({ success: true, count: Teachers.length, data: Teachers });

  } catch (Error) {
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};









// --- 2. UPDATE TEACHER (BA) ---
export const Update_Teacher_BA = async (req, res) => {
  const { Teacher_Id, Name, Phone, Email, Is_Active } = req.body;

  if (!Teacher_Id) return res.status(400).json({ success: false, message: "Teacher_Id is required." });

  try {
    // A. Check Current Data (To detect Phone Change)
    const { data: Current, error: Fetch_Err } = await Supabase_Client
      .from('Teacher')
      .select('phone')
      .eq('teacher_id', Teacher_Id)
      .single();

    if (Fetch_Err || !Current) return res.status(404).json({ success: false, message: "Teacher not found." });

    // B. Prepare Update Object
    const Updates = {};
    if (Name !== undefined) Updates.name = Name;
    if (Email !== undefined) Updates.email = Email;
    if (Is_Active !== undefined) Updates.is_active = Is_Active;

    // C. Handle Phone Change Logic
    if (Phone && Phone !== Current.phone) {
      Updates.phone = Phone;
      Updates.firebase_id = null; // Security: Force Logout
    }

    // D. Perform Update
    const { data: Updated_Teacher, error: Update_Err } = await Supabase_Client
      .from('Teacher')
      .update(Updates)
      .eq('teacher_id', Teacher_Id)
      .select()
      .single();

    if (Update_Err) {
      if (Update_Err.code === '23505') {
        return res.status(409).json({ success: false, message: "Phone or Email already in use. Contact Technical Team." });
      }
      throw Update_Err;
    }

    res.json({ success: true, message: "Teacher updated successfully.", data: Updated_Teacher });

  } catch (Error) {
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};