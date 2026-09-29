// eslint-disable-next-line no-undef
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    console.log(token);
    if (!token) {
      return res.status(401).json({
        message: "Not authenticated",
      });
    }

    // eslint-disable-next-line no-undef
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
      error: error,
    });
  }
};

// eslint-disable-next-line no-undef
module.exports = authMiddleware;
