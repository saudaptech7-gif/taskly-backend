// eslint-disable-next-line no-undef
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // eslint-disable-next-line no-undef
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in environment variables!");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    // eslint-disable-next-line no-undef
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

// eslint-disable-next-line no-undef
module.exports = authMiddleware;