export const Require_School_Admin = (req, res, next) => {
  // Safety check
  if (!req.user) {
    return res.status(500).json({ success: false, message: "Auth Error" });
  }

  if (req.user.role !== 'School_Admin') {
    return res.status(403).json({ 
      success: false, 
      message: "Access Denied. You are not a School Admin." 
    });
  }

  next(); 
};