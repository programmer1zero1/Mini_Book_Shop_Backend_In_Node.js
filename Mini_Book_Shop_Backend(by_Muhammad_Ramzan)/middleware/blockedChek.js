let registerScheme = require("../models/userRegister");

let blockedChek = async (req, res, next) => {
  try {
    let uid = req.user;
    let Blocked = await registerScheme.find({ _id: uid });
    if (Blocked[0].isBlocked === "false") {
      next();
    } else {
      return res.json({ msg: "You Are Blocked By Admin" });
    }
  } catch (error) {
    return res.json({ msg: error.message });
  }
};

module.exports = { blockedChek };
