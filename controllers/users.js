const bcrypt = require("bcryptjs")
const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");
const Project = require("../models/Project");
const Poll = require("../models/Poll");


// // Users Controllers // //


//get all user's posts
exports.getUserPosts = async (req, res) => {
  const userId = req.params.id
  try {
    const postCount = await Post.countDocuments({ author: userId });
    const pollCount = await Poll.countDocuments({ surveyor: userId });
    const projectCount = await Project.countDocuments({ initiator: userId });
    const count = postCount + pollCount + projectCount
    const posts = await Post.find({ author: userId })
      .populate("author")
      .populate("comments.commenter")
      .exec()
    const polls = await Poll.find({ surveyor: userId })
      .populate("surveyor")
      .populate("comments.commenter")
      .exec()
    const projects = await Project.find({ initiator: userId })
      .populate("surveyor")
      .populate("comments.commenter")
      .exec()
    let allPosts = [...posts, ...polls, ...projects].sort((a, b) => (b.timestamp - a.timestamp))
    if (req.query.limit) {
      console.log(req.query.limit)
      allPosts = allPosts.slice(0, Number(req.query.limit))
    }
    return res.status(200).json({ count, allPosts })
  } catch (err) {
    return res.status(400).json(err)
  }
}

exports.getAllUsers = (req, res) => {
  let userCount
  User.countDocuments({}, (err, count) => userCount = count - 1)
  User.find()
    .select("-password")
    .populate('company')
    .limit(Number(req.query.limit))
    .then(users => {
      const filteredUsers = users.filter(user => req.user._id.toString() !== user._id.toString());
      return res.status(200).json({ count: userCount, users: filteredUsers })
    })
    .catch(err => res.status(400).json(err));
}

exports.getCompanyUsers = (req, res) => {
  let userCount
  User.countDocuments({ company: req.user.company }, (err, count) => userCount = count - 1);
  User.find({ company: req.user.company })
    .select("-password")
    .populate('company')
    .limit(Number(req.query.limit))
    .then(users => {
      const filteredUsers = users.filter(user => req.user._id.toString() !== user._id.toString());
      return res.status(200).json({ count: userCount, users: filteredUsers });
    })
    .catch(err => res.status(400).json(err));
};

exports.getColleagues = (req, res) => {
  User.find({ company: req.user.company })
    .select("-password")
    .populate('company')
    .limit(3)
    .then(users => {
      const filteredUsers = users.filter(
        user => req.user._id.toString() !== user._id.toString()
      );
      return res.status(200).json(filteredUsers);
    })
    .catch(err => res.status(400).json(err));
};

exports.searchUser = (req, res) => {
  User.find({ $text: { $search: req.query.text } })
    .select("-password")
    .populate('company')
    .then(users => res.status(200).json(users))
    .catch(err => {
      return res.status(400).json(err)
    });
}

exports.clearJustCreated = (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    { $set: { "justCreated": false } },
    { new: true, populate: { path: 'company' } },
    (err, user) => {
      if (err) return res.status(400).json(err)
      res.status(200).json(user)
    }
  )
}

exports.clearNotfications = (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    { $set: { "notifications.$[elem].viewed": true } },
    { new: true, arrayFilters: [{ "elem.viewed": false }], populate: { path: 'company' } },
    (err, user) => {
      if (err) return res.status(400).json(err)
      res.status(200).json(user)
    }
  )
}

exports.removeUser = (req, res) => {
  let objectId = mongoose.Types.ObjectId(req.query.userId);
  Post.deleteMany({ author: objectId }, () => {
    Project.deleteMany({ initiator: objectId }, () => {
      Poll.deleteMany({ surveyor: objectId }, () => {
        User.findByIdAndDelete(req.query.userId)
          .populate('company')
          .then(user => res.status(200).json({ deleted: true, deletedUser: user }))
          .catch(err => res.status(400).json({ deleted: false, err }))
      });
    });
  });
};

exports.saveItem = (req, res) => {
  const { type, link, title } = req.body


  if (req.body.action === 'save') {
    const item = {
      link,
      type,
      title,
      time: new Date().getTime()
    }

    User.findByIdAndUpdate(
      req.user._id,
      { $push: { saves: item } },
      { new: true, populate: { path: 'company' } },
      (err, user) => {
        if (err) return res.status(400).json(err)
        res.status(200).json(user)
      }
    )
  } else {
    User.findByIdAndUpdate(
      req.user._id,
      { $pull: { saves: { link } } },
      { new: true, populate: { path: 'company' } },
      (err, user) => {
        if (err) return res.status(400).json(err)
        res.status(200).json(user)
      }
    )
  }
}

exports.userProfile = (req, res) => {
  User.findById(req.params.id)
    .populate('company')
    .select("-password")
    .then(user => res.status(200).json(user))
    .catch(err => res.status(400).json(err));
};

exports.settings = (req, res) => {
  const userId = req.params.id;
  const Email = req.body.email;
  const FirstName = req.body.firstName;
  const LastName = req.body.lastName;
  const Bio = req.body.bio;
  const Password = req.body.password;
  const NewPassword = req.body.newPassword;
  const ProfilePic = req.body.profilePic


  if (!Password && !Email && !FirstName && !LastName && !Bio && !ProfilePic) {
    return res.status(400).json("Nothing to update");
  } else if (!Password) {
    return res.status(400).json("No Password");
  } else if (!Email && !FirstName && !LastName && !Bio && !NewPassword && !ProfilePic) {
    return res.status(400).json("Please complete all fields");
  }

  if (NewPassword && NewPassword.length < 6) {
    return res.status(400).json("Password should be at least six characters");
  }

  try {
    if (req.query.type === "dataChange") {
      bcrypt.compare(Password, req.user.password).then(isMatch => {
        if (!isMatch) {
          return res.status(400).json("Invalid password");
        } else {
          if (Email) {
            //Check for existing email
            User.findOne({ email: Email }).then(user => {
              if (user) {
                return res.status(400).json("Email already used");
              } else {
                //Update if doesnt exist before
                User.findByIdAndUpdate(
                  userId,
                  { $set: { email: Email } },
                  { new: true, upsert: true, populate: { path: 'company' } },
                  (err, user) => {
                    if (err) throw err;
                    res.status(200).json(user)
                  }
                );
              }
            });
          }

          if (FirstName && LastName) {
            User.findByIdAndUpdate(
              userId,
              { $set: { firstName: FirstName, lastName: LastName } },
              { new: true, upsert: true, populate: { path: 'company' } },
              (err, user) => {
                if (err) throw err;
                res.status(200).json(user)
              }
            );
          }

          if (Bio) {
            User.findByIdAndUpdate(
              userId,
              { $set: { bio: Bio } },
              { new: true, upsert: true, populate: { path: 'company' } },
              (err, user) => {
                if (err) throw err;
                res.status(200).json(user)
              }
            );
          }

          if (ProfilePic) {
            User.findByIdAndUpdate(
              userId,
              { $set: { image: ProfilePic } },
              { new: true, populate: { path: 'company' } },
              (err, user) => {
                if (err) return res.status(400).json(err)
                res.status(200).json(user)
              }
            )
          }
        }
      });

      if (!userId) {
        return res.status(404).json({ message: "User not found." });
      }
    } else if (req.query.type === "passwordChange") {
      bcrypt.compare(Password, req.user.password).then(isMatch => {
        if (!isMatch) {
          return res.status(400).json("Invalid password");
        } else {
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(NewPassword, salt, (err, hash) => {
              if (err) throw err;
              User.findByIdAndUpdate(
                userId,
                { $set: { password: hash } },
                { new: true, upsert: true, populate: { path: 'company' } },
                (err, user) => {
                  if (err) throw err;
                  res.status(200).json(user)
                }
              );
            });
          });
        }
      });
    }
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};
