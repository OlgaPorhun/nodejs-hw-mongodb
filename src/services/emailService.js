import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendResetPasswordEmail = async (to, resetToken) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject: 'Password Reset Request',
    html: `<p>To reset your password, please click the following link: <a href="${process.env.APP_DOMAIN}/reset-password?token=${resetToken}">Reset Password</a></p>`,
  };

  await transporter.sendMail(mailOptions);
};
