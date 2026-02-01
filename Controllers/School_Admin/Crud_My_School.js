import Supabase_Client from '../../Supabase_Client.js'; 





export const Get_My_School_Profile = async (req, res) => {
  // 1. Identify User from Token
  const School_Id = req.user.user_id; // Derived from 'Require_Auth'

  try {
    // 2. Fetch Data
    const { data: My_Details, error: Db_Error } = await Supabase_Client
      .from('School')
      .select('*')
      .eq('school_id', School_Id)
      .single();

    if (Db_Error || !My_Details) {
      return res.status(404).json({ success: false, message: "School profile not found." });
    }

    // 3. Success
    res.json({
      success: true,
      data: My_Details
    });

  } catch (Error) {
    console.error("Get Profile Error:", Error.message);
    res.status(500).json({ success: false, error: Error.message });
  }
};



















export const Update_My_School_Profile = async (req, res) => {
  // 1. Get Input (ONLY extract allowed fields)
  // We strictly ignore Email or Phone if they are sent
  const { School_Name, Tagline, Address } = req.body;
  
  // 2. Get My ID from Token
  const My_School_Id = req.user.user_id;

  try {
    // --- STEP 3: PREPARE UPDATE OBJECT ---
    const Updates = {};
    if (School_Name) Updates.school_name = School_Name;
    if (Tagline) Updates.tagline = Tagline;
    if (Address) Updates.address = Address;

    // Optimization: If no valid fields are sent, stop here
    if (Object.keys(Updates).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No valid fields provided. You can only update Name, Tagline, or Address." 
      });
    }

    // --- STEP 4: EXECUTE UPDATE ---
    const { data: Updated_School, error: Update_Error } = await Supabase_Client
      .from('School')
      .update(Updates)
      .eq('school_id', My_School_Id)
      .select()
      .single();

    if (Update_Error) throw Update_Error;

    // --- STEP 5: SUCCESS RESPONSE ---
    res.json({
      success: true,
      message: "Profile updated successfully.",
      data: Updated_School
    });

  } catch (Error) {
    console.error("Update School Error:", Error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server Error", 
      error: Error.message 
    });
  }
};