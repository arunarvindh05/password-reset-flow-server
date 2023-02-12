const mongoose = require("mongoose");

const OtpSchema = mongoose.Schema({
  otp: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("Otp", OtpSchema);
