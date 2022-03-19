// Routes  Containing actions needed by Posts

const express = require("express");
const Post = require("../../models/Post");
const auth = require("../../middleWare/auth");
const postsController = require("../../controllers/posts/posts");

const router = express.Router();

// // Posts Routes // //

//@route --post api/posts/create
//@description --Make a New Post
//@access --private
router.post("/", auth, postsController.createPost);

//@route-- find api/posts/:id
//@description --Find a post
//@access --private
router.get("/:id", auth, postsController.findPost);

//@route-- delete api/posts/:id
//@description --Delete an Existing Post
//@access --private
router.delete("/:id", auth, postsController.deletePost);

//@route --patch api/posts/:id
//@description --Perform actions on posts like adding and removing likes, adding and deleting comments
//@access --private
router.patch("/:id", auth, postsController.updatePost);

//@route --get api/posts/
//@description --Get posts
//@access --private
router.get("/", auth, postsController.getPosts);

module.exports = router;
