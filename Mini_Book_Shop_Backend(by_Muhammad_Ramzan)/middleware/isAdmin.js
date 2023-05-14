const jwt = require("jsonwebtoken");
const firstscheme = require("../models/userRegister");
require("dotenv").config();

const isAdmin = async (req, res, next) => {
  try {
    let token = req.headers["authorization"];
    let decode = jwt.verify(token, process.env.SECRET_KEY);
    let role = decode.role;
    let user = decode.userId;
    if (role === "admin") {
      let roleinDB = await firstscheme.find({ _id: user });
      for (var i = 0; i < roleinDB.length; i++) {
        let dbRole = roleinDB[i].role;
        let role2 = process.env.CONTROL_ROLE;
        if (
          role === "admin" &&
          role === dbRole &&
          role2 === "admin" &&
          role2 === dbRole
        ) {
          next();
        } else {
          return res
            .status(401)
            .json({ msg: "You Are Not Authorized to access this resource" });
        }
      }
    } else {
      return res
        .status(401)
        .json({ msg: "You Are Not Authorized to access this resource" });
    }
  } catch (err) {
    return res
      .status(401)
      .json({ msg: "You are not authorized to access this resource." });
  }
};

module.exports = { isAdmin };
