const User = require("../../../models/users.model");
const { sendVerificationEmail } = require("../../../emails/mailer");

/**
 * Controller to handle password reset request.
 * Generates a verification code, updates the DB, sends an email,
 * and sets a 2-minute timer to invalidate the code back to '000000'.
 */
const forgetPasswordController = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        status: "fail",
        message: "Email address is required.",
        fieldErrors: { email: "Email address is required." },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "This email is not registered.",
        fieldErrors: { email: "This email is not registered." },
      });
    }

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in DB
    user.vcode = verificationCode;
    await user.save();

    // Send email (mocked if credentials are missing)
    await sendVerificationEmail(normalizedEmail, verificationCode);

    // Set 2-minute timer to invalidate the verification code
    setTimeout(async () => {
      try {
        const checkUser = await User.findOne({ where: { email: normalizedEmail } });
        // Only reset to '000000' if it hasn't been changed to another code or cleared
        if (checkUser && checkUser.vcode === verificationCode) {
          checkUser.vcode = "000000";
          await checkUser.save();
          console.log(`[Timer Expired] Verification code for ${normalizedEmail} has been invalidated.`);
        }
      } catch (err) {
        console.error(`Error invalidating expired vcode for ${normalizedEmail}:`, err);
      }
    }, 2 * 60 * 1000); // 2 minutes (120,000ms)

    return res.status(200).json({
      status: "success",
      message: "A 6-digit recovery code has been sent to your email address.",
      data: {
        email: normalizedEmail,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = forgetPasswordController;
