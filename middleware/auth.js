const jwt = require("jsonwebtoken");
const Blacklist = require('../models/blackList')
const dotenv = require("dotenv")
const verifyToken = async (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["authorization"];
  if (!token) {
    return res.status(403).json({
      success: false,
      msg: "A token is required for authentication",
    });
  }
  try {
    const bearer = token.split(' ')
    const bearerToken = bearer[1]
    const blacklistedToken = await Blacklist.findOne({token: bearerToken})
    if (blacklistedToken) {
      return res.status(403).json({
        success: false,
        msg: "Session has expired. Please try again later.",
      });

    }
    const decodedData =  jwt.verify(bearerToken, process.env.ACCESS_TOKEN_SECRET)
    req.user = decodedData
  } catch (error) {
    return res.status(404).json({
      success: false,
      msg: "Invalid token",
    });
  }

  return next();
};

module.exports = verifyToken;
