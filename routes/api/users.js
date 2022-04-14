const express = require("express");
const usersCntrl = require("../../controllers/users");
const router = express.Router();

const auth = require("../../middleWare/auth");

// // Users Routes // //

//@route --get api/users
//@description --get all users
//@access --protected
router.get("/", auth, usersCntrl.getAllUsers);


//@route --get api/users/posts
//@description --get all user's posts
//@access --protected
router.get("/posts/:id", auth, usersCntrl.getUserPosts);

//@route --get api/users
//@description --get users in a company
//@access --protected
router.get("/colleagues", auth, usersCntrl.getCompanyUsers);

//@route get --api/users/:id
//@description --get users in a company with limit of 5
//@access --protected
router.get("/colleagues/limit", auth, usersCntrl.getColleagues);

//@route get --api/users/:search
//@description --search for all users
//@access --protected
router.get("/search", auth, usersCntrl.searchUser);

//@route get--api/users/clear_notifications
//@description --clear user's notifications
//@access --protected
router.get("/clear_notifications", auth, usersCntrl.clearNotfications);

//@route get--api/users/clear_just_created
//@description --clear user's just_created
//@access --protected
router.get("/clear_just_created", auth, usersCntrl.clearJustCreated);


//@route get--api/users/save
//@description --save a user item
//@access --protected
router.post('/save', auth, usersCntrl.saveItem)

//@route get --api/users/:id
//@description --get user's profile
//@access --protected
router.get("/:id", auth, usersCntrl.userProfile);

//@route post --api/users/:id
//@description --change user data
//@access --protected
router.post("/:id", auth, usersCntrl.settings);

//@route delete --api/users/
//@description --remove a user
//@access --protected
router.delete("/", auth, usersCntrl.removeUser);

module.exports = router;
