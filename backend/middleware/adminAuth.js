import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  try {
    const { token } = req.headers;
    
    if (!token) {
      return res.json({
        success: false,
        message: "Not Authorized Login Again"
      });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to req.user (cleaner approach)
    req.user = {
      userId: token_decode.id,
      id: token_decode.id
    };
    
    // add to req.body for backward compatibility with existing code
    if (!req.body) {
      req.body = {};
    }
    req.body.userId = token_decode.id;
    
    next();
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: "Invalid token"
    });
  }
};

export default authMiddleware;