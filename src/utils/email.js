const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Check if production email is configured
  const hasProductionEmail = process.env.EMAIL_HOST_PROD && 
                             process.env.EMAIL_USERNAME_PROD;
  
  // Use production email only if explicitly configured, otherwise use dev
  const useProduction = process.env.NODE_ENV === 'production' && hasProductionEmail;
  
  console.log('📧 Email Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    useProduction,
    hasProductionEmail
  });

  const transporter = nodemailer.createTransport({
    host: useProduction ? process.env.EMAIL_HOST_PROD : process.env.EMAIL_HOST_DEV,
    port: useProduction ? process.env.EMAIL_PORT_PROD : process.env.EMAIL_PORT_DEV,
    auth: {
      user: useProduction ? process.env.EMAIL_USERNAME_PROD : process.env.EMAIL_USERNAME_DEV,
      pass: useProduction ? process.env.EMAIL_PASSWORD_PROD : process.env.EMAIL_PASSWORD_DEV
    }
  });

  const mailOptions = {
    from: useProduction ? process.env.EMAIL_FROM_PROD : process.env.EMAIL_FROM_DEV,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<div style="font-family:Arial,sans-serif;line-height:1.6">
      <h2>${options.subject}</h2>
      <p>${options.message.replace(/\n/g, '<br>')}</p>
    </div>`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('📧 Email sending failed:', {
      code: error.code,
      command: error.command,
      response: error.response,
      message: error.message
    });
    throw error;
  }
};

module.exports = sendEmail;