const jwt = require("jsonwebtoken");
let registerScheme = require("../models/userRegister");
//to get current user midddleware
const auth = async (req, res, next) => {
  let token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ msg: "Authorization token is missing" });
  }

  try {
    let { userId } = jwt.verify(token, process.env.SECRET_KEY, {
      ignoreExpiration: false,
    });

    iduser = await registerScheme.findOne({ _id: userId }).select("_id");
    req.user = iduser;
    next();
  } catch (error) {
    return res.status(401).json({ msg: error.message });
  }
};

module.exports = { auth };
