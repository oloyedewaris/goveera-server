const Post = require("../models/Post");
const Poll = require("../models/Poll");
const Project = require("../models/Project");
const User = require("../models/User");

// // Posts Controllers // //


//creates new post
exports.createPost = (req, res) => {
  const newPost = new Post({
    company: req.user.company,
    author: req.user._id,
    text: req.body.text,
    isAnnouncement: req.body.isAnnouncement,
    postedTime: Date.now(),
    timestamp: new Date().getTime()
  });
  newPost
    .save()
    .then(post => {
      post.populate(["author", "comments.commenter"]).execPopulate()
        .then(post => res.status(200).json({ success: true, post }))
        .catch(err => res.status(400).json(err));
    })
    .catch(err => res.status(400).json(err));
};

//get posts
// exports.getPosts = (req, res) => {
//   let count
//   Post.countDocuments({ company: req.user.company }, (err, postCount) => count = postCount);
//   Post.find({ company: req.user.company })
//     .populate("author")
//     .populate("comments.commenter")
//     .sort({ timestamp: -1 })
//     .limit(Number(req.query.limit))
//     .then(posts => res.status(200).json({ count, posts }))
//     .catch(err => res.status(400).json(err));
// }

//get all posts
exports.getPosts = async (req, res) => {
  try {
    const postCount = await Post.countDocuments({ company: req.user.company });
    const pollCount = await Poll.countDocuments({ company: req.user.company });
    const projectCount = await Project.countDocuments({ company: req.user.company });
    const count = postCount + pollCount + projectCount
    const posts = await Post.find({ company: req.user.company })
      .populate("author")
      .populate("comments.commenter")
      .exec()
    const polls = await Poll.find({ company: req.user.company })
      .populate("surveyor")
      .populate("comments.commenter")
      .exec()
    const projects = await Project.find({ company: req.user.company })
      .populate("surveyor")
      .populate("comments.commenter")
      .exec()
    let allPosts = [...posts, ...polls, ...projects].sort((a, b) => (b.timestamp - a.timestamp))
    if (req.query.limit) {
      allPosts = allPosts.slice(0, Number(req.query.limit))
    }
    return res.status(200).json({ count, allPosts })
  } catch (err) {
    return res.status(400).json(err)
  }
}

//find post
exports.findPost = (req, res) => {
  Post.findById(req.params.id)
    .populate("author")
    .populate("comments.commenter")
    .sort({ timestamp: -1 })
    .exec()
    .then(post => res.status(200).json({ success: true, post }))
    .catch(err => res.status(400).json(err));
};

//deletes post
exports.deletePost = (req, res) => {
  Post.findByIdAndDelete(
    req.params.id,
    (err, post) => {
      if (err) return res.status(400).json({ success: false, err })
      res.status(200).json({ success: true, deletedPost: post })
    }
  )
};

//update post
exports.updatePost = (req, res) => {
  const { id } = req.params;

  //Perform the like action
  if (req.body.action === "like") {
    Post.findByIdAndUpdate(id, { $addToSet: { likers: req.user._id } }, { new: true })
      .populate("author")
      .populate("comments.commenter")
      .exec()
      .then(post => {
        if (req.user._id.toString() !== post.author._id.toString()) {
          const notification = {
            type: "like",
            title: "New like",
            body: `${req.user.firstName} ${req.user.lastName} just liked your post`,
            time: Date.now(),
            link: `/post/${post._id}`
          }
          User.findByIdAndUpdate(
            post.author,
            { $push: { notifications: notification } },
            { new: true },
            (err, data) => {
              if (err) throw err
            }
          )
        }
        return res.status(200).json({ success: true, post })
      })
      .catch(err => res.status(400).json(err))
  }

  //Perform the unlike action
  if (req.body.action === "unlike") {
    Post.findByIdAndUpdate(id, { $pull: { likers: req.user._id } }, { new: true })
      .populate("author")
      .populate("comments.commenter")
      .exec()
      .then(post => res.status(200).json({ success: true, post }))
      .catch(err => res.status(400).json(err))
  }

  //Perform the addComment action
  if (req.body.action === "addComment") {
    Post.findByIdAndUpdate(
      id,
      {
        $push: {
          comments: {
            commenter: req.body.commenterId,
            text: req.body.text,
            timestamp: new Date().getTime()
          }
        }
      }, { new: true })
      .populate("author")
      .populate("comments.commenter")
      .exec()
      .then(post => {
        if (req.user._id.toString() !== post.author._id.toString()) {
          const notification = {
            type: "comment",
            title: "New comment",
            body: `${req.user.firstName} ${req.user.lastName} commented on your post`,
            time: Date.now(),
            link: `/post/${post._id}`
          }
          User.findByIdAndUpdate(
            post.author,
            { $push: { notifications: notification } },
            { new: true },
            (err, data) => {
              if (err) throw err
            }
          )
        }
        return res.status(200).json({ success: true, post })
      })
      .catch(err => res.status(400).json(err))
  }

  //Perform the delete comment action
  if (req.body.action === "deleteComment") {
    Post.findByIdAndUpdate(id, { $pull: { comments: { _id: req.body.commentId } } }, { new: true })
      .populate("author")
      .populate("comments.commenter")
      .exec()
      .then(post => res.status(200).json({ success: true, post }))
      .catch(err => res.status(400).json(err))
  }
};
