const Post = require("../../models/Post");
const User = require("../../models/User");

// // Posts Controllers // //

//creates new post
exports.createPost = (req, res) => {
  if (req.body.isAnnouncement) {
    Post.updateMany(
      { company: req.user.company },
      { $set: { isAnnouncement: false } },
      { new: true },
      (err, info) => {
        if (err) {
          console.log(err)
        }
        console.log(info)
      }
    )
  }
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
      let count
      Post.countDocuments({ company: req.user.company }, (err, postCount) => count = postCount);
      Post.find({ company: req.user.company })
        .populate("author")
        .populate("comments.commenter")
        .sort({ isAnnouncement: -1, timestamp: -1 })
        .limit(Number(req.query.limit))
        .then(posts => res.status(200).json({ count, posts }))
        .catch(err => res.status(400).json(err));
    })
    .catch(err => res.status(400).json(err));
};

//get posts
exports.getPosts = (req, res) => {
  console.log('here')
  let count
  Post.countDocuments({ company: req.user.company }, (err, postCount) => count = postCount);
  Post.find({ company: req.user.company })
    .populate("author")
    .populate("comments.commenter")
    .sort({ isAnnouncement: -1, timestamp: -1 })
    .limit(Number(req.query.limit))
    .then(posts => res.status(200).json({ count, posts }))
    .catch(err => res.status(400).json(err));
}

//find post
exports.findPost = (req, res) => {
  Post.findById(req.params.id)
    .populate("author")
    .populate("comments.commenter")
    .sort({ isAnnouncement: -1, timestamp: -1 })
    .then(post => res.status(200).json(post))
    .catch(err => res.status(400).json(err));
};

//deletes post
exports.deletePost = (req, res) => {
  Post.findByIdAndDelete(
    req.params.id,
    () => {
      let count
      Post.countDocuments({ company: req.user.company }, (err, postCount) => count = postCount);
      Post.find({ company: req.user.company })
        .populate("author")
        .populate("comments.commenter")
        .sort({ isAnnouncement: -1, timestamp: -1 })
        .limit(Number(req.query.limit))
        .then(posts => res.status(200).json({ count, posts }))
        .catch(err => res.status(400).json(err));
    }
  )
};

//update post
exports.updatePost = (req, res) => {
  const { id } = req.params;

  //Perform the like action
  if (req.body.action === "like") {
    return Post.findByIdAndUpdate(
      id,
      {
        $addToSet: {
          likers: req.user._id
        }
      },
      { new: true },
      (err, post) => {
        if (err) return res.status(400).json(err);
        const notification = {
          type: "like",
          title: "New like",
          body: `${req.user.firstName} ${req.user.lastName} just liked your post`,
          time: Date.now(),
          link: `/post/${post._id}`
        }
        if (req.user._id.toString() !== post.author.toString()) {
          User.findByIdAndUpdate(
            post.author,
            { $push: { notifications: notification } },
            { new: true },
            (err, data) => console.log(err, data)
          )
        }
        let count
        Post.countDocuments({ company: req.user.company }, (err, postCount) => count = postCount);
        Post.find({ company: req.user.company })
          .populate("author")
          .populate("comments.commenter")
          .sort({ isAnnouncement: -1, timestamp: -1 })
          .limit(Number(req.query.limit))
          .then(posts => res.status(200).json({ count, posts }))
          .catch(err => res.status(400).json(err));
      }
    );
  }

  //Perform the unlike action
  if (req.body.action === "unlike") {
    return Post.findByIdAndUpdate(
      id,
      {
        $pull: {
          likers: req.user._id
        }
      },
      { new: true },
      (err, post) => {
        if (err) return res.status(400).json(err);
        let count
        Post.countDocuments({ company: req.user.company }, (err, postCount) => count = postCount);
        Post.find({ company: req.user.company })
          .populate("author")
          .populate("comments.commenter")
          .sort({ isAnnouncement: -1, timestamp: -1 })
          .limit(Number(req.query.limit))
          .then(posts => res.status(200).json({ count, posts }))
          .catch(err => res.status(400).json(err));
      }
    );
  }

  //Perform the comment action
  if (req.body.action === "addComment") {
    return Post.findByIdAndUpdate(
      id,
      {
        $push: {
          comments: {
            commenter: req.body.commenterId,
            text: req.body.text,
            timestamp: new Date().getTime()
          }
        }
      },
      { new: true },
      (err, post) => {
        if (err) return res.status(400).json(err);
        const notification = {
          type: "comment",
          title: "New comment",
          body: `${req.user.firstName} ${req.user.lastName} commented on your post`,
          time: Date.now(),
          link: `/post/${post._id}`
        }

        if (req.user._id.toString() !== post.author.toString()) {
          User.findByIdAndUpdate(
            post.author,
            { $push: { notifications: notification } },
            { new: true },
            (err, data) => console.log(err, data)
          )
        }
        let count
        Post.countDocuments({ company: req.user.company }, (err, postCount) => count = postCount);
        Post.find({ company: req.user.company })
          .populate("author")
          .populate("comments.commenter")
          .sort({ isAnnouncement: -1, timestamp: -1 })
          .limit(Number(req.query.limit))
          .then(posts => res.status(200).json({ count, posts }))
          .catch(err => res.status(400).json(err));
      }
    );
  }

  //Perform the delete comment action
  if (req.body.action === "deleteComment") {
    return Post.findByIdAndUpdate(
      id,
      {
        $pull: {
          comments: {
            _id: req.body.commentId
          }
        }
      },
      { new: true },
      (err, post) => {
        if (err) return res.status(400).json(err);
        let count
        Post.countDocuments({ company: req.user.company }, (err, postCount) => count = postCount);
        Post.find({ company: req.user.company })
          .populate("author")
          .populate("comments.commenter")
          .sort({ isAnnouncement: -1, timestamp: -1 })
          .limit(Number(req.query.limit))
          .then(posts => res.status(200).json({ count, posts }))
          .catch(err => res.status(400).json(err));
      }
    );
  }
};
