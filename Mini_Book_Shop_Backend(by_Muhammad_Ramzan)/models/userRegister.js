let mongoose = require("mongoose");

let registerSchema = new mongoose.Schema(
  {
    pname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    cpassword: {
      type: String,
      required: true,
    },
    isVerified: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    isBlocked: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

let registerScheme = mongoose.model("userRegisterData", registerSchema);

module.exports = registerScheme;
