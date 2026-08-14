const nodemailer = require("nodemailer");

const sendOtpMail = async (toEmail, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        })

        const mailOptions = {
            from: `"Full Stack Project" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: "Verify Your Email - OTP",
            html: `
  <div style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial, sans-serif;">
    
    <table align="center" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:auto;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.05);">
      
      <!-- Header -->
      <tr>
        <td style="background:#4f46e5;padding:20px;text-align:center;color:#ffffff;">
          <h2 style="margin:0;">Full Stack Project</h2>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:30px;text-align:center;">
          <h3 style="margin-bottom:10px;color:#333;">Verify Your Email</h3>
          <p style="color:#666;font-size:14px;margin-bottom:20px;">
            Use the OTP below to complete your verification. This code is valid for a short time.
          </p>

          <!-- OTP BOX -->
          <div style="display:inline-block;background:#f1f5f9;padding:15px 25px;border-radius:8px;margin:20px 0;">
            <span style="font-size:28px;letter-spacing:6px;font-weight:bold;color:#111;">
              ${otp}
            </span>
          </div>

          <p style="color:#999;font-size:12px;margin-top:20px;">
            If you did not request this, please ignore this email.
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f9fafb;padding:15px;text-align:center;font-size:12px;color:#888;">
          © ${new Date().getFullYear()} Full Stack Project. All rights reserved.
        </td>
      </tr>

    </table>
  </div>
  `,
        };
        await transporter.sendMail(mailOptions)
        return "otp sent successfully"

    } catch (error) {
      console.log(error)
       return "error sending email"
    }
}

module.exports = {sendOtpMail}