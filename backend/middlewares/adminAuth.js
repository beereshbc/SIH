// middlewares/adminAuth.js
import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
  try {
    const { atoken } = req.headers;
    if (!atoken) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized. Login Again",
      });
    }

    // Verify token
    const decoded = jwt.verify(atoken, process.env.JWT_SECRET);

    // Extra safety: check if it's really an admin token
    if (!decoded || decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin access required",
      });
    }

    // Attach to request
    req.adminId = decoded.id;
    req.adminRole = decoded.role;

    next();
  } catch (error) {
    console.error("AdminAuth error:", error.message);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

export default adminAuth;
