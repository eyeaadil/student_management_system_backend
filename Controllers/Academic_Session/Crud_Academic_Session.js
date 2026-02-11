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

    // Find the currently active session
    const Active_Session = List.find(s => s.is_active) || null;

    res.json({
      success: true,
      count: List.length,
      active_session: Active_Session,
      data: List
    });

  } catch (Error) {
    res.status(500).json({ success: false, error: Error.message });
  }
};



// --- GET CURRENTLY ACTIVE SESSION ---
export const Get_Active_Session = async (req, res) => {
  try {
    const { data: Active, error } = await Supabase_Client
      .from('AcademicSession')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;

    if (!Active) {
      return res.json({
        success: true,
        message: "No active session found.",
        data: null
      });
    }

    res.json({ success: true, data: Active });

  } catch (Error) {
    res.status(500).json({ success: false, error: Error.message });
  }
};


















export const Activate_Session = async (req, res) => {
  const { Session_Id } = req.body;

  if (!Session_Id) return res.status(400).json({ success: false, message: "Session_Id required." });

  try {
    // 1. Verify the target session exists
    const { data: Target_Session, error: Check_Err } = await Supabase_Client
      .from('AcademicSession')
      .select('session_id, session_name, is_active')
      .eq('session_id', Session_Id)
      .single();

    if (Check_Err || !Target_Session) {
      return res.status(404).json({ success: false, message: "Session not found." });
    }

    // If already active, no action needed
    if (Target_Session.is_active) {
      return res.json({
        success: true,
        message: "Session is already active.",
        data: Target_Session
      });
    }

    // 2. Deactivate ALL currently active sessions (enforce single active session rule)
    const { error: Deactivate_Error } = await Supabase_Client
      .from('AcademicSession')
      .update({ is_active: false })
      .eq('is_active', true);

    if (Deactivate_Error) throw Deactivate_Error;

    // 3. Activate the target session
    const { data: Updated, error: Update_Error } = await Supabase_Client
      .from('AcademicSession')
      .update({ is_active: true })
      .eq('session_id', Session_Id)
      .select()
      .single();

    if (Update_Error) throw Update_Error;

    res.json({
      success: true,
      message: `Session '${Updated.session_name}' is now the active session.`,
      data: Updated
    });

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