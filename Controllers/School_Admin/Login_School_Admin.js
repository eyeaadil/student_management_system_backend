// Controllers/School/LoginSchoolAdmin.js
import jwt from 'jsonwebtoken';
import Firebase_Admin from '../../Firebase_Admin.js'; 
import Supabase_Client from '../../Supabase_Client.js'; 

export const School_Admin_Login = async (req, res) => {
  // Input: Expecting the Firebase ID Token
  const { Firebase_Token } = req.body; 

  try {
    // --- STEP 1: VERIFY GOOGLE TOKEN ---
    const Decoded_Token = await Firebase_Admin.auth().verifyIdToken( Firebase_Token  );
    const Firebase_Id = Decoded_Token.uid;
    const Phone_Number = Decoded_Token.phone_number; 

    console.log(`School Login Attempt: ${Phone_Number}`);

    // --- STEP 2: CHECK SCHOOL TABLE ---
    const { data: School_Data, error: Db_Error } = await Supabase_Client
      .from('School')
      .select('*')
      .eq('phone', Phone_Number)
      .single();

    // Check if school exists
    if (Db_Error || !School_Data) {
      return res.status(403).json({ 
        success: false, 
        message: "Access Denied. No School registered with this phone number." 
      });
    }

    // Optional: Check if the school is active
    if (School_Data.is_active === false) {
      return res.status(403).json({ 
        success: false, 
        message: "Login Failed. Your School account is deactivated. Please contact Technical team." 
      });
    }

    // --- STEP 3: LINK FIREBASE ID (First Time Login) ---
    if (!School_Data.firebase_id) {
      await Supabase_Client
        .from('School')
        .update({ firebase_id: Firebase_Id })
        .eq('phone', Phone_Number);
        
      console.log("First login: Linked Firebase ID to School.");
    }


    
    // --- STEP 4: GENERATE JWT ---
    // Role is set to 'School_Admin'
    const My_System_Token = jwt.sign(
      { 
        user_id: School_Data.school_id, // Using School ID as User ID
        role: 'School_Admin', 
        firebase_id: Firebase_Id 
      },
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // --- STEP 5: SUCCESS RESPONSE ---
    res.json({
      success: true,
      message: "School Admin Login successful",
      token: My_System_Token,
      user: {
        id: School_Data.school_id,
        name: School_Data.school_name,
        email: School_Data.email,
        role: 'School_Admin'
      }
    });

  } catch (Error) {
    console.error("School Login Error:", Error.message);
    res.status(401).json({ 
      success: false, 
      message: "Invalid Token or Login Failed", 
      error: Error.message 
    });
  }
};