const { loginUser } = require("./login")
const { registerUser } = require("./register")

const authenticateUser = (req, res) => {
  if (req.user) return res.status(200).json({ user: req.user });
}

module.exports = {
  auth: authenticateUser,
  login: loginUser,
  register: registerUser
}