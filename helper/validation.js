const { check } = require("express-validator");

exports.registerValidator = [
  check("name", "Name is required").not().isEmpty(),
  check("email", "Email is required").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }),
  check("mobile", "Mobile no. should be contains 10 digits ").isLength({
    min: 10,
    max: 10,
  }),
  check(
    "password",
    "password should contain 6 characters and contains one Uppercase letter, one Lowercase letter,one special character,one number"
  ).isStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
  }),
  check("image")
    .custom((value, { req }) => {
      if (
        req.file.mimetype === "image/jpeg" ||
        req.file.mimetype === "image/png"
      ) {
        return true;
      } else {
        return false;
      }
    })
    .withMessage("please upload an image jpeg/ PNG"),
];
exports.sendMailVerificationValidator = [
  check("email", "Email is required").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }),
];
exports.passwordResetValidator = [
  check("email", "Email is required").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }),
];
exports.loginValidator = [
  check("email", "Email is required").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }),
  check("password", "Password is required").not().isEmpty(),
];
exports.updateProfileValidator = [
  check("name", "Name is required").not().isEmpty(),
  check("mobile", "Mobile no. should be contains 10 digits ").isLength({
    min: 10,
    max: 10,
  })

]
exports.otpMailValidator = [
  check("email", "Email is required").isEmail().normalizeEmail({
    gmail_remove_dots: true,
  }),
];
exports.verifyOtpMailValidator = [
  check("user_id", "User id is required").not().isEmpty(),
  check("otp", "Otp is required").not().isEmpty()
   
]; 