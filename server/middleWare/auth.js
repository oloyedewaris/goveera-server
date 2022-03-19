//MiddleWare for Authenticating Routes before giving necessary access

const jwt = require("jsonwebtoken");
const User = require("../models/User");

function auth(req, res, next) {
  const token = req.header("x-auth-token");

  //Check for token
  if (!token)
    return res
      .status(401)
      .send("No token, you don't have access to this route");

  try {
    //Validate token
    jwt.verify(token, "waris", (err, decode) => {
      if (err) throw err;
      //Passing user information from authentication
      User.findById(decode.id)
        .populate('company')
        .then(user => {
          req.user = user;
          next();
        })
        .catch(err => res.status(400).json(err));
    });
  } catch (e) {
    res.status(401).send("Invalid token");
  }
}

module.exports = auth;
