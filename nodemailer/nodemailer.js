const nodemailer = require("nodemailer");

const sendMail = async (email, user, str) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "hotmail",

      auth: {
        user: `${process.env.EMAIL}`,
        pass: '321a@#S123',
      },
    });

    await transporter.sendMail({
      from: `${process.env.EMAIL}`,
      to: email,
      subject: "Reset Password Request",
      html: `<div>
                         <h1>Hello, ${user.username}, </h1>
                         <p>
                           Please enter the below OTP into your email verification page
                         </p>
                         <h1>
                           ${str}
                         </h1>
                       </div>`,
    });
    console.log("Email has been sent");
  } catch (err) {
    console.log(err);
  }
};
module.exports = sendMail;
