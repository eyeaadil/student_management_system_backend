// Controllers/Student/Login_Student.js
import jwt from 'jsonwebtoken';
import Firebase_Admin from '../../Firebase_Admin.js';
import Supabase_Client from '../../Supabase_Client.js';

export const Student_Login = async (req, res) => {
    // Input: Firebase ID Token from phone authentication
    const { Firebase_Token } = req.body;

    try {
        // --- STEP 1: VERIFY FIREBASE TOKEN ---
        const Decoded_Token = await Firebase_Admin.auth().verifyIdToken(Firebase_Token);
        const Firebase_Id = Decoded_Token.uid;
        const Phone_Number = Decoded_Token.phone_number;

        console.log(`Student Login Attempt: ${Phone_Number}`);

        // --- STEP 2: FIND ALL STUDENTS WITH THIS PHONE ---
        const { data: Students, error: Db_Error } = await Supabase_Client
            .from('Student')
            .select(`
        student_id,
        school_id,
        student_name,
        parent_name,
        email,
        phone,
        is_active,
        firebase_id,
        School ( school_id, school_name )
      `)
            .eq('phone', Phone_Number)
            .order('student_name', { ascending: true });

        // Check if any students exist with this phone
        if (Db_Error || !Students || Students.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Access Denied. No student accounts registered with this phone number."
            });
        }

        // --- STEP 3: FILTER ACTIVE STUDENTS ONLY ---
        const Active_Students = Students.filter(student => student.is_active === true);

        if (Active_Students.length === 0) {
            return res.status(403).json({
                success: false,
                message: "All student accounts associated with this phone are deactivated. Please contact your school."
            });
        }

        // --- STEP 4: LINK FIREBASE ID (First Time Login for each student) ---
        // Update firebase_id for students who don't have it yet
        const Students_To_Update = Active_Students.filter(s => !s.firebase_id);

        if (Students_To_Update.length > 0) {
            const Student_Ids = Students_To_Update.map(s => s.student_id);

            await Supabase_Client
                .from('Student')
                .update({ firebase_id: Firebase_Id })
                .in('student_id', Student_Ids);

            console.log(`First login: Linked Firebase ID to ${Student_Ids.length} student(s).`);
        }

        // --- STEP 5: GENERATE TOKENS FOR EACH STUDENT ---
        // Generate a JWT token for each active student profile
        const Student_Profiles = Active_Students.map(student => {
            const Token = jwt.sign(
                {
                    user_id: student.student_id,
                    school_id: student.school_id,
                    role: 'Student',
                    firebase_id: Firebase_Id
                },
                process.env.JWT_SECRET,
                { expiresIn: '30d' } // Longer expiry for students (mobile app)
            );

            return {
                student_id: student.student_id,
                student_name: student.student_name,
                parent_name: student.parent_name,
                school_id: student.school_id,
                school_name: student.School?.school_name || 'Unknown School',
                email: student.email,
                token: Token
            };
        });

        // --- STEP 6: SUCCESS RESPONSE ---
        res.json({
            success: true,
            message: `Login successful. Found ${Student_Profiles.length} student profile(s).`,
            phone: Phone_Number,
            profile_count: Student_Profiles.length,
            profiles: Student_Profiles,

            // Helper flags for frontend
            has_multiple_profiles: Student_Profiles.length > 1,
            requires_profile_selection: Student_Profiles.length > 1
        });

    } catch (Error) {
        console.error("Student Login Error:", Error.message);
        res.status(401).json({
            success: false,
            message: "Invalid Token or Login Failed",
            error: Error.message
        });
    }
};
