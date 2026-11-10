const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"EVENTLY" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email berhasil dikirim:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Gagal mengirim email:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = { sendEmail };