const nodemailer = require('nodemailer');

const sendMail = async options => {
  // CREATE TRANSPORT
  const transport = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASSWORD
    }
  });

  // SET OPTIONS
  const option = {
    from: 'Rakesh Chandra Dash <rakeshchandra.offcl>',
    to: options.to,
    subject: options.subject,
    text: options.message
  };

  // SEND MAIL
  await transport.sendMail(option);
};

module.exports = sendMail;
