import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  try {
    console.log('=== AUTH DEBUG ===');
    console.log('Token received:', req.headers.token ? 'YES' : 'NO');
    console.log('Token first 20 chars:', req.headers.token ? req.headers.token.substring(0, 20) : 'N/A');
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('JWT_SECRET first 10 chars:', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 10) : 'N/A');
    console.log('==================');

    const { token } = req.headers;
    
    if (!token) {
      return res.json({
        success: false,
        message: "Not Authorized Login Again"
      });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded successfully:', token_decode);
    
    // Add user info to req.user (cleaner approach)
    req.user = {
      userId: token_decode.id,
      id: token_decode.id
    };
    
    // Also add to req.body for backward compatibility with existing code
    if (!req.body) {
      req.body = {};
    }
    req.body.userId = token_decode.id;
    
    next();
  } catch (error) {
    console.log('❌ Auth middleware error:', error.message);
    res.json({
      success: false,
      message: "Invalid token"
    });
  }
};

export default authMiddleware;