let express = require("express");
const registerScheme = require("./models/userRegister");
const jwt = require("jsonwebtoken");
let mongoDB = require("./database/connection");
let cors = require("cors");
let app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("./uploads"));
app.use(cors());
require("dotenv").config();
let mrgn = require("morgan");
var validator = require("validator");
let bcrypt = require("bcrypt");
let userRouter = require("./router/user.index");
let adminRouter = require("./router/admin.index");

let port = process.env.PORT;

//log request
app.use(mrgn("dev"));

//User Routes Path
app.use("/user", userRouter);
//admin Routes Path
app.use("/admin", adminRouter);

//Login/Logout Complete Module
//For Registration
app.post("/register", async (req, res) => {
  try {
    let { pname, email, password, cpassword } = req.body;
    if (!pname) {
      return res.json({ msg: "Provide pname in the body" });
    }
    if (!email) {
      return res.json({ msg: "Provide email in the body" });
    }
    if (!password) {
      return res.json({ msg: "Provide password in the body" });
    }
    if (!cpassword) {
      return res.json({ msg: "Provide cpassword in the body" });
    }
    if (validator.isEmail(email)) {
      const existingUser = await registerScheme.findOne({ email });
      if (!existingUser) {
        if (pname.length > 3) {
          if (password === cpassword) {
            let salt = await bcrypt.genSalt(10);
            let hashPassword = await bcrypt.hash(password, salt);
            let data = new registerScheme({
              pname,
              email,
              password,
              cpassword,
            });
            data.password = hashPassword;
            data.cpassword = hashPassword;
            let token = jwt.sign(
              { userId: data._id },
              process.env.SECRET_KEY,
              process.env.OPTIONS,
              {
                expiresIn: "1h",
                algorithm: "HS256",
              }
            );
            data.isVerified = "false";
            data.token = token;
            data.role = "user";
            data.isBlocked = "false";
            if (email) {
              let result = data.save();
              return res.status(201).json({
                msg: "Use this token to verify youself,Your Verification Token is",
                token,
              });
            } else {
              return res.json({
                msg: "The is Some Error during Registering You",
              });
            }
          } else {
            return res.json({ msg: "Password Doess not Match!!!" });
          }
        } else {
          return res.json({ msg: "Provide Name With length greater than 3" });
        }
      } else {
        return res.json({ msg: "Email Already Exists" });
      }
    } else {
      return res.json({ msg: "Provide A Valid Email" });
    }
  } catch (error) {
    return res.json({ msg: error.message });
  }
});

//email verification
app.get("/verify", async (req, res) => {
  try {
    let token = req.query.token;
    if (!token) {
      return res.json({
        msg: "Provie token in query param with the name token created at registration time",
      });
    }
    let user = await registerScheme.findOne({ token: token });
    if (user) {
      user.isVerified = "true";
      user.token = "null";
      let result = await user.save();
      return res.json({ msg: "Congratulation...You Email Is Verified" });
    } else {
      return res.json({
        msg: "Provided Token cannot be vefied,please provide the correct token",
      });
    }
  } catch (error) {
    return res.json({ msg: error.message });
  }
});

//login user
app.post("/loginuser", async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email) {
      return res.json({ msg: "Provie email in the body" });
    }
    if (!password) {
      return res.json({ msg: "Provie password in the body" });
    }
    if (validator.isEmail(email)) {
      let user = await registerScheme.findOne({ email: email });
      if (user) {
        if (user.isVerified === "true") {
          let token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.SECRET_KEY,
            {
              expiresIn: "1d",
              algorithm: "HS256",
            }
          );
          let hashPassword = await bcrypt.compare(password, user.password);
          if (hashPassword) {
            return res.json({
              msg: "successfully Login,please use the below token in headers without bearer",
              token,
              whatrole: user.role,
            });
          } else {
            return res.json({ msg: "invalid email or password" });
          }
        } else {
          return res.json({ msg: "your email is not verified" });
        }
      } else {
        return res.json({ msg: "you are not a registerd user" });
      }
    } else {
      return res.json({ msg: "Provide A Valid Email" });
    }
  } catch (error) {
    return res.json({ msg: error.message });
  }
});

//Passwor created
let codeToVerify = process.env.CODE_TO_VERIFY;

function createPassword() {
  try {
    codeToVerify = Math.floor(Math.random() * 696263);
    setTimeout(() => {
      codeToVerify = null;
    }, 60000);
  } catch (error) {
    return res.json({ msg: error.message });
  }
}

//Forgot Password
app.post("/forgotuser", async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) {
      return res.json({ msg: "Provie email in the body" });
    }
    if (validator.isEmail(email)) {
      let user = await registerScheme.findOne({ email: email });
      if (user) {
        var id = user._id;
        if (user.isVerified === "true") {
          createPassword();
          return res.status(201).json({
            msg: "Use this id and code to verify youself,Your Verification code and userid is",
            codeToVerify,
            id,
          });
        } else {
          return res.status(201).json({ msg: "Email Not Verfied yet" });
        }
      } else {
        return res.json({ msg: "you are not a registered user" });
      }
    } else {
      return res.json({ msg: "Provide A Valid Email" });
    }
  } catch (error) {
    return res.json({ msg: error.message });
  }
});

// reset password
app.patch("/reset", async (req, res) => {
  try {
    const id = req.query.userid;
    let { code } = req.body;
    const password = req.body.password;
    const cpassword = req.body.cpassword;

    if (!id) {
      return res.json({
        msg: "Provie userid in query param with the name userid",
      });
    }
    if (!code) {
      return res.json({ msg: "Provie code in the body " });
    }
    if (!password) {
      return res.json({ msg: "Provie password in the body " });
    }
    if (!cpassword) {
      return res.json({ msg: "Provie cpassword in the body" });
    }

    if (codeToVerify === Number(code)) {
      if (password === cpassword) {
        const hashPassword = await bcrypt.hash(password, 10);
        let result = await registerScheme.updateOne(
          { _id: id },
          {
            $set: {
              password: hashPassword,
              cpassword: hashPassword,
            },
          }
        );
        return res.json({ msg: "Password  Is Updated" });
      } else {
        return res.json({ msg: "Password Doess not Match!!!" });
      }
    } else if (codeToVerify === process.env.codeToVerify) {
      return res.json({ msg: "Password Not Created" });
    } else if (codeToVerify === null) {
      return res.json({ msg: "Password Expired" });
    } else {
      return res.json({
        msg: "code or token does not matced,Resend Again or check code or token again",
      });
    }
  } catch (error) {
    return res.json({ msg: error.message });
  }
});



const start = async () => {
  try {
      await mongoDB();
      app.listen(port, () => {
      console.log(`Server is listening on http://localhost:${port}`);
      });
  } catch (error) {
      console.log(error);
      console.log("Failed to connect to the database, server is not running.");
  }
};

start();