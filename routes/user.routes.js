const express = require("express");
let router = express();

router.use(express.json());
const path = require("path");
const multer = require("multer");
// multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, path.join(__dirname, "../public/images"));
    }
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  fileFilter: fileFilter,
  storage: storage,
});
const userController = require("../controllers/user.controller");
const {
  registerValidator,
  sendMailVerificationValidator,
  passwordResetValidator,
  loginValidator,
  updateProfileValidator,
  otpMailValidator,
  verifyOtpMailValidator
} = require("../helper/validation");
const auth = require("../middleware/auth");
router.post(
  "/register",
  upload.single("image"),
  registerValidator,
  userController.userRegister
);
router.post(
  "/send-mail-verification",
  sendMailVerificationValidator,
  userController.sendMailVerification
);
router.post(
  "/forgot-password",
  passwordResetValidator,
  userController.forgotPassword
);
router.post("/login", loginValidator, userController.loginUser);

// authenticated routes
router.get("/profile", auth, userController.userProfile);
router.post(
  "/update-profile",
  auth,
  upload.single("image"),
  updateProfileValidator,
  userController.updateUserProfile
);
router.get("/refresh-token", auth, userController.refreshToken)
router.get("/logout", auth, userController.userLogout)

//otp verification routes
router.post("/send-otp",otpMailValidator,userController.sendOtp)
router.post("/verify-otp",verifyOtpMailValidator,userController.verifyOtp)




module.exports = router;
