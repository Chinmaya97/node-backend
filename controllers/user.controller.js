const User = require("../models/user.model");
const Blacklist = require("../models/blackList");
const Otp = require("../models/otp.model");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const mailer = require("../helper/mailer");
const randomstring = require("randomstring");
const PasswordReset = require("../models/passwordReset.model");
const jwt = require("jsonwebtoken");
const path = require("path");
const { deleteFile } = require("../helper/deleteFile");
const { oneMinuteExpiry, threeMinuteExpiry } = require("../helper/otpValidate");

// generate access token method
const generateAccessToken = async (user) => {
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
  return token;
};
//generate refresh token
const generateRefreshToken = async (user) => {
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "2h",
  });
  return token;
};
// generate otp
const generateRandomDigit = async () => {
  return Math.floor(1000 + Math.random() * 9000);
};

const userRegister = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Errors",
        errors: errors.array(),
      });
    }
    const { name, email, mobile, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        msg: "Email already exists",
      });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      mobile,
      password: hashPassword,
      image: "images/" + req.file.filename,
    });
    const userData = await user.save();
    const msg =
      "<p>Hi " +
      name +
      ',Please <a href="http://localhost:5000/mail-verification?id=' +
      userData._id +
      '">verify</a> your mail</p>';
    mailer.sendMail(email, "Mail verification", msg);
    return res.status(201).json({
      success: true,
      message: "User saved successfully",
      user: userData,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      msg: error.message,
    });
  }
};

const mailVerification = async (req, res) => {
  try {
    if (req.query.id == undefined) {
      return res.render("404");
    }
    const userData = await User.findOne({ _id: req.query.id });
    if (userData) {
      if (userData.is_verified === 1) {
        return res.render("mail-verification", {
          message: "Mail already verified",
        });
      }
      await User.findByIdAndUpdate(
        { _id: req.query.id },
        {
          $set: {
            is_verified: 1,
          },
        }
      );
      return res.render("mail-verification", {
        message: "Mail verification was successful",
      });
    } else {
      return res.render("mail-verification", { message: "User not found!" });
    }
  } catch (error) {
    console.log(error.message);
    return res.render("404");
  }
};
const sendMailVerification = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(404).json({
        success: false,
        errors: errors.array(),
      });
    }
    const { email } = req.body;
    const userData = await User.findOne({ email });
    if (!userData) {
      return res.status(404).json({
        success: false,
        msg: "Email does not exist",
      });
    }
    if (userData.is_verified == 1) {
      return res.status(404).json({
        success: false,
        msg: userData.email + "mail has been verified!",
      });
    }
    const msg =
      "<p>Hi " +
      userData.name +
      ',Please <a href="http://localhost:5000/mail-verification?id=' +
      userData._id +
      '">verify</a> your mail</p>';
    mailer.sendMail(userData.email, "Mail verification", msg);
    return res.status(201).json({
      success: true,
      message: "Verification mail send successfully please check your email",
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      msg: error.message,
    });
  }
};
const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(404).json({
        success: false,
        errors: errors.array(),
      });
    }
    const { email } = req.body;
    const userData = await User.findOne({ email });
    if (!userData) {
      return res.status(404).json({
        success: false,
        msg: "Email does not exist",
      });
    }
    const randomString = randomstring.generate();
    const msg =
      "<p>Hi " +
      userData.name +
      ',Please click <a href="http://localhost:5000/reset-password?token=' +
      randomString +
      '">here</a> Reset your Password</p>';
    await PasswordReset.deleteMany({ user_id: userData._id });
    const passwordReset = new PasswordReset({
      user_id: userData._id,
      token: randomString,
    });
    await passwordReset.save();
    mailer.sendMail(userData.email, "Reset Password", msg);
    return res.status(201).json({
      success: true,
      message: "Reset Password link sent to your email, please check!",
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      msg: error.message,
    });
  }
};
const resetPassword = async (req, res) => {
  try {
    if (req.query.token == undefined) {
      return res.render("404");
    }
    const resetData = await PasswordReset.findOne({ token: req.query.token });
    if (!resetData) {
      return res.render("404");
    }
    return res.render("reset-password", { resetData });
  } catch (error) {
    console.log(error.message);
    return res.render("404");
  }
};
const updatePassword = async (req, res) => {
  try {
    const { user_id, password, c_password } = req.body;
    const resetData = await PasswordReset.findOne({ user_id });
    if (password != c_password) {
      return res.render("reset-password", {
        resetData,
        error: "password mismatch!",
      });
    }
    const hashedPassword = await bcrypt.hash(c_password, 10);
    await User.findByIdAndUpdate(
      { _id: user_id },
      {
        $set: {
          password: hashedPassword,
        },
      }
    );
    await PasswordReset.deleteMany({ user_id });
    return res.redirect("/reset-success");
  } catch (error) {
    res.render("404");
  }
};
const resetSuccess = async (req, res) => {
  try {
    return res.render("reset-success");
  } catch (error) {
    return res.render("404");
  }
};
const loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Errors",
        errors: errors.array(),
      });
    }
    const { email, password } = req.body;
    const userData = await User.findOne({ email });
    if (!userData) {
      res.status(400).json({
        success: false,
        msg: "Email and Password is incorrect",
      });
    }

    const passwordMatch = await bcrypt.compare(password, userData.password);
    console.log(passwordMatch);
    if (!passwordMatch) {
      return res.status(400).json({
        success: false,
        msg: "Password is Incorrect!",
      });
    }
    if (userData.is_verified == 0) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email address",
      });
    }
    const accessToken = await generateAccessToken({
      user: userData,
    });
    const refreshToken = await generateRefreshToken({
      user: userData,
    });
    return res.status(200).json({
      success: true,
      msg: "Login successful",
      user: userData,
      accessToken: accessToken,
      refreshToken: refreshToken,
      tokenType: "Bearer",
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      msg: error.message,
    });
  }
};
const userProfile = async (req, res) => {
  try {
    const userData = req.user.user;
    return res.status(200).json({
      success: true,
      message: "User Profile data!",
      data: userData,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      msg: error.message,
    });
  }
};
const updateUserProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: "Errors",
        errors: errors.array(),
      });
    }
    const { name, mobile } = req.body;
    const data = {
      name,
      mobile,
    };
    const user_id = req.user.user._id;
    if (req.file !== undefined) {
      data.image = "images/" + req.file.filename;
      const oldUser = await User.findOne({ _id: user_id });
      const oldFilePath = path.join(__dirname, "../public/" + oldUser.image);
      deleteFile(oldFilePath);
    }
    const userData = await User.findOneAndUpdate(
      { _id: user_id },
      {
        $set: data,
      },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      msg: "User updated successfully",
      data: userData,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      msg: error.message,
    });
  }
};
const refreshToken = async (req, res) => {
  try {
    const userId = req.user.user._id;
    const userData = await User.findOne({ _id: userId });
    const accessToken = await generateAccessToken({ user: userData });
    const refreshToken = await generateRefreshToken({ user: userData });
    return res.status(200).json({
      success: true,
      msg: "Token refreshed successfully",
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      msg: error.message,
    });
  }
};
const userLogout = async (req, res) => {
  try {
    const token =
      req.body.token || req.query.token || req.headers["authorization"];
    const bearer = token.split(" ");
    const bearerToken = bearer[1];
    const newBlackList = new Blacklist({
      token: bearerToken,
    });
    await newBlackList.save();
    res.setHeader("Clear-Site-data", '"cookies","storage"');
    return res.status(200).json({
      success: true,
      mgg: "user logged out",
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      msg: error.message,
    });
  }
};
const sendOtp = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(404).json({
        success: false,
        errors: errors.array(),
      });
    }
    const { email } = req.body;
    const userData = await User.findOne({ email });
    if (!userData) {
      return res.status(404).json({
        success: false,
        msg: "Email does not exist",
      });
    }
    if (userData.is_verified == 1) {
      return res.status(404).json({
        success: false,
        msg: userData.email + "mail has been verified!",
      });
    }
    const g_otp = await generateRandomDigit();
    const old_otp_data = await Otp.findOne({ user_id: userData._id });
    if (old_otp_data) {
      const sendNextOtp = await oneMinuteExpiry(old_otp_data.timestamp);
      if (!sendNextOtp) {
        return res.status(404).json({
          success: false,
          msg: "Please try after some time",
        });
      }
    }
    const c_date = new Date();
    await Otp.findOneAndUpdate(
      { user_id: userData._id },
      { otp: g_otp, timestamp: new Date(c_date.getTime()) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const msg =
      "<p>Hii <b>" + userData.name + "</b>,</br> <h4>" + g_otp + "</h4> </p>";

    mailer.sendMail(userData.email, "Otp verification", msg);
    return res.status(201).json({
      success: true,
      message: "Otp is sent to your mail, please check your email",
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      msg: error.message,
    });
  }
};
const verifyOtp = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(404).json({
        success: false,
        errors: errors.array(),
      });
    }
    const {user_id, otp} = req.body
    const otpData = await Otp.findOne({
      user_id,
      otp,
    });

    if (!otpData) {
      return res.status(404).json({
        success: false,
        msg: "you entered wrong otp",
      });
    }
    const isOtpExpired = await threeMinuteExpiry(otpData.timestamp);
    if (isOtpExpired) {
      return res.status(404).json({
        success: false,
        msg: "Otp has expired",
      });
    }
    await User.findByIdAndUpdate(
      { _id: user_id },
      {
        $set: {
          is_verified: 1,
        },
      }
    );

    return res.status(200).json({
      success: true,
      msg: "Account has verified successfully",
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      msg: error.message,
    });
  }
};
module.exports = {
  userRegister,
  mailVerification,
  sendMailVerification,
  forgotPassword,
  resetPassword,
  updatePassword,
  resetSuccess,
  loginUser,
  userProfile,
  updateUserProfile,
  refreshToken,
  userLogout,
  sendOtp,
  verifyOtp,
};
