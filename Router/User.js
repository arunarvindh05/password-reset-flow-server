const bcrypt = require("bcrypt");
const router = require("express").Router();
const User = require("../Model/User");
const sendMail = require("../nodemailer/nodemailer");
const Otp = require("../Model/Otp");

//creating random string;

function randomString() {
  let rndstring = "";
  let characters = "0123456789";
  let charactersLength = characters.length;

  for (let i = 0; i < 6; i++) {
    rndstring += characters.charAt(
      Math.floor(Math.random() * charactersLength)
    );
  }
  console.log(rndstring);
  return rndstring;
}

async function genSalt(password) {
  const salt = await bcrypt.genSalt(10);
  const hashedpassword = await bcrypt.hash(password, salt);
  return hashedpassword;
}
// Register User
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    return console.log(err);
  }
  if (existingUser) {
    return res
      .status(400)
      .json({ message: "User aleady exists! Login instead" });
  }
  try {
    const hashedPassword = await genSalt(password);

    const newUser = new User({
      username: username,
      email: email,
      password: hashedPassword,
    });
    const user = await newUser.save();
    res.status(200).json({ message: "Account created successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});
//login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let existingUser;

  try {
    existingUser = await User.findOne({ email });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid Credentials" });
    } else {
      return res
        .status(200)
        .json({ message: "Login Successfull", existingUser });
    }
  } catch (err) {
    if (!existingUser) {
      return res.status(404).json({
        message: "Couldn't find the User by this email",
      });
    }
  }
});

// forget password

router.post("/forgetpassword", async (req, res) => {
  const email = req.body.email;
  let existingUser;
  try {
    existingUser = await User.findOne({ email });
    console.log(existingUser);
  } catch (err) {
    return console.log(err);
  }

  if (!existingUser) {
    return res
      .status(404)
      .json({ message: "no email id found on this username" });
  }
  //sending random string through mail
  const newOtp = randomString();
  await sendMail(email, existingUser, newOtp);

  const OTP = new Otp({ otp: newOtp });
  try {
    await OTP.save();
    return res.status(201).json({
      message: "OTP created successfully && Email also sent",
      OTP,
      _id: existingUser._id,
    });
  } catch (err) {
    return console.log(err);
  }
});
// verifying the Otp

router.post("/otpverfication/:id", async (req, res) => {
  const _id = req.params.id;
  const otp = req.body.otp;
  let getOtpFromDb;
  try {
    getOtpFromDb = await Otp.findOne({ _id: _id });
  } catch (err) {
    console.log(err);
  }
  if (otp !== getOtpFromDb.otp) {
    return res.status(404).json({ message: "invalid Otp" });
  } else {
    await Otp.deleteOne({ _id: _id });
  }
  return res.status(200).json({ message: "email successfully verified" });
});
// reset password
router.post("/resetpassword/:id", async (req, res) => {
  const _id = req.params.id;
  const { password, confirmPassword } = req.body;

  if (password === confirmPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(hashedPassword);

    const updateUser = await User.findByIdAndUpdate(_id, {
      $set: { password: hashedPassword },
    });
    return res.json({ message: "Password changed successfully", updateUser });
  } else {
    return res.status(400).json({ message: "Incorrect password match" });
  }
});

module.exports = router;
