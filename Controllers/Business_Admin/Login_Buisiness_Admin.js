import jwt from 'jsonwebtoken';
import Firebase_Admin from '../../Firebase_Admin.js'; 
import Supabase_Client from '../../Supabase_Client.js'; 






////////////////////     --------->>>> to help login the businessadmin   <<<<<------------           

/// businessadmin enters the no , ,get otp from firebase eters that , vaidatre , got hte encrypted firebase toeken that is pased here  Firebase_Token
export const Business_Admin_Login = async (req, res) => {


  const { Firebase_Token } = req.body; 

  try {


    // --- STEP 1: VERIFY GOOGLE TOKEN ---
    const Decoded_Token = await Firebase_Admin.auth().verifyIdToken( Firebase_Token   );
    const Firebase_Id = Decoded_Token.uid;
    const Phone_Number = Decoded_Token.phone_number; 



    console.log(`Verified User: ${Phone_Number}, FirebaseID: ${Firebase_Id}`);





    // --- STEP 2: CHECK SUPABASE (GATEKEEPER) ---
    const { data: User, error: Db_Error } = await Supabase_Client
      .from('BusinessAdmin')
      .select('*')
      .eq('phone', Phone_Number)
      .single();

    if (Db_Error || !User) {
      return res.status(403).json({ 
        success: false, 
        message: "Access Denied. Your phone number is not registered." 
      });
    }




    // --- STEP 3: SAVE FIREBASE ID (If missing) ---
    if (!User.firebase_id) {
      await Supabase_Client
        .from('BusinessAdmin')
        .update({ firebase_id: Firebase_Id })
        .eq('phone', Phone_Number);
        
      console.log("First login: Linked Firebase ID to user.");
    }




    // --- STEP 4: GENERATE YOUR JWT ---
    const My_System_Token = jwt.sign(
      { 
        user_id: User.business_admin_id, 
        role: 'Business_Admin',
        firebase_id: Firebase_Id 
      },
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );




    // --- STEP 5: SUCCESS RESPONSE ---
    res.json({
      success: true,
      message: "Login successful",
      token: My_System_Token,
      user: {
        id: User.business_admin_id,
        name: User.name,
        email: User.email
      }
    });




  } catch (Error) {
    console.error("Login Error:", Error.message);
    res.status(401).json({ 
      success: false, 
      message: "Invalid Token or Login Failed", 
      error: Error.message 
    });
  }
};








