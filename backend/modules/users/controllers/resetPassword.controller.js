const bcrypt = require("bcrypt");
const User = require("../../../models/users.model");

const buildValidationErrors = (payload) => {
  const errors = {};

  if (!payload.email?.trim()) {
    errors.email = "Email is required.";
  }

  if (!payload.otp?.trim()) {
    errors.otp = "Verification code is required.";
  } else if (payload.otp.trim().length !== 6) {
    errors.otp = "Verification code must be exactly 6 digits.";
  }

  if (!payload.password) {
    errors.password = "Password is required.";
  } else {
    if (payload.password.length < 6 || payload.password.length > 11) {
      errors.password = "Password must be between 6 and 11 characters.";
    } else if (!/[A-Z]/.test(payload.password) || !/\d/.test(payload.password)) {
      errors.password = "Password must include at least one capital letter and one number.";
    }
  }

  return errors;
};

/**
 * Controller to handle password resetting.
 * Verifies code against database record and applies new password with complexity requirements.
 */
const resetPasswordController = async (req, res, next) => {
  try {
    const payload = {
      email: req.body.email,
      otp: req.body.otp ?? req.body.code,
      password: req.body.password,
    };

    const validationErrors = buildValidationErrors(payload);
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({
        status: "fail",
        message: "Validation failed",
        fieldErrors: validationErrors,
      });
    }

    const normalizedEmail = payload.email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found.",
        fieldErrors: { email: "User not found." },
      });
    }

    // Verify verification code
    const storedVcode = user.vcode;
    const submittedVcode = payload.otp.trim();

    if (storedVcode === "000000" || storedVcode !== submittedVcode) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid or expired verification code.",
        fieldErrors: { otp: "Invalid or expired verification code." },
      });
    }

    // Encrypt the new password
    const hashedPassword = await bcrypt.hash(payload.password, 10);

    // Save and clear vcode back to '000000'
    user.password = hashedPassword;
    user.vcode = "000000";
    await user.save();

    return res.status(200).json({
      status: "success",
      message: "Your password has been successfully reset. Please log in with your new password.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = resetPasswordController;
