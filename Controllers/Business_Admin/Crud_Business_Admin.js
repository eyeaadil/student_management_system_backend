import Supabase_Client from '../../Supabase_Client.js';




////////////////////////////////////////////////////////////////    this will be used to create a new admin by another admin --> admin means business admin 
/*
Name , Email  , Phone as input all threee 
*/

export const Create_Academic_Session = async (req, res) => {
  const { Session_Name, Start_Date, End_Date } = req.body;

  if (!Session_Name || !Start_Date || !End_Date) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  try {
    const { data: New_Session, error: Db_Error } = await Supabase_Client
      .from('AcademicSession')
      .insert([
        { 
          session_name: Session_Name, 
          start_date: Start_Date, 
          end_date: End_Date
          // is_active defaults to false in DB
        }
      ])
      .select()
      .single();

    if (Db_Error) {
      if (Db_Error.code === '23505') return res.status(409).json({ success: false, message: "Session Name already exists." });
      throw Db_Error;
    }

    res.status(201).json({ success: true, message: "Session Created (Inactive by default)", data: New_Session });

  } catch (Error) {
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};



export const Create_Business_Admin = async (req, res) => {


  // 1. Get Input
  const { Name, Email, Phone } = req.body;




  // 2. Simple Validation
  if (!Name || !Email || !Phone) {
    return res.status(400).json({ 
      success: false, 
      message: "Missing required fields: Name, Email, and Phone are required." 
    });
  }



  try {



    // 3. Insert into Supabase
    const { data: New_Admin_Data, error: Db_Error } = await Supabase_Client
      .from('BusinessAdmin')
      .insert([
        { 
          name: Name, 
          email: Email, 
          phone: Phone 
        }
      ])
      .select()
      .single();

    if (Db_Error) {
      if (Db_Error.code === '23505') { 
        return res.status(409).json({ 
          success: false, 
          message: "A user with this email or phone already exists." 
        });
      }
      throw Db_Error;
    }




    // 4. Success Response
    res.status(201).json({
      success: true,
      message: "New Business Admin created successfully.",
      data: New_Admin_Data
    });



    
  } catch (Error) {
    console.error("Create Admin Error:", Error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server Error", 
      error: Error.message 
    });
  }
};





















export const Get_All_Business_Admins = async (req, res) => {
  try {
    // 1. Fetch from DB
    // MATCHING SQL: Table is 'BusinessAdmin' (Case Sensitive)
    // REMOVED: 'is_active' (It is not in your table definition)
    const { data: Admin_List, error: Db_Error } = await Supabase_Client
      .from('BusinessAdmin')
      .select('business_admin_id, name, email, phone, created_at') 
      .order('created_at', { ascending: false });

    if (Db_Error) throw Db_Error;

    // 2. Success Response
    res.json({
      success: true,
      count: Admin_List.length,
      data: Admin_List
    });

  } catch (Error) {
    console.error("Fetch Admins Error:", Error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server Error: Could not fetch admin list.", 
      error: Error.message 
    });
  }
};












export const Update_Business_Admin_Profile = async (req, res) => {
  // 1. Get Input
  const { Name, Email, Phone } = req.body;
  
  // 2. Get User ID from Token
  const Current_User_Id = req.user ? req.user.user_id : null;

  if (!Current_User_Id) {
    return res.status(403).json({ success: false, message: "Unauthorized." });
  }

  try {
    // --- STEP 3: CHECK FOR DUPLICATES (Before Updating) ---
    // We only check if Email or Phone is being provided
    if (Email || Phone) {
      const Conditions = [];
      if (Email) Conditions.push(`email.eq.${Email}`);
      if (Phone) Conditions.push(`phone.eq.${Phone}`);
      
      // Query: Find users with this Email OR Phone, BUT exclude the current user
      const { data: Existing_Conflicts, error: Check_Error } = await Supabase_Client
        .from('BusinessAdmin')
        .select('business_admin_id, email, phone')
        .or(Conditions.join(',')) // Checks (email = X OR phone = Y)
        .neq('business_admin_id', Current_User_Id); // ... AND id != Current_User_Id

      if (Check_Error) throw Check_Error;

      // If we found someone else with these details
      if (Existing_Conflicts && Existing_Conflicts.length > 0) {
        const Conflict = Existing_Conflicts[0];
        
        if (Conflict.email === Email) {
          return res.status(409).json({ success: false, message: "This Email is already in use by another admin." });
        }
        if (Conflict.phone === Phone) {
          return res.status(409).json({ success: false, message: "This Phone number is already in use by another admin." });
        }
      }
    }

    // 4. Fetch Current Details (To compare Phone number for logout logic)
    const { data: Current_User, error: Fetch_Error } = await Supabase_Client
      .from('BusinessAdmin')
      .select('phone')
      .eq('business_admin_id', Current_User_Id)
      .single();

    if (Fetch_Error || !Current_User) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // 5. Check if Phone is changing
    // We normalize to String to ensure accurate comparison
    const Is_Phone_Changing = Phone && (String(Phone) !== String(Current_User.phone));
    
    // 6. Prepare Update Object
    const Updates = {};
    if (Name) Updates.name = Name;
    if (Email) Updates.email = Email;
    if (Phone) Updates.phone = Phone;
    
    // Safety: Unlink Firebase ID if phone changes
    if (Is_Phone_Changing) {
      Updates.firebase_id = null; 
    }

    // 7. Perform Update
    const { data: Updated_Data, error: Update_Error } = await Supabase_Client
      .from('BusinessAdmin')
      .update(Updates)
      .eq('business_admin_id', Current_User_Id)
      .select()
      .single();

    if (Update_Error) throw Update_Error;

    // 8. Response Logic
    if (Is_Phone_Changing) {
      return res.json({
        success: true,
        message: "Profile updated. Phone number changed, please login again.",
        logout_required: true, 
        data: null 
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully.",
      logout_required: false,
      data: Updated_Data
    });

  } catch (Error) {
    console.error("Update Profile Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};