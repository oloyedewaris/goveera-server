const Project = require("../models/Project");
const User = require("../models/User");

// // Projects Controllers // //

//creates new project
exports.createProject = (req, res) => {
  const { title, description, budget, timeFrame, tasks } = req.body;
  const arrayTasks = [];
  tasks.forEach(task => arrayTasks.push({ taskName: task }))

  const newProject = new Project({
    company: req.user.company,
    initiator: req.user._id,
    title,
    description,
    budget,
    timeFrame,
    tasks: arrayTasks,
    postedTime: Date.now(),
    timestamp: new Date().getTime()
  });
  newProject
    .save()
    .then(project => {
      project.populate(["initiator", "comments.commenter"]).execPopulate()
        .then(project => res.status(200).json({ success: true, project }))
        .catch(err => res.status(400).json(err));
    })
    .catch(err => res.status(400).json(err));

};

exports.getProjects = (req, res) => {
  let count
  Project.countDocuments({ company: req.user.company }, (err, projectCount) => count = projectCount);
  Project.find({ company: req.user.company })
    .populate("initiator")
    .populate("comments.commenter")
    .sort({ timestamp: -1 })
    .limit(Number(req.query.limit))
    .then(projects => res.status(200).json({ count, projects }))
    .catch(err => res.status(400).json(err));
}

//find project
exports.findProject = (req, res) => {
  Project.findById(req.params.id)
    .populate("initiator")
    .populate("comments.commenter")
    .exec()
    .then(project => res.status(200).json({ success: true, project }))
    .catch(err => res.status(400).json(err));
};

//deletes project
exports.deleteProject = (req, res) => {
  Project.findByIdAndDelete(
    req.params.id,
    (err, project) => {
      if (err) return res.status(400).json({ success: false, err })
      res.status(200).json({ success: true, deletedProject: project })
    }
  );
};

//update project
exports.updateProject = (req, res) => {
  const { id } = req.params;

  //Perform the support action
  if (req.body.action === "support") {
    Project.findByIdAndUpdate(id, { $addToSet: { supporters: req.user._id } }, { new: true })
      .populate("initiator")
      .populate("comments.commenter")
      .exec()
      .then(project => {
        if (req.user._id.toString() !== project.initiator._id.toString()) {
          const notification = {
            type: "support",
            title: "New support",
            body: `${req.user.firstName} ${req.user.lastName} supported your project`,
            time: Date.now(),
            link: `/project/${project._id}`
          }
          User.findByIdAndUpdate(
            project.initiator,
            { $push: { notifications: notification } },
            { new: true },
            (err, data) => {
              if (err) throw err
            }
          )
        }
        return res.status(200).json({ success: true, project })
      })
      .catch(err => res.status(400).json(err))
  }

  //Perform the unsupport action
  if (req.body.action === "unsupport") {
    Project.findByIdAndUpdate(id, { $pull: { supporters: req.user._id } }, { new: true })
      .populate("initiator")
      .populate("comments.commenter")
      .then(project => res.status(200).json({ success: true, project }))
      .catch(err => res.status(400).json(err))
  }

  //Perform the oppose action
  if (req.body.action === "oppose") {
    Project.findByIdAndUpdate(id, { $addToSet: { opposers: req.user._id } }, { new: true })
      .populate("initiator")
      .populate("comments.commenter")
      .then(project => {
        if (req.user._id.toString() !== project.initiator._id.toString()) {
          const notification = {
            type: "support",
            title: "New support",
            body: `${req.user.firstName} ${req.user.lastName} opposed your project`,
            time: Date.now(),
            link: `/project/${project._id}`
          }
          User.findByIdAndUpdate(
            project.initiator,
            { $push: { notifications: notification } },
            { new: true },
            (err, data) => {
              if (err) throw err
            }
          )
        }
        return res.status(200).json({ success: true, project })
      })
      .catch(err => res.status(400).json(err))
  }

  //Perform the unoppose action
  if (req.body.action === "unoppose") {
    Project.findByIdAndUpdate(id, { $pull: { opposers: req.user._id } }, { new: true })
      .populate("initiator")
      .populate("comments.commenter")
      .then(project => res.status(200).json({ success: true, project }))
      .catch(err => res.status(400).json(err))
  }

  //Perform the add comment action
  if (req.body.action === "addComment") {
    Project.findByIdAndUpdate(
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
      .populate('initiator')
      .populate('comments.commenter')
      .exec()
      .then(project => {
        if (req.user._id.toString() !== project.initiator._id.toString()) {
          const notification = {
            type: "comment",
            title: "New comment",
            body: `${req.user.firstName} ${req.user.lastName} commented on your project`,
            time: Date.now(),
            link: `/project/${project._id}`
          }
          User.findByIdAndUpdate(
            project.initiator,
            { $push: { notifications: notification } },
            { new: true },
            (err, data) => {
              if (err) throw err
            }
          )
        }
        return res.status(200).json({ success: true, project })
      })
      .catch(err => res.status(400).json(err))
  }

  //Perform the delete comment action
  if (req.body.action === "deleteComment") {
    Project.findByIdAndUpdate(id, { $pull: { comments: { _id: req.body.commentId } } }, { new: true })
      .populate("initiator")
      .populate("comments.commenter")
      .exec()
      .then(project => res.status(200).json({ success: true, project }))
      .catch(err => res.status(400).json(err))
  }

  //Perform the update stage action
  if (req.body.action === "updateStage") {
    Project.findByIdAndUpdate(id, { $set: { projectStage: req.body.stage } }, { new: true })
      .populate("initiator")
      .populate("comments.commenter")
      .exec()
      .then(project => res.status(200).json({ success: true, project }))
      .catch(err => res.status(400).json(err))
  }

  //Perform the update task action
  if (req.body.action === "updateTask") {
    Project.findOneAndUpdate(
      { _id: id },
      { $set: { "tasks.$[elem].completed": true } },
      { new: true, arrayFilters: [{ "elem.taskName": req.body.taskName }] })
      .populate("initiator")
      .populate("comments.commenter")
      .exec()
      .then(project => res.status(200).json({ success: true, project }))
      .catch(err => res.status(400).json(err))
  }
};
