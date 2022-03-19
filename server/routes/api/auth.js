const express = require("express");
const router = express.Router();
const auth = require("../../middleWare/auth");
const authController = require("../../controllers/auth/auth");

//Route for Authentications


//@route --post api/auth/authenticate
//@description --Authenticate user and return user's data
//@access --public
router.get("/authenticate", auth, authController.auth);

//@route --post api/auth
//@description --Authenticate user before login
//@access --public
router.post("/login", authController.login);

//@route --post api/auth/register
//@description --register a new user
//@access --public
router.post("/register", authController.register);

module.exports = router;
