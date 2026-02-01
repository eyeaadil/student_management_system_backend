import Supabase_Client from '../../Supabase_Client.js'; 









// --- 1. LINK (ENROLL) STUDENT ---
export const Link_Student_To_Class_BA = async (req, res) => {
  const { Student_Id, Class_Id, Roll_No } = req.body;

  if (!Student_Id || !Class_Id) {
    return res.status(400).json({ success: false, message: "Student_Id and Class_Id are required." });
  }

  try {
    // Attempt Insert
    const { data: Enrollment, error: Db_Error } = await Supabase_Client
      .from('Student_Class_Enrollment_Relation')
      .insert([
        { 
          student_id: Student_Id, 
          class_id: Class_Id, 
          roll_no: Roll_No || null // Roll No is optional
        }
      ])
      .select()
      .single();

    if (Db_Error) {
      // Handle Unique Conflicts
      if (Db_Error.code === '23505') {
        // We need to check WHICH constraint failed
        if (Db_Error.details.includes('student_id')) {
          return res.status(409).json({ success: false, message: "This Student is already enrolled in a class." });
        }
        if (Db_Error.details.includes('roll_no')) {
          return res.status(409).json({ success: false, message: "This Roll Number is already taken in this class." });
        }
      }
      throw Db_Error;
    }

    res.status(201).json({ success: true, message: "Student Enrolled Successfully.", data: Enrollment });

  } catch (Error) {
    console.error("Enrollment Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};





export const Unlink_Student_BA = async (req, res) => {
  // Input is now the Primary Key of the relation table
  const { Enrollment_Id } = req.body;

  if (!Enrollment_Id) {
    return res.status(400).json({ success: false, message: "Enrollment_Id is required." });
  }

  try {
    const { error } = await Supabase_Client
      .from('Student_Class_Enrollment_Relation')
      .delete()
      .eq('enrollment_id', Enrollment_Id);

    if (error) throw error;

    res.json({ success: true, message: "Student unlinked successfully." });

  } catch (Error) {
    console.error("Unlink BA Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};















export const Get_Class_Students_BA = async (req, res) => {
  // 1. Get Class_Id from Query Params (e.g., ?Class_Id=5)
  const { Class_Id } = req.query;

  if (!Class_Id) {
    return res.status(400).json({ success: false, message: "Class_Id is required." });
  }

  try {
    // 2. Fetch Enrollment + Student Details
    const { data: List, error } = await Supabase_Client
      .from('Student_Class_Enrollment_Relation')
      .select(`
        enrollment_id,
        roll_no,
        created_at,
        Student ( 
          student_id, 
          student_name, 
          parent_name, 
          phone, 
          email,
          firebase_id,
          is_active
        )
      `)
      .eq('class_id', Class_Id)
      .order('roll_no', { ascending: true }); // Ordered by Roll No (1, 2, 3...)

    if (error) throw error;

    // 3. Flatten the Data for easier Frontend use
    const Formatted_List = List.map(Item => ({
      enrollment_id: Item.enrollment_id,
      roll_no: Item.roll_no, // Can be null if not assigned
      student_id: Item.Student.student_id,
      student_name: Item.Student.student_name,
      parent_name: Item.Student.parent_name,
      phone: Item.Student.phone,
      email: Item.Student.email,
      is_active: Item.Student.is_active,
      firebase_status: Item.Student.firebase_id ? "Linked" : "Not Linked" // Helpful flag
    }));

    // 4. Send Response
    res.json({
      success: true,
      class_id: Class_Id,
      count: Formatted_List.length,
      data: Formatted_List
    });

  } catch (Error) {
    console.error("Fetch Class Students Error:", Error.message);
    res.status(500).json({ success: false, message: "Server Error", error: Error.message });
  }
};