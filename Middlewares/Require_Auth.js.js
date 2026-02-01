// Middlewares/RequireAuth.js.js
import jwt from 'jsonwebtoken';



export const Require_Auth = (req, res, next) => {
  const Auth_Header = req.headers.authorization;

  console.log(Auth_Header);

  if (!Auth_Header) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentication token missing" 
    });
  }

  // Token format: "Bearer <token>"
  const Token_String = Auth_Header.split(' ')[1];

  try {
    const Decoded_User = jwt.verify(Token_String, process.env.JWT_SECRET);
    
    
    // Attach the user data to the request object
    req.user = Decoded_User;
    
    next(); 
  } catch (Error) {
    return res.status(403).json({ 
      success: false, 
      message: "Invalid or expired token" 
    });
  }
};

