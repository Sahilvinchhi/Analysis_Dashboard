const nodemailer = require("nodemailer");
const crypto = require("crypto");

/**
 * Generate a secure verification token
 * @returns {string} - Random token
 */
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Send verification email to user
 * @param {string} email - User's email address
 * @param {string} token - Verification token
 * @throws {Error} - If email sending fails
 */
const sendVerificationEmail = async (email, token) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Email configuration missing: EMAIL_USER or EMAIL_PASS not set");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Verify transporter connection
    await transporter.verify();

    const verifyLink = `http://localhost:5173/verify-email?token=${token}`;

    const mailOptions = {
      from: `"Employee Training Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email - Employee Training Platform",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0;">Employee Training Platform</h2>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 0 0 5px 5px;">
            <h3 style="color: #333;">Email Verification Required</h3>
            <p style="color: #666; line-height: 1.6;">
              Thank you for registering with Employee Training Platform. Please verify your email address to complete your account setup.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyLink}" style="display: inline-block; background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; font-size: 13px; margin-top: 20px;">
              Or copy and paste this link in your browser:<br/>
              <code style="background-color: #f0f0f0; padding: 10px; display: block; word-break: break-all; margin: 10px 0;">
                ${verifyLink}
              </code>
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            
            <p style="color: #999; font-size: 12px;">
              This verification link will expire in <strong>24 hours</strong>.<br/>
              If you did not create this account, please ignore this email.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Email sending error:", error.message);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

module.exports = { sendVerificationEmail, generateVerificationToken };

