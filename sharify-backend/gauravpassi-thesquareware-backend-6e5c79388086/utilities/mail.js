/* -----------------------------------------------------------------------
   * @ description : Here initialising nodemailer transport for sending mails.
----------------------------------------------------------------------- */


import config from './config';

import nodemailer from 'nodemailer';
const { smtpServer,smtpPort,smtpUser,smtpPass  } = config.get('smtp');

export const subjects = {
  userVerification: 'Verify Email',
  forgetPassword: 'Forgot Password'
};

export const sendMail = async data => {
  let mailFrom = await getEmail();

  let transport = nodemailer.createTransport({
    host: smtpServer,
    port: smtpPort,
    secure: false,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const message = {
    from: '"sharify" <'+mailFrom+'>',
    to: data.emails,
    subject: data.subject,
    text: "Hello, this is a test email!",
    html: data.body,
  };

  transport.sendMail(message, function(err, info) {
    if (err) {
      logger.info(err, "=== error")
    } else {
      logger.info(info, "=== info");
    }
  });
};

/* Get Email from settings in application */
const getEmail = async () => {
  // let user = await User.findOne({role: 3});
  // return user.email;
  return 'admin1@yopmail.com';
};