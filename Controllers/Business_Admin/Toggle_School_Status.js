import Supabase_Client from '../../Supabase_Client.js'; 









/*
Input: Is_Suspending (Boolean: true / false)

If true: We are Suspending -> School is_active becomes false.

If false: We are Activating -> School is_active becomes true.



*/



export const Toggle_School_Status = async (req, res) => {
  // 1. Get Input (Boolean)
  const { School_Id, Is_Suspending, Reason } = req.body;
  
  // 2. Get Admin ID
  const Admin_Id = req.user ? req.user.user_id : null; 

  // 3. Validation
  // Note: We check specifically if Is_Suspending is a boolean, because (!false) would trigger an error otherwise.
  if (!School_Id || typeof Is_Suspending !== 'boolean' || !Reason) {
    return res.status(400).json({ 
      success: false, 
      message: "Missing fields: School_Id, Is_Suspending (bool), and Reason are required." 
    });
  }

  if (!Admin_Id) {
    return res.status(403).json({ 
      success: false, 
      message: "Unauthorized: Admin ID missing from token." 
    });
  }

  // 4. Derive Values based on the boolean
  // If Is_Suspending is TRUE -> New status is FALSE (Inactive) -> Action is 'SUSPEND'
  // If Is_Suspending is FALSE -> New status is TRUE (Active)   -> Action is 'ACTIVATE'
  const New_Is_Active = !Is_Suspending; 
  const Action_String = Is_Suspending ? 'SUSPEND' : 'ACTIVATE';

  try {
    // 5. Update School Table (Set is_active)
    const { data: Updated_School, error: Update_Error } = await Supabase_Client
      .from('School')
      .update({ is_active: New_Is_Active })
      .eq('school_id', School_Id)
      .select()
      .single();

    if (Update_Error) {
      throw new Error(`Failed to update School status: ${Update_Error.message}`);
    }

    // 6. Insert into Log Table
    const { error: Log_Error } = await Supabase_Client
      .from('School_Status_Log')
      .insert([
        {
          school_id: School_Id,
          action_type: Action_String, // 'SUSPEND' or 'ACTIVATE' (Calculated from bool)
          reason: Reason,
          changed_by: Admin_Id
        }
      ]);

    if (Log_Error) {
      console.error("CRITICAL: Log insert failed!", Log_Error);
      return res.status(500).json({ 
        success: false, 
        message: "School updated, but Log failed.",
        error: Log_Error.message
      });
    }

    // 7. Success Response
    res.json({
      success: true,
      message: `School successfully ${Is_Suspending ? 'Suspended' : 'Activated'}.`,
      data: {
        school_id: School_Id,
        school_name: Updated_School.school_name,
        new_status: New_Is_Active ? 'Active' : 'Suspended',
        reason: Reason
      }
    });

  } catch (Error) {
    console.error("Toggle Status Error:", Error.message);
    res.status(500).json({ 
      success: false, 
      message: "Server Error", 
      error: Error.message 
    });
  }
};