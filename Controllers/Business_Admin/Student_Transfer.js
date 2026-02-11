import Supabase_Client from '../../Supabase_Client.js';


/**
 * Transfer a student from their current school to a new school.
 * This will:
 * 1. Mark the old school enrollment as inactive
 * 2. Remove class enrollments from the old school
 * 3. Create a new active enrollment at the new school
 */
export const Transfer_Student_BA = async (req, res) => {
    const { Student_Id, New_School_Id, Leaving_Reason } = req.body;

    // 1. Validate Required Fields
    if (!Student_Id || !New_School_Id) {
        return res.status(400).json({
            success: false,
            message: "Student_Id and New_School_Id are required."
        });
    }

    try {
        // 2. Verify student exists
        const { data: Student, error: Student_Error } = await Supabase_Client
            .from('Student')
            .select('student_id, student_name')
            .eq('student_id', Student_Id)
            .single();

        if (Student_Error || !Student) {
            return res.status(404).json({ success: false, message: "Student not found." });
        }

        // 3. Verify new school exists
        const { data: New_School, error: School_Error } = await Supabase_Client
            .from('School')
            .select('school_id, school_name')
            .eq('school_id', New_School_Id)
            .single();

        if (School_Error || !New_School) {
            return res.status(404).json({ success: false, message: "Target school not found." });
        }

        // 4. Get current active enrollment
        const { data: Current_Enrollment, error: Enroll_Error } = await Supabase_Client
            .from('Student_School_Enrollment')
            .select(`
        enrollment_id,
        school_id,
        School ( school_name )
      `)
            .eq('student_id', Student_Id)
            .eq('is_active', true)
            .single();

        if (Enroll_Error || !Current_Enrollment) {
            return res.status(400).json({
                success: false,
                message: "Student has no active school enrollment to transfer from."
            });
        }

        // 5. Prevent transfer to same school
        if (Current_Enrollment.school_id == New_School_Id) {
            return res.status(400).json({
                success: false,
                message: "Student is already enrolled at this school."
            });
        }

        const Old_School_Id = Current_Enrollment.school_id;
        const Old_School_Name = Current_Enrollment.School?.school_name || "Unknown";

        // 6. Get classes from old school to remove enrollments
        const { data: Old_Classes } = await Supabase_Client
            .from('Class')
            .select('class_id')
            .eq('school_id', Old_School_Id);

        const Old_Class_Ids = Old_Classes?.map(c => c.class_id) || [];

        // --- BEGIN TRANSFER TRANSACTION ---

        // 7. Mark old school enrollment as inactive
        const { error: Deactivate_Error } = await Supabase_Client
            .from('Student_School_Enrollment')
            .update({
                is_active: false,
                left_school_at: new Date().toISOString(),
                leaving_reason: Leaving_Reason || 'Transferred to another school'
            })
            .eq('enrollment_id', Current_Enrollment.enrollment_id);

        if (Deactivate_Error) throw Deactivate_Error;

        // 8. Remove class enrollments from old school
        if (Old_Class_Ids.length > 0) {
            const { error: Unlink_Error } = await Supabase_Client
                .from('Student_Class_Enrollment_Relation')
                .delete()
                .eq('student_id', Student_Id)
                .in('class_id', Old_Class_Ids);

            if (Unlink_Error) {
                console.warn("Warning: Could not remove old class enrollments:", Unlink_Error.message);
                // Continue with transfer - this is not critical
            }
        }

        // 9. Create new school enrollment
        const { data: New_Enrollment, error: Create_Error } = await Supabase_Client
            .from('Student_School_Enrollment')
            .insert([{
                student_id: Student_Id,
                school_id: New_School_Id,
                is_active: true
            }])
            .select()
            .single();

        if (Create_Error) {
            // Rollback: Reactivate old enrollment
            await Supabase_Client
                .from('Student_School_Enrollment')
                .update({ is_active: true, left_school_at: null, leaving_reason: null })
                .eq('enrollment_id', Current_Enrollment.enrollment_id);
            throw Create_Error;
        }

        // 10. Success Response
        res.json({
            success: true,
            message: `${Student.student_name} transferred successfully.`,
            transfer_details: {
                student_id: Student_Id,
                student_name: Student.student_name,
                from_school: {
                    school_id: Old_School_Id,
                    school_name: Old_School_Name
                },
                to_school: {
                    school_id: New_School_Id,
                    school_name: New_School.school_name
                },
                new_enrollment_id: New_Enrollment.enrollment_id,
                transferred_at: new Date().toISOString()
            }
        });

    } catch (Error) {
        console.error("Transfer Student Error:", Error.message);
        res.status(500).json({ success: false, message: "Server Error", error: Error.message });
    }
};




/**
 * Get the complete enrollment history for a student across all schools.
 */
export const Get_Student_Enrollment_History_BA = async (req, res) => {
    const Student_Id = req.query.Student_Id || req.body.Student_Id;

    if (!Student_Id) {
        return res.status(400).json({
            success: false,
            message: "Student_Id is required."
        });
    }

    try {
        // 1. Verify student exists and get basic info
        const { data: Student, error: Student_Error } = await Supabase_Client
            .from('Student')
            .select('student_id, student_name, parent_name, phone')
            .eq('student_id', Student_Id)
            .single();

        if (Student_Error || !Student) {
            return res.status(404).json({ success: false, message: "Student not found." });
        }

        // 2. Get all enrollments
        const { data: Enrollments, error: Enroll_Error } = await Supabase_Client
            .from('Student_School_Enrollment')
            .select(`
        enrollment_id,
        school_id,
        is_active,
        enrolled_at,
        left_school_at,
        leaving_reason,
        School ( school_id, school_name )
      `)
            .eq('student_id', Student_Id)
            .order('enrolled_at', { ascending: false });

        if (Enroll_Error) throw Enroll_Error;

        // 3. Format response
        const History = Enrollments.map(e => ({
            enrollment_id: e.enrollment_id,
            school_id: e.school_id,
            school_name: e.School?.school_name || "Unknown",
            is_active: e.is_active,
            enrolled_at: e.enrolled_at,
            left_school_at: e.left_school_at,
            leaving_reason: e.leaving_reason,
            // Calculate duration if left
            duration_days: e.left_school_at
                ? Math.floor((new Date(e.left_school_at) - new Date(e.enrolled_at)) / (1000 * 60 * 60 * 24))
                : null
        }));

        res.json({
            success: true,
            student: {
                student_id: Student.student_id,
                student_name: Student.student_name,
                parent_name: Student.parent_name,
                phone: Student.phone
            },
            total_schools: History.length,
            current_school: History.find(h => h.is_active) || null,
            enrollment_history: History
        });

    } catch (Error) {
        console.error("Get Enrollment History Error:", Error.message);
        res.status(500).json({ success: false, message: "Server Error", error: Error.message });
    }
};




/**
 * Get all currently enrolled students for a specific school.
 * Uses the enrollment table instead of direct school_id on Student.
 */
export const Get_School_Students_BA = async (req, res) => {
    const School_Id = req.query.School_Id || req.body.School_Id;
    const Include_Inactive = req.query.Include_Inactive === 'true';

    if (!School_Id) {
        return res.status(400).json({
            success: false,
            message: "School_Id is required."
        });
    }

    try {
        // 1. Build query
        let query = Supabase_Client
            .from('Student_School_Enrollment')
            .select(`
        enrollment_id,
        is_active,
        enrolled_at,
        left_school_at,
        leaving_reason,
        Student (
          student_id,
          student_name,
          parent_name,
          phone,
          email,
          is_active,
          created_at
        )
      `)
            .eq('school_id', School_Id)
            .order('enrolled_at', { ascending: false });

        // Filter by active enrollments unless Include_Inactive is true
        if (!Include_Inactive) {
            query = query.eq('is_active', true);
        }

        const { data: Enrollments, error: Db_Error } = await query;

        if (Db_Error) throw Db_Error;

        // 2. Flatten data for easier consumption
        const Students = Enrollments.map(e => ({
            // Enrollment info
            enrollment_id: e.enrollment_id,
            enrollment_is_active: e.is_active,
            enrolled_at: e.enrolled_at,
            left_school_at: e.left_school_at,
            leaving_reason: e.leaving_reason,
            // Student info
            student_id: e.Student.student_id,
            student_name: e.Student.student_name,
            parent_name: e.Student.parent_name,
            phone: e.Student.phone,
            email: e.Student.email,
            student_is_active: e.Student.is_active,
            created_at: e.Student.created_at
        }));

        res.json({
            success: true,
            school_id: School_Id,
            include_inactive: Include_Inactive,
            count: Students.length,
            data: Students
        });

    } catch (Error) {
        console.error("Get School Students Error:", Error.message);
        res.status(500).json({ success: false, message: "Server Error", error: Error.message });
    }
};




/**
 * Enroll an existing student in a school.
 * NOTE: Only ONE active enrollment allowed per student.
 * If student has an active enrollment elsewhere, it will be deactivated first.
 */
export const Enroll_Student_In_School_BA = async (req, res) => {
    const { Student_Id, School_Id, Leaving_Reason } = req.body;

    if (!Student_Id || !School_Id) {
        return res.status(400).json({
            success: false,
            message: "Student_Id and School_Id are required."
        });
    }

    try {
        // 1. Verify student exists
        const { data: Student, error: Student_Error } = await Supabase_Client
            .from('Student')
            .select('student_id, student_name')
            .eq('student_id', Student_Id)
            .single();

        if (Student_Error || !Student) {
            return res.status(404).json({ success: false, message: "Student not found." });
        }

        // 2. Verify school exists
        const { data: School, error: School_Error } = await Supabase_Client
            .from('School')
            .select('school_id, school_name')
            .eq('school_id', School_Id)
            .single();

        if (School_Error || !School) {
            return res.status(404).json({ success: false, message: "School not found." });
        }

        // 3. Check if already enrolled at this specific school
        const { data: Same_School_Enrollment } = await Supabase_Client
            .from('Student_School_Enrollment')
            .select('enrollment_id, is_active')
            .eq('student_id', Student_Id)
            .eq('school_id', School_Id)
            .eq('is_active', true)
            .maybeSingle();

        if (Same_School_Enrollment) {
            return res.status(409).json({
                success: false,
                message: "Student is already enrolled at this school."
            });
        }

        // 4. Check if student has ANY active enrollment (at another school)
        const { data: Current_Active_Enrollment } = await Supabase_Client
            .from('Student_School_Enrollment')
            .select(`
                enrollment_id,
                school_id,
                School ( school_name )
            `)
            .eq('student_id', Student_Id)
            .eq('is_active', true)
            .maybeSingle();

        let Deactivated_Old = false;
        let Old_School_Name = null;

        // 5. If student has active enrollment elsewhere, deactivate it first
        if (Current_Active_Enrollment) {
            Old_School_Name = Current_Active_Enrollment.School?.school_name || "Unknown";

            // Get classes from old school to remove enrollments
            const { data: Old_Classes } = await Supabase_Client
                .from('Class')
                .select('class_id')
                .eq('school_id', Current_Active_Enrollment.school_id);

            const Old_Class_Ids = Old_Classes?.map(c => c.class_id) || [];

            // Deactivate old enrollment
            const { error: Deactivate_Error } = await Supabase_Client
                .from('Student_School_Enrollment')
                .update({
                    is_active: false,
                    left_school_at: new Date().toISOString(),
                    leaving_reason: Leaving_Reason || 'Enrolled at new school'
                })
                .eq('enrollment_id', Current_Active_Enrollment.enrollment_id);

            if (Deactivate_Error) throw Deactivate_Error;

            // Remove class enrollments from old school
            if (Old_Class_Ids.length > 0) {
                await Supabase_Client
                    .from('Student_Class_Enrollment_Relation')
                    .delete()
                    .eq('student_id', Student_Id)
                    .in('class_id', Old_Class_Ids);
            }

            Deactivated_Old = true;
        }

        // 6. Create new enrollment
        const { data: New_Enrollment, error: Enroll_Error } = await Supabase_Client
            .from('Student_School_Enrollment')
            .insert([{
                student_id: Student_Id,
                school_id: School_Id,
                is_active: true
            }])
            .select()
            .single();

        if (Enroll_Error) throw Enroll_Error;

        res.status(201).json({
            success: true,
            message: Deactivated_Old
                ? `${Student.student_name} transferred from ${Old_School_Name} to ${School.school_name}.`
                : `${Student.student_name} enrolled at ${School.school_name} successfully.`,
            data: {
                enrollment_id: New_Enrollment.enrollment_id,
                student_id: Student_Id,
                student_name: Student.student_name,
                school_id: School_Id,
                school_name: School.school_name,
                enrolled_at: New_Enrollment.enrolled_at,
                previous_school_deactivated: Deactivated_Old
            }
        });

    } catch (Error) {
        console.error("Enroll Student Error:", Error.message);
        res.status(500).json({ success: false, message: "Server Error", error: Error.message });
    }
};





/**
 * Withdraw a student from a school (deactivate enrollment).
 * Does not delete the student - just ends their enrollment at that school.
 */
export const Withdraw_Student_From_School_BA = async (req, res) => {
    const { Student_Id, School_Id, Leaving_Reason } = req.body;

    if (!Student_Id || !School_Id) {
        return res.status(400).json({
            success: false,
            message: "Student_Id and School_Id are required."
        });
    }

    try {
        // 1. Find active enrollment
        const { data: Enrollment, error: Find_Error } = await Supabase_Client
            .from('Student_School_Enrollment')
            .select(`
        enrollment_id,
        Student ( student_name ),
        School ( school_name )
      `)
            .eq('student_id', Student_Id)
            .eq('school_id', School_Id)
            .eq('is_active', true)
            .single();

        if (Find_Error || !Enrollment) {
            return res.status(404).json({
                success: false,
                message: "No active enrollment found for this student at this school."
            });
        }

        // 2. Get classes from this school to remove class enrollments
        const { data: School_Classes } = await Supabase_Client
            .from('Class')
            .select('class_id')
            .eq('school_id', School_Id);

        const Class_Ids = School_Classes?.map(c => c.class_id) || [];

        // 3. Deactivate enrollment
        const { error: Update_Error } = await Supabase_Client
            .from('Student_School_Enrollment')
            .update({
                is_active: false,
                left_school_at: new Date().toISOString(),
                leaving_reason: Leaving_Reason || 'Withdrawn'
            })
            .eq('enrollment_id', Enrollment.enrollment_id);

        if (Update_Error) throw Update_Error;

        // 4. Remove class enrollments
        if (Class_Ids.length > 0) {
            await Supabase_Client
                .from('Student_Class_Enrollment_Relation')
                .delete()
                .eq('student_id', Student_Id)
                .in('class_id', Class_Ids);
        }

        res.json({
            success: true,
            message: `${Enrollment.Student.student_name} withdrawn from ${Enrollment.School.school_name}.`,
            data: {
                student_id: Student_Id,
                school_id: School_Id,
                enrollment_id: Enrollment.enrollment_id,
                withdrawn_at: new Date().toISOString()
            }
        });

    } catch (Error) {
        console.error("Withdraw Student Error:", Error.message);
        res.status(500).json({ success: false, message: "Server Error", error: Error.message });
    }
};
