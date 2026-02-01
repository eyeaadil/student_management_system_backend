// Middlewares/Require_Student.js

export const Require_Student = (req, res, next) => {
    // Safety check
    if (!req.user) {
        return res.status(500).json({
            success: false,
            message: "Server Error: Role check attempted without authentication."
        });
    }

    if (req.user.role !== 'Student') {
        return res.status(403).json({
            success: false,
            message: "Access Denied. You are not a Student."
        });
    }

    next();
};
