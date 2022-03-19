const Poll = require("../../models/Poll");
const User = require("../../models/User");

// // Polls Controllers // //

//creates a new poll
exports.createPoll = (req, res) => {
  const { options, question } = req.body;
  const newPoll = new Poll({
    company: req.user.company,
    surveyor: req.user._id,
    options,
    question,
    postedTime: Date.now(),
    timestamp: new Date().getTime()
  });

  newPoll
    .save()
    .then(poll => {
      let count
      Poll.countDocuments({ company: req.user.company }, (err, pollCount) => count = pollCount);
      Poll.find({ company: req.user.company })
        .populate("surveyor")
        .populate("comments.commenter")
        // .populate("options.voters")
        .limit(Number(req.query.limit))
        .sort({ timestamp: -1 })
        .then(polls => res.status(200).json({ count, polls }))
        .catch(err => res.status(400).json(err));
    })
    .catch(err => res.status(400).json(err));
};

exports.getPolls = (req, res) => {
  let count
  Poll.countDocuments({ company: req.user.company }, (err, pollCount) => count = pollCount);
  Poll.find({ company: req.user.company })
    .populate("surveyor")
    .populate("comments.commenter")
    // .populate("options.voters")
    .limit(Number(req.query.limit))
    .sort({ timestamp: -1 })
    .then(polls => res.status(200).json({ count, polls }))
    .catch(err => res.status(400).json(err));
}

//deletes a poll
exports.deletePoll = (req, res) => {
  Poll.findByIdAndDelete(
    req.params.id,
    () => {
      let count
      Poll.countDocuments({ company: req.user.company }, (err, pollCount) => count = pollCount);
      Poll.find({ company: req.user.company })
        .populate("surveyor")
        .populate("comments.commenter")
        // .populate("options.voters")
        .limit(Number(req.query.limit))
        .sort({ timestamp: -1 })
        .then(polls => res.status(200).json({ count, polls }))
        .catch(err => res.status(400).json(err));
    }
  );
};

exports.updatePoll = (req, res) => {
  const { id } = req.params;

  if (req.body.action === "vote") {
    Poll.findOneAndUpdate(
      {
        _id: id,
        options: { $elemMatch: { optionName: req.body.optionName } }
      },
      {
        $addToSet: {
          "options.$[elem].voters": req.user._id
        }
      },
      { new: true, arrayFilters: [{ "elem.optionName": req.body.optionName }] },
      (err, poll) => {
        if (err) return res.status(400).json(err);

        const notification = {
          type: "vote",
          title: "New vote",
          body: `${req.user.firstName} ${req.user.lastName} voted in your poll`,
          time: Date.now(),
          link: `/poll/${poll._id}`
        }

        if (req.user._id.toString() !== poll.surveyor.toString()) {
          User.findByIdAndUpdate(
            poll.surveyor,
            { $push: { notifications: notification } },
            { new: true },
            (err, data) => console.log(err, data)
          )
        }
        let count
        Poll.countDocuments({ company: req.user.company }, (err, pollCount) => count = pollCount);
        Poll.find({ company: req.user.company })
          .populate("surveyor")
          .populate("comments.commenter")
          // .populate("options.voters")
          .limit(Number(req.query.limit))
          .sort({ timestamp: -1 })
          .then(polls => res.status(200).json({ count, polls }))
          .catch(err => res.status(400).json(err));
      }
    );
  }
  //Perform the like action
  if (req.body.action === "like") {
    return Poll.findByIdAndUpdate(
      id,
      {
        $addToSet: {
          likers: req.user._id
        }
      },
      { new: true },
      (err, poll) => {
        if (err) return res.status(400).json(err);
        const notification = {
          type: "like",
          title: "New like",
          body: `${req.user.firstName} ${req.user.lastName} just liked your poll`,
          time: Date.now(),
          link: `/poll/${poll._id}`
        }
        if (req.user._id.toString() !== poll.surveyor.toString()) {
          User.findByIdAndUpdate(
            poll.surveyor,
            { $push: { notifications: notification } },
            { new: true },
            (err, data) => console.log(err, data)
          )
        }
        let count
        Poll.countDocuments({ company: req.user.company }, (err, pollCount) => count = pollCount);
        Poll.find({ company: req.user.company })
          .populate("surveyor")
          .populate("comments.commenter")
          // .populate("options.voters")
          .limit(Number(req.query.limit))
          .sort({ timestamp: -1 })
          .then(polls => res.status(200).json({ count, polls }))
          .catch(err => res.status(400).json(err));
      }
    );
  }

  //Perform the unlike action
  if (req.body.action === "unlike") {
    return Poll.findByIdAndUpdate(
      id,
      {
        $pull: {
          likers: req.user._id
        }
      },
      { new: true },
      (err, poll) => {
        if (err) return res.status(400).json(err);

        let count
        Poll.countDocuments({ company: req.user.company }, (err, pollCount) => count = pollCount);
        Poll.find({ company: req.user.company })
          .populate("surveyor")
          .populate("comments.commenter")
          // .populate("options.voters")
          .limit(Number(req.query.limit))
          .sort({ timestamp: -1 })
          .then(polls => res.status(200).json({ count, polls }))
          .catch(err => res.status(400).json(err));
      }
    );
  }

  //Perform the comment action
  if (req.body.action === "addComment") {
    return Poll.findByIdAndUpdate(
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
      (err, poll) => {
        if (err) return res.status(400).json(err);
        const notification = {
          type: "comment",
          title: "New comment",
          body: `${req.user.firstName} ${req.user.lastName} commented on your poll`,
          time: Date.now(),
          link: `/poll/${poll._id}`
        }

        if (req.user._id.toString() !== poll.surveyor.toString()) {
          User.findByIdAndUpdate(
            poll.surveyor,
            { $push: { notifications: notification } },
            { new: true },
            (err, data) => console.log(err, data)
          )
        }
        let count
        Poll.countDocuments({ company: req.user.company }, (err, pollCount) => count = pollCount);
        Poll.find({ company: req.user.company })
          .populate("surveyor")
          .populate("comments.commenter")
          // .populate("options.voters")
          .limit(Number(req.query.limit))
          .sort({ timestamp: -1 })
          .then(polls => res.status(200).json({ count, polls }))
          .catch(err => res.status(400).json(err));
      }
    );
  }

  //Perform the delete comment action
  if (req.body.action === "deleteComment") {
    return Poll.findByIdAndUpdate(
      id,
      {
        $pull: {
          comments: {
            _id: req.body.commentId
          }
        }
      },
      { new: true },
      (err, poll) => {
        if (err) return res.status(400).json(err);
        let count
        Poll.countDocuments({ company: req.user.company }, (err, pollCount) => count = pollCount);
        Poll.find({ company: req.user.company })
          .populate("surveyor")
          .populate("comments.commenter")
          // .populate("options.voters")
          .limit(Number(req.query.limit))
          .sort({ timestamp: -1 })
          .then(polls => res.status(200).json({ count, polls }))
          .catch(err => res.status(400).json(err));
      }
    );
  }
};
