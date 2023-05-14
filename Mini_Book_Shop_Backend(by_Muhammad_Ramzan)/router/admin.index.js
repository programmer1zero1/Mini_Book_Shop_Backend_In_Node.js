let express = require("express");
let router = express.Router();

let adminController = require("../controllers/admin.controller");
//chek if the user is logged in or not
let { auth } = require("../middleware/auth");

//chek if the user role is user or admin
let { isAdmin } = require("../middleware/isAdmin");

router.post("/addBook", auth, isAdmin, adminController.addBook);
router.get("/getupdateBook", auth, isAdmin, adminController.getupdateBook);
router.put("/updateBook", auth, isAdmin, adminController.updateBook);
router.delete("/deleteBook", auth, isAdmin, adminController.delegteBook);

router.get("/getsaleReport", auth, isAdmin, adminController.getsaleReport);

router.get("/userAll", auth, isAdmin, adminController.getallUsers);
router.get("/userBlocked", auth, isAdmin, adminController.getuserBlocked);
router.post("/userBlocked", auth, isAdmin, adminController.userBlocked);

module.exports = router;
