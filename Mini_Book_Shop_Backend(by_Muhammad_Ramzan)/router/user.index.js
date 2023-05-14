let express = require("express");
let router = express.Router();

require("dotenv").config();

let userController = require("../controllers/user.controller");
//chek if the user is logged in or not
let { auth } = require("../middleware/auth");

//chek if the user is blocked or not
let { blockedChek } = require("../middleware/blockedChek");

router.get("/showBook", auth, userController.showBook);

router.post("/buyBook", auth, blockedChek, userController.buyBook);
router.get("/success", userController.success);
router.get("/cancel", userController.cancel);

router.get("/showSpecificBook", auth, blockedChek, userController.showSpecificBook);
router.get("/myBuiedBook", auth, blockedChek, userController.myBuiedBook);

module.exports = router;
