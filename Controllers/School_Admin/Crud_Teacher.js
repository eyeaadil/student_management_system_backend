import Supabase_Client from "../../Supabase_Client";







export const Create_Teacher_SA = async (req, res) => {
  const My_School_Id = req.user.user_id; // From Token
  const { Name, Phone, Email } = req.body;

  if (!Name || !Phone) {
    return res.status(400).json({ success: false, message: "Name and Phone are required." });
  }

  try {
    const { data: New_Teacher, error } = await Supabase_Client
      .from('Teacher')
      .insert([{
        school_id: My_School_Id, // Automatically assigned
        name: Name,
        phone: Phone,
        email: Email || null,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ 
          success: false, 
          message: "This Phone Number or Email already exists in the database. Please contact the Technical Team." 
        });
      }
      throw error;
    }

    res.status(201).json({ success: true, message: "Teacher created successfully.", data: New_Teacher });

  } catch (Error) {
    console.error("Create Teacher SA Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};













// --- 3. GET MY TEACHERS (SA) ---
export const Get_My_Teachers_SA = async (req, res) => {
  const My_School_Id = req.user.user_id; // From Token

  try {
    const { data: Teachers, error } = await Supabase_Client
      .from('Teacher')
      .select('*')
      .eq('school_id', My_School_Id)
      .order('name', { ascending: true });

    if (error) throw error;

    res.json({ success: true, count: Teachers.length, data: Teachers });

  } catch (Error) {
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};
















// --- 4. UPDATE MY TEACHER (SA) ---
export const Update_My_Teacher_SA = async (req, res) => {
  const My_School_Id = req.user.user_id;
  // REMOVED: Phone, Email from input extraction
  const { Teacher_Id, Name, Is_Active } = req.body;

  if (!Teacher_Id) return res.status(400).json({ success: false, message: "Teacher_Id is required." });

  try {
    // A. Check Current Data & OWNERSHIP
    const { data: Current, error: Fetch_Err } = await Supabase_Client
      .from('Teacher')
      .select('school_id') // We only need school_id to check ownership
      .eq('teacher_id', Teacher_Id)
      .single();

    if (Fetch_Err || !Current) return res.status(404).json({ success: false, message: "Teacher not found." });

    // SECURITY: Ensure Teacher belongs to MY school
    if (Current.school_id != My_School_Id) {
      return res.status(403).json({ success: false, message: "Access Denied: You cannot edit this teacher." });
    }

    // B. Prepare Updates (ONLY Name and Status)
    const Updates = {};
    if (Name !== undefined) Updates.name = Name;
    if (Is_Active !== undefined) Updates.is_active = Is_Active;

    // Optimization: If nothing to update, return early
    if (Object.keys(Updates).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields provided (Name or Is_Active)." });
    }

    // C. Update
    const { data: Updated_Teacher, error: Update_Err } = await Supabase_Client
      .from('Teacher')
      .update(Updates)
      .eq('teacher_id', Teacher_Id)
      .select()
      .single();

    if (Update_Err) throw Update_Err;

    res.json({ success: true, message: "Teacher details updated successfully.", data: Updated_Teacher });

  } catch (Error) {
    console.error("Update Teacher SA Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};