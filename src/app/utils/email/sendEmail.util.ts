import nodemailer from 'nodemailer';

import config from '../../../configs';

export const sentEmailUtility = async (
  emailTo: string,
  EmailSubject: string,
  EmailHTML?: string,
) => {
  const transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.secure,
    auth: {
      user: config.mail.auth.user,
      pass: config.mail.auth.pass,
    },
  });

  await transporter.verify(); // 🔍 debug helper

  const mailOptions = {
    from: config.mail.email,
    to: emailTo,
    subject: EmailSubject,
    html: EmailHTML,
  };

  return await transporter.sendMail(mailOptions);
};
