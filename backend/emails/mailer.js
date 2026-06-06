const nodemailer = require("nodemailer");

/**
 * Sends a verification email to the user with the generated code.
 * If credentials are not configured in .env, falls back to logging the code to the console.
 * 
 * @param {string} email User's email address
 * @param {string} code 6-digit verification code
 * @returns {Promise<{success: boolean, mocked: boolean}>}
 */
const sendVerificationEmail = async (email, code) => {
  const companyEmail = process.env.COMPANY_EMAIL;
  const emailPassword = process.env.EMAIL_PASSWORD;

  // Print to console for development/debugging convenience
  console.log("\n==================================================");
  console.log("             PASSWORD RESET CODE                 ");
  console.log(`Email: ${email}`);
  console.log(`Code:  ${code}`);
  console.log("==================================================\n");

  if (!companyEmail || !emailPassword) {
    console.warn("Mail warning: COMPANY_EMAIL or EMAIL_PASSWORD not set in .env. Skipping actual email delivery.");
    return { success: true, mocked: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: companyEmail,
        pass: emailPassword,
      },
    });

    const mailOptions = {
      from: `"Quiz Master" <${companyEmail}>`,
      to: email,
      subject: "Reset Your Password - Quiz Master",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 20px auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="color: #4f46e5; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Quiz Master</h2>
          </div>
          <p style="font-size: 16px; color: #334155; line-height: 1.6; margin-top: 0;">Hello,</p>
          <p style="font-size: 16px; color: #334155; line-height: 1.6;">We received a request to reset the password for your Quiz Master account. Use the verification code below to set a new password:</p>
          
          <div style="text-align: center; margin: 35px 0;">
            <div style="display: inline-block; font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #4f46e5; background-color: #eff6ff; padding: 14px 30px; border-radius: 12px; border: 2px dashed #bfdbfe; font-family: monospace;">
              ${code}
            </div>
          </div>
          
          <p style="font-size: 14px; color: #e11d48; font-weight: 600; line-height: 1.5; background-color: #fff1f2; padding: 10px 14px; border-radius: 8px; border-left: 4px solid #f43f5e; margin: 25px 0;">
            ⚠️ This code is only valid for 2 minutes. If you do not reset your password within 2 minutes, this code will be invalidated.
          </p>
          
          <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin-bottom: 0;">If you didn't request a password reset, you can safely ignore this email. Your current password will remain unchanged.</p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0; line-height: 1.5;">This is an automated security message. Please do not reply directly to this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Mail success: Sent verification email to ${email}`);
    return { success: true, mocked: false };
  } catch (error) {
    console.error("Mail error: Failed to send actual email via nodemailer:", error.message);
    // Return success: true but with mocked status to avoid breaking the application flow for the user if SMTP fails
    return { success: true, mocked: true, error: error.message };
  }
};

module.exports = { sendVerificationEmail };
