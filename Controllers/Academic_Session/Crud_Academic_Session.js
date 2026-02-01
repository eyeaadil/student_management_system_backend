import Supabase_Client from '../../Supabase_Client.js';




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

















export const Get_All_Sessions = async (req, res) => {
  try {
    const { data: List, error } = await Supabase_Client
      .from('AcademicSession')
      .select('*')
      .order('start_date', { ascending: false }); // Latest sessions first

    if (error) throw error;

    res.json({ success: true, count: List.length, data: List });

  } catch (Error) {
    res.status(500).json({ success: false, error: Error.message });
  }
};

















export const Activate_Session = async (req, res) => {
  const { Session_Id } = req.body;

  if (!Session_Id) return res.status(400).json({ success: false, message: "Session_Id required." });

  try {
    // 1. PRE-CHECK: Is there already an active session?
    const { data: Active_Sessions, error: Check_Error } = await Supabase_Client
      .from('AcademicSession')
      .select('session_id, session_name')
      .eq('is_active', true);

    if (Check_Error) throw Check_Error;

    // If any active session exists (and it's not the one we are trying to activate)
    if (Active_Sessions.length > 0) {
      const Current_Active = Active_Sessions[0];
      // Only block if the active one is DIFFERENT from the one we want to activate
      if (Current_Active.session_id != Session_Id) {
        return res.status(409).json({ 
          success: false, 
          message: `Cannot activate. '${Current_Active.session_name}' is currently active. Please deactivate it first.` 
        });
      }
    }

    // 2. ACTIVATE the target session
    const { data: Updated, error: Update_Error } = await Supabase_Client
      .from('AcademicSession')
      .update({ is_active: true })
      .eq('session_id', Session_Id)
      .select()
      .single();

    if (Update_Error) throw Update_Error;

    res.json({ success: true, message: "Session Activated successfully.", data: Updated });

  } catch (Error) {
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};













export const Deactivate_Session = async (req, res) => {
  const { Session_Id } = req.body;

  try {
    const { data: Updated, error } = await Supabase_Client
      .from('AcademicSession')
      .update({ is_active: false })
      .eq('session_id', Session_Id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, message: "Session Deactivated.", data: Updated });

  } catch (Error) {
    res.status(500).json({ success: false, error: Error.message });
  }
};















export const Delete_Session = async (req, res) => {
  const { Session_Id } = req.body;

  try {
    const { error } = await Supabase_Client
      .from('AcademicSession')
      .delete()
      .eq('session_id', Session_Id);

    if (error) throw error;

    res.json({ success: true, message: "Session Deleted successfully." });

  } catch (Error) {
    res.status(500).json({ success: false, error: Error.message });
  }
};