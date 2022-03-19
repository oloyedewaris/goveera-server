const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");


exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  // Simple validation
  if (!email || !password)
    return res.status(400).json("Please enter all field");

  //Check for existing user
  User.findOne({ email })
    .populate('company')
    .then((user) => {
      if (!user) return res.status(400).json("Email not found");

      //Compare user's password
      bcrypt.compare(password, user.password).then((isMatch) => {
        if (!isMatch) return res.status(400).json("Invalid password");

        //Sign a jwt token
        jwt.sign({ id: user._id }, "waris", { expiresIn: 36000000 }, (err, token) => {
          if (err) throw err;
          res.status(200).json({ token, user });
        });
      });
    });
};