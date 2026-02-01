import Supabase_Client from '../../Supabase_Client.js';

export const Create_School = async (req, res) => {


  // 1. Get Input (Capitalized_Snake_Case variables)
  const { School_Name, Email, Phone, Tagline, Address } = req.body;


  
  // 2. Validate Required Fields
  if (!School_Name || !Email || !Phone) {
    return res.status(400).json({ 
      success: false, 
      message: "Missing required fields: School_Name, Email, and Phone." 
    });
  }

  try {
    // 3. Insert into Supabase (Mapping variables to lowercase DB columns)
    const { data: New_School_Data, error: Db_Error } = await Supabase_Client
      .from('School')
      .insert([
        { 
          school_name: School_Name, 
          email: Email, 
          phone: Phone,
          tagline: Tagline,
          address: Address
          // is_active defaults to true
          // firebase_id defaults to NULL
        }
      ])
      .select()
      .single();

    if (Db_Error) {
      // Check for Duplicate Email or Phone
      if (Db_Error.code === '23505') { 
        return res.status(409).json({ 
          success: false, 
          message: "A School with this Email or Phone already exists." 
        });
      }
      throw Db_Error;
    }

    // 4. Success Response
    res.status(201).json({
      success: true,
      message: "New School created successfully.",
      data: New_School_Data
    });

  } catch (Error) {
    console.error("Create School Error:", Error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server Error", 
      error: Error.message 
    });
  }
};




















export const Get_All_Schools = async (req, res) => {
  try {
    // 1. Fetch from DB
    const { data: School_List, error: Db_Error } = await Supabase_Client
      .from('School') // Exact Table Name
      .select('school_id, school_name, email, phone, is_active, address, tagline, created_at')
      .order('created_at', { ascending: false });

    if (Db_Error) throw Db_Error;

    // 2. Success Response
    res.json({
      success: true,
      count: School_List.length,
      data: School_List
    });

  } catch (Error) {
    console.error("Fetch Schools Error:", Error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server Error: Could not fetch school list.", 
      error: Error.message 
    });
  }
};














export const Edit_School = async (req, res) => {
  // 1. Get Input
  // School_Id is MANDATORY to identify which school to edit
  const { School_Id, School_Name, Email, Phone, Tagline, Address } = req.body;

  if (!School_Id) {
    return res.status(400).json({ success: false, message: "School_Id is required." });
  }

  try {
    // 2. PRE-CHECK: Duplicate Email/Phone (excluding the current school)
    if (Email || Phone) {
      const Conditions = [];
      if (Email) Conditions.push(`email.eq.${Email}`);
      if (Phone) Conditions.push(`phone.eq.${Phone}`);

      const { data: Conflicts, error: Check_Error } = await Supabase_Client
        .from('School')
        .select('school_id, email, phone')
        .or(Conditions.join(',')) // (email=X OR phone=Y)
        .neq('school_id', School_Id); // ... AND school_id != This_School_Id

      if (Check_Error) throw Check_Error;

      if (Conflicts && Conflicts.length > 0) {
        const Conflict = Conflicts[0];
        if (Conflict.email === Email) return res.status(409).json({ success: false, message: "Email already taken by another school." });
        if (Conflict.phone === Phone) return res.status(409).json({ success: false, message: "Phone already taken by another school." });
      }
    }

    // 3. Prepare Update Object
    const Updates = {};
    if (School_Name) Updates.school_name = School_Name;
    if (Email) Updates.email = Email;
    if (Phone) Updates.phone = Phone;
    if (Tagline) Updates.tagline = Tagline;
    if (Address) Updates.address = Address;
    
    // Safety: If Phone changes, reset firebase_id so they must re-verify
    if (Phone) {
        Updates.firebase_id = null;
    }

    // 4. Perform Update
    const { data: Updated_School, error: Update_Error } = await Supabase_Client
      .from('School')
      .update(Updates)
      .eq('school_id', School_Id)
      .select()
      .single();

    if (Update_Error) throw Update_Error;

    // 5. Success Response
    res.json({
      success: true,
      message: "School updated successfully.",
      data: Updated_School
    });

  } catch (Error) {
    console.error("Edit School Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};