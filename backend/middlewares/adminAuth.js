import jwt from "jsonwebtoken";

//admin authentication middleware

const adminAuth = async (req, res, next) => {
  try {
    const { atoken } = req.headers;
    if (!atoken) {
      return res.json({
        success: false,
        message: "Not Authorized. Login Again ",
      });
    }
    const token_decode = jwt.verify(atoken, process.env.JWT_SECRET);
    req.body.userId = token_decode.id;

    next();
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

export default adminAuth;
