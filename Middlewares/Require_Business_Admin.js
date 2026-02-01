export const Require_Business_Admin = (req, res, next) => {



  // Safety check
  if (!req.user) {
    return res.status(500).json({ 
      success: false, 
      message: "Server Error: Role check attempted without authentication." 
    });
  }


  
  if (req.user.role !== 'Business_Admin') {
    return res.status(403).json({ 
      success: false, 
      message: "Access Denied. You do not have Business Admin privileges." 
    });
  }

  next(); 
};