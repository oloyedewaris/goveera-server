const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../../models/User");

//Converting javascript date to human understandable
const d = new Date();
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const weeks = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];
const date = `${weeks[d.getDay()]}, ${months[d.getMonth()]
  } ${d.getDate()} ${d.getFullYear()}`;


exports.registerUser = (req, res) => {
  let { firstName, lastName, email, password, role, company, position } = req.body;
  firstName.charAt(0).toUpperCase()
  lastName.charAt(0).toUpperCase()

  //send a notification to all other users
  const joinedNotification = {
    type: "welcome",
    title: "New user",
    body: `${firstName} ${lastName} just joined your company`,
    time: Date.now(),
    link: "/"
  }

  //notofication to welcome user
  const welcomeNotification = {
    type: "welcome",
    title: `Welcome ${firstName}`,
    body: "We are pleased to welcome you to Goveera, as we are looking forward to help your organization grow in terms of communications and interaction",
    time: Date.now(),
    link: "/home"
  }

  // Simple validation
  if (!firstName || !lastName || !email || !password || !role)
    return res.status(400).json("Please enter all field");

  if (password.length < 6)
    return res.status(400).json("Password should be up to six characters");

  if (role == 0 && !company)
    return res.status(400).json("Please choose a company");

  if (role == 0 && !position)
    return res.status(400).json("Please enter your position");

  //convert comapny's id to mongodb objectid
  if (company) {
    company = mongoose.Types.ObjectId(company)

    User.updateMany(
      { "company": company },
      { $push: { notifications: joinedNotification } },
      { new: true },
      (err, users) => {
        if (err) throw err
      }
    )
  }

  //Check for existing user
  User.findOne({ email }).then((user) => {
    if (user) return res.status(400).json("Email already exist");

    //Create a new user
    const newUser = new User({
      role,
      company,
      position,
      firstName,
      lastName,
      email,
      password,
      registeredAt: date,
      notifications: [welcomeNotification]
    });

    //Hash the user's password
    bcrypt.genSalt(10, (err, salt) => {
      if (err) throw err;
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser
          .save()
          .then((savedUser) => {
            //sign a jwt token
            jwt.sign({ id: savedUser._id }, "secrete", { expiresIn: 36000000 },
              (err, token) => {
                if (err) throw err;
                User.findById(savedUser._id)
                  .select("-password")
                  .populate('company')
                  .then((user) => res.status(201).json({ token, user }))
                  .catch(err => res.status(400).json({ msg: "failed to sign jwt", error: err }));
              }
            );
          })
          .catch(err => res.status(400).json({ msg: "failed to hash password", error: err }));
      });
    });
  });

};
