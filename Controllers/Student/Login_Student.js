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
        // Now joins with Student_School_Enrollment to get school info
        const { data: Students, error: Db_Error } = await Supabase_Client
            .from('Student')
            .select(`
                student_id,
                student_name,
                parent_name,
                email,
                phone,
                is_active,
                firebase_id,
                Student_School_Enrollment (
                    enrollment_id,
                    school_id,
                    is_active,
                    enrolled_at,
                    School ( school_id, school_name )
                )
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

        // --- STEP 3: FILTER ACTIVE STUDENTS WITH ACTIVE ENROLLMENTS ---
        // Student must be active AND have at least one active school enrollment
        const Active_Students_With_Enrollments = Students
            .filter(student => student.is_active === true)
            .map(student => {
                // Get only active enrollments
                const Active_Enrollments = student.Student_School_Enrollment
                    .filter(e => e.is_active === true);
                return {
                    ...student,
                    Active_Enrollments
                };
            })
            .filter(student => student.Active_Enrollments.length > 0);

        if (Active_Students_With_Enrollments.length === 0) {
            return res.status(403).json({
                success: false,
                message: "All student accounts associated with this phone are deactivated or not enrolled in any school. Please contact your school."
            });
        }

        // --- STEP 4: LINK FIREBASE ID (First Time Login for each student) ---
        const Students_To_Update = Active_Students_With_Enrollments.filter(s => !s.firebase_id);

        if (Students_To_Update.length > 0) {
            const Student_Ids = Students_To_Update.map(s => s.student_id);

            await Supabase_Client
                .from('Student')
                .update({ firebase_id: Firebase_Id })
                .in('student_id', Student_Ids);

            console.log(`First login: Linked Firebase ID to ${Student_Ids.length} student(s).`);
        }

        // --- STEP 5: GENERATE TOKENS FOR EACH STUDENT PROFILE ---
        // Each student can only have ONE active school enrollment
        // Multiple profiles = multiple students sharing same phone (siblings)
        const Student_Profiles = [];

        for (const student of Active_Students_With_Enrollments) {
            for (const enrollment of student.Active_Enrollments) {
                const Token = jwt.sign(
                    {
                        user_id: student.student_id,
                        school_id: enrollment.school_id,
                        enrollment_id: enrollment.enrollment_id,
                        role: 'Student',
                        firebase_id: Firebase_Id
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: '30d' } // Longer expiry for students (mobile app)
                );

                Student_Profiles.push({
                    student_id: student.student_id,
                    student_name: student.student_name,
                    parent_name: student.parent_name,
                    email: student.email,
                    // School-specific info from enrollment
                    school_id: enrollment.school_id,
                    school_name: enrollment.School?.school_name || 'Unknown School',
                    enrollment_id: enrollment.enrollment_id,
                    enrolled_at: enrollment.enrolled_at,
                    token: Token
                });
            }
        }

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
