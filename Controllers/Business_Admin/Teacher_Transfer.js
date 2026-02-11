import Supabase_Client from '../../Supabase_Client.js';


/**
 * Transfer a teacher from their current school to a new school.
 */
export const Transfer_Teacher_BA = async (req, res) => {
    const { Teacher_Id, New_School_Id, Leaving_Reason } = req.body;

    if (!Teacher_Id || !New_School_Id) {
        return res.status(400).json({
            success: false,
            message: "Teacher_Id and New_School_Id are required."
        });
    }

    try {
        // 1. Verify teacher exists
        const { data: Teacher, error: Teacher_Error } = await Supabase_Client
            .from('Teacher')
            .select('teacher_id, name')
            .eq('teacher_id', Teacher_Id)
            .single();

        if (Teacher_Error || !Teacher) {
            return res.status(404).json({ success: false, message: "Teacher not found." });
        }

        // 2. Verify new school exists
        const { data: New_School, error: School_Error } = await Supabase_Client
            .from('School')
            .select('school_id, school_name')
            .eq('school_id', New_School_Id)
            .single();

        if (School_Error || !New_School) {
            return res.status(404).json({ success: false, message: "Target school not found." });
        }

        // 3. Get current active enrollment
        const { data: Current_Enrollment, error: Enroll_Error } = await Supabase_Client
            .from('Teacher_School_Enrollment')
            .select(`
        enrollment_id,
        school_id,
        School ( school_name )
      `)
            .eq('teacher_id', Teacher_Id)
            .eq('is_active', true)
            .single();

        if (Enroll_Error || !Current_Enrollment) {
            return res.status(400).json({
                success: false,
                message: "Teacher has no active school enrollment to transfer from."
            });
        }

        // 4. Prevent transfer to same school
        if (Current_Enrollment.school_id == New_School_Id) {
            return res.status(400).json({
                success: false,
                message: "Teacher is already employed at this school."
            });
        }

        const Old_School_Id = Current_Enrollment.school_id;
        const Old_School_Name = Current_Enrollment.School?.school_name || "Unknown";

        // 5. Get classes from old school to remove assignments
        const { data: Old_Classes } = await Supabase_Client
            .from('Class')
            .select('class_id')
            .eq('school_id', Old_School_Id);

        const Old_Class_Ids = Old_Classes?.map(c => c.class_id) || [];

        // --- BEGIN TRANSFER ---

        // 6. Mark old enrollment as inactive
        const { error: Deactivate_Error } = await Supabase_Client
            .from('Teacher_School_Enrollment')
            .update({
                is_active: false,
                left_at: new Date().toISOString(),
                leaving_reason: Leaving_Reason || 'Transferred to another school'
            })
            .eq('enrollment_id', Current_Enrollment.enrollment_id);

        if (Deactivate_Error) throw Deactivate_Error;

        // 7. Remove class teacher assignments from old school
        if (Old_Class_Ids.length > 0) {
            await Supabase_Client
                .from('Class_ClassTeacher_Relation')
                .delete()
                .eq('teacher_id', Teacher_Id)
                .in('class_id', Old_Class_Ids);
        }

        // 8. Remove subject teacher assignments from old school classes
        if (Old_Class_Ids.length > 0) {
            // Get class-subject relations for old school
            const { data: Class_Subject_Relations } = await Supabase_Client
                .from('Class_Subject_Relation')
                .select('class_subject_relation_id')
                .in('class_id', Old_Class_Ids);

            if (Class_Subject_Relations && Class_Subject_Relations.length > 0) {
                const Relation_Ids = Class_Subject_Relations.map(r => r.class_subject_relation_id);
                await Supabase_Client
                    .from('ClassSubject_SubjectTeacher_Relation')
                    .delete()
                    .eq('teacher_id', Teacher_Id)
                    .in('class_subject_relation_id', Relation_Ids);
            }
        }

        // 9. Create new school enrollment
        const { data: New_Enrollment, error: Create_Error } = await Supabase_Client
            .from('Teacher_School_Enrollment')
            .insert([{
                teacher_id: Teacher_Id,
                school_id: New_School_Id,
                is_active: true
            }])
            .select()
            .single();

        if (Create_Error) {
            // Rollback: Reactivate old enrollment
            await Supabase_Client
                .from('Teacher_School_Enrollment')
                .update({ is_active: true, left_at: null, leaving_reason: null })
                .eq('enrollment_id', Current_Enrollment.enrollment_id);
            throw Create_Error;
        }

        res.json({
            success: true,
            message: `${Teacher.name} transferred successfully.`,
            transfer_details: {
                teacher_id: Teacher_Id,
                teacher_name: Teacher.name,
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
        console.error("Transfer Teacher Error:", Error.message);
        res.status(500).json({ success: false, message: "Server Error", error: Error.message });
    }
};




/**
 * Get the complete employment history for a teacher across all schools.
 */
export const Get_Teacher_Enrollment_History_BA = async (req, res) => {
    const Teacher_Id = req.query.Teacher_Id || req.body.Teacher_Id;

    if (!Teacher_Id) {
        return res.status(400).json({
            success: false,
            message: "Teacher_Id is required."
        });
    }

    try {
        const { data: Teacher, error: Teacher_Error } = await Supabase_Client
            .from('Teacher')
            .select('teacher_id, name, phone, email')
            .eq('teacher_id', Teacher_Id)
            .single();

        if (Teacher_Error || !Teacher) {
            return res.status(404).json({ success: false, message: "Teacher not found." });
        }

        const { data: Enrollments, error: Enroll_Error } = await Supabase_Client
            .from('Teacher_School_Enrollment')
            .select(`
        enrollment_id,
        school_id,
        is_active,
        joined_at,
        left_at,
        leaving_reason,
        School ( school_id, school_name )
      `)
            .eq('teacher_id', Teacher_Id)
            .order('joined_at', { ascending: false });

        if (Enroll_Error) throw Enroll_Error;

        const History = Enrollments.map(e => ({
            enrollment_id: e.enrollment_id,
            school_id: e.school_id,
            school_name: e.School?.school_name || "Unknown",
            is_active: e.is_active,
            joined_at: e.joined_at,
            left_at: e.left_at,
            leaving_reason: e.leaving_reason,
            duration_days: e.left_at
                ? Math.floor((new Date(e.left_at) - new Date(e.joined_at)) / (1000 * 60 * 60 * 24))
                : null
        }));

        res.json({
            success: true,
            teacher: {
                teacher_id: Teacher.teacher_id,
                name: Teacher.name,
                phone: Teacher.phone,
                email: Teacher.email
            },
            total_schools: History.length,
            current_school: History.find(h => h.is_active) || null,
            employment_history: History
        });

    } catch (Error) {
        console.error("Get Teacher History Error:", Error.message);
        res.status(500).json({ success: false, message: "Server Error", error: Error.message });
    }
};




/**
 * Get all currently employed teachers for a specific school.
 */
export const Get_School_Teachers_BA = async (req, res) => {
    const School_Id = req.query.School_Id || req.body.School_Id;
    const Include_Inactive = req.query.Include_Inactive === 'true';

    if (!School_Id) {
        return res.status(400).json({
            success: false,
            message: "School_Id is required."
        });
    }

    try {
        let query = Supabase_Client
            .from('Teacher_School_Enrollment')
            .select(`
        enrollment_id,
        is_active,
        joined_at,
        left_at,
        leaving_reason,
        Teacher (
          teacher_id,
          name,
          phone,
          email,
          is_active,
          created_at
        )
      `)
            .eq('school_id', School_Id)
            .order('joined_at', { ascending: false });

        if (!Include_Inactive) {
            query = query.eq('is_active', true);
        }

        const { data: Enrollments, error } = await query;

        if (error) throw error;

        const Teachers = Enrollments.map(e => ({
            enrollment_id: e.enrollment_id,
            enrollment_is_active: e.is_active,
            joined_at: e.joined_at,
            left_at: e.left_at,
            leaving_reason: e.leaving_reason,
            teacher_id: e.Teacher.teacher_id,
            name: e.Teacher.name,
            phone: e.Teacher.phone,
            email: e.Teacher.email,
            teacher_is_active: e.Teacher.is_active,
            created_at: e.Teacher.created_at
        }));

        res.json({
            success: true,
            school_id: School_Id,
            include_inactive: Include_Inactive,
            count: Teachers.length,
            data: Teachers
        });

    } catch (Error) {
        console.error("Get School Teachers Error:", Error.message);
        res.status(500).json({ success: false, message: "Server Error", error: Error.message });
    }
};




/**
 * Enroll an existing teacher in a school.
 * NOTE: Only ONE active enrollment allowed per teacher.
 * If teacher has an active enrollment elsewhere, it will be deactivated first.
 */
export const Enroll_Teacher_In_School_BA = async (req, res) => {
    const { Teacher_Id, School_Id, Leaving_Reason } = req.body;

    if (!Teacher_Id || !School_Id) {
        return res.status(400).json({
            success: false,
            message: "Teacher_Id and School_Id are required."
        });
    }

    try {
        // 1. Verify teacher exists
        const { data: Teacher } = await Supabase_Client
            .from('Teacher')
            .select('teacher_id, name')
            .eq('teacher_id', Teacher_Id)
            .single();

        if (!Teacher) {
            return res.status(404).json({ success: false, message: "Teacher not found." });
        }

        // 2. Verify school exists
        const { data: School } = await Supabase_Client
            .from('School')
            .select('school_id, school_name')
            .eq('school_id', School_Id)
            .single();

        if (!School) {
            return res.status(404).json({ success: false, message: "School not found." });
        }

        // 3. Check if already enrolled at this specific school
        const { data: Same_School } = await Supabase_Client
            .from('Teacher_School_Enrollment')
            .select('enrollment_id')
            .eq('teacher_id', Teacher_Id)
            .eq('school_id', School_Id)
            .eq('is_active', true)
            .maybeSingle();

        if (Same_School) {
            return res.status(409).json({
                success: false,
                message: "Teacher is already employed at this school."
            });
        }

        // 4. Check if teacher has ANY active enrollment (at another school)
        const { data: Current_Active } = await Supabase_Client
            .from('Teacher_School_Enrollment')
            .select(`
                enrollment_id,
                school_id,
                School ( school_name )
            `)
            .eq('teacher_id', Teacher_Id)
            .eq('is_active', true)
            .maybeSingle();

        let Deactivated_Old = false;
        let Old_School_Name = null;

        // 5. If teacher has active enrollment elsewhere, deactivate it first
        if (Current_Active) {
            Old_School_Name = Current_Active.School?.school_name || "Unknown";

            // Get classes from old school to remove assignments
            const { data: Old_Classes } = await Supabase_Client
                .from('Class')
                .select('class_id')
                .eq('school_id', Current_Active.school_id);

            const Old_Class_Ids = Old_Classes?.map(c => c.class_id) || [];

            // Deactivate old enrollment
            const { error: Deactivate_Error } = await Supabase_Client
                .from('Teacher_School_Enrollment')
                .update({
                    is_active: false,
                    left_at: new Date().toISOString(),
                    leaving_reason: Leaving_Reason || 'Employed at new school'
                })
                .eq('enrollment_id', Current_Active.enrollment_id);

            if (Deactivate_Error) throw Deactivate_Error;

            // Remove class teacher assignments from old school
            if (Old_Class_Ids.length > 0) {
                await Supabase_Client
                    .from('Class_ClassTeacher_Relation')
                    .delete()
                    .eq('teacher_id', Teacher_Id)
                    .in('class_id', Old_Class_Ids);

                // Remove subject teacher assignments
                const { data: CSRs } = await Supabase_Client
                    .from('Class_Subject_Relation')
                    .select('class_subject_relation_id')
                    .in('class_id', Old_Class_Ids);

                if (CSRs && CSRs.length > 0) {
                    await Supabase_Client
                        .from('ClassSubject_SubjectTeacher_Relation')
                        .delete()
                        .eq('teacher_id', Teacher_Id)
                        .in('class_subject_relation_id', CSRs.map(r => r.class_subject_relation_id));
                }
            }

            Deactivated_Old = true;
        }

        // 6. Create new enrollment
        const { data: New_Enrollment, error } = await Supabase_Client
            .from('Teacher_School_Enrollment')
            .insert([{
                teacher_id: Teacher_Id,
                school_id: School_Id,
                is_active: true
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            message: Deactivated_Old
                ? `${Teacher.name} transferred from ${Old_School_Name} to ${School.school_name}.`
                : `${Teacher.name} enrolled at ${School.school_name} successfully.`,
            data: {
                enrollment_id: New_Enrollment.enrollment_id,
                teacher_id: Teacher_Id,
                teacher_name: Teacher.name,
                school_id: School_Id,
                school_name: School.school_name,
                joined_at: New_Enrollment.joined_at,
                previous_school_deactivated: Deactivated_Old
            }
        });

    } catch (Error) {
        console.error("Enroll Teacher Error:", Error.message);
        res.status(500).json({ success: false, message: "Server Error", error: Error.message });
    }
};





/**
 * Withdraw a teacher from a school (end employment).
 */
export const Withdraw_Teacher_From_School_BA = async (req, res) => {
    const { Teacher_Id, School_Id, Leaving_Reason } = req.body;

    if (!Teacher_Id || !School_Id) {
        return res.status(400).json({
            success: false,
            message: "Teacher_Id and School_Id are required."
        });
    }

    try {
        const { data: Enrollment, error: Find_Error } = await Supabase_Client
            .from('Teacher_School_Enrollment')
            .select(`
        enrollment_id,
        Teacher ( name ),
        School ( school_name )
      `)
            .eq('teacher_id', Teacher_Id)
            .eq('school_id', School_Id)
            .eq('is_active', true)
            .single();

        if (Find_Error || !Enrollment) {
            return res.status(404).json({
                success: false,
                message: "No active employment found for this teacher at this school."
            });
        }

        // Get classes to remove assignments
        const { data: School_Classes } = await Supabase_Client
            .from('Class')
            .select('class_id')
            .eq('school_id', School_Id);

        const Class_Ids = School_Classes?.map(c => c.class_id) || [];

        // Deactivate enrollment
        const { error: Update_Error } = await Supabase_Client
            .from('Teacher_School_Enrollment')
            .update({
                is_active: false,
                left_at: new Date().toISOString(),
                leaving_reason: Leaving_Reason || 'Withdrawn'
            })
            .eq('enrollment_id', Enrollment.enrollment_id);

        if (Update_Error) throw Update_Error;

        // Remove class teacher assignments
        if (Class_Ids.length > 0) {
            await Supabase_Client
                .from('Class_ClassTeacher_Relation')
                .delete()
                .eq('teacher_id', Teacher_Id)
                .in('class_id', Class_Ids);

            // Remove subject teacher assignments
            const { data: CSRs } = await Supabase_Client
                .from('Class_Subject_Relation')
                .select('class_subject_relation_id')
                .in('class_id', Class_Ids);

            if (CSRs && CSRs.length > 0) {
                await Supabase_Client
                    .from('ClassSubject_SubjectTeacher_Relation')
                    .delete()
                    .eq('teacher_id', Teacher_Id)
                    .in('class_subject_relation_id', CSRs.map(r => r.class_subject_relation_id));
            }
        }

        res.json({
            success: true,
            message: `${Enrollment.Teacher.name} withdrawn from ${Enrollment.School.school_name}.`,
            data: {
                teacher_id: Teacher_Id,
                school_id: School_Id,
                enrollment_id: Enrollment.enrollment_id,
                withdrawn_at: new Date().toISOString()
            }
        });

    } catch (Error) {
        console.error("Withdraw Teacher Error:", Error.message);
        res.status(500).json({ success: false, message: "Server Error", error: Error.message });
    }
};
