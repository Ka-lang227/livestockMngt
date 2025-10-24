const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const isProduction = process.env.NODE_ENV === 'production';

  const transporter = nodemailer.createTransport({
    host: isProduction ? process.env.EMAIL_HOST_PROD : process.env.EMAIL_HOST_DEV,
    port: isProduction ? process.env.EMAIL_PORT_PROD : process.env.EMAIL_PORT_DEV,
    secure: true,
    auth: {
      user: isProduction ? process.env.EMAIL_USERNAME_PROD : process.env.EMAIL_USERNAME_DEV,
      pass: isProduction ? process.env.EMAIL_PASSWORD_PROD : process.env.EMAIL_PASSWORD_DEV,
    },
  });

  const mailOptions = {
    from: isProduction ? process.env.EMAIL_FROM_PROD : process.env.EMAIL_FROM_DEV,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<div style="font-family:Arial,sans-serif;line-height:1.6">
      <h2>${options.subject}</h2>
      <p>${options.message.replace(/\n/g, '<br>')}</p>
    </div>`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
