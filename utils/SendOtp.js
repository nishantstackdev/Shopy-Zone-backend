const nodemailer = require("nodemailer");

const getEmailAuth = () => {
    const user = (process.env.EMAIL_USER || "").trim().replace(/^"|"$/g, "");
    const pass = (process.env.EMAIL_PASS || "").trim().replace(/^"|"$/g, "").replace(/\s/g, "");
    return { user, pass };
};

const createTransporter = () => {
    const { user, pass } = getEmailAuth();

    return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user, pass },
    });
};

const sendOtpMail = async (toEmail, otp) => {
    const { user, pass } = getEmailAuth();

    try {
        if (!user || !pass) {
            console.error("SMTP error: EMAIL_USER or EMAIL_PASS not configured");
            return "error sending email";
        }

        const transporter = createTransporter();
        await transporter.sendMail({
            from: `"Shopy Zone" <${user}>`,
            to: toEmail,
            subject: "Verify Your Email - OTP",
            text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
            html: `
  <div style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial, sans-serif;">
    <table align="center" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:auto;background:#ffffff;border-radius:10px;overflow:hidden;">
      <tr>
        <td style="background:#4f46e5;padding:20px;text-align:center;color:#ffffff;">
          <h2 style="margin:0;">Shopy Zone</h2>
        </td>
      </tr>
      <tr>
        <td style="padding:30px;text-align:center;">
          <h3 style="margin-bottom:10px;color:#333;">Verify Your Email</h3>
          <p style="color:#666;font-size:14px;margin-bottom:20px;">
            Use the OTP below to complete your verification. This code is valid for 10 minutes.
          </p>
          <div style="display:inline-block;background:#f1f5f9;padding:15px 25px;border-radius:8px;margin:20px 0;">
            <span style="font-size:28px;letter-spacing:6px;font-weight:bold;color:#111;">
              ${otp}
            </span>
          </div>
        </td>
      </tr>
    </table>
  </div>
  `,
        });

        console.log("OTP email sent to:", toEmail);
        return "otp sent successfully";
    } catch (error) {
        console.error("SMTP error:", error.code, error.response, error.message);
        return "error sending email";
    }
};

module.exports = { sendOtpMail };
