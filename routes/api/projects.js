// Routes  Containing actions needed by Posts

const express = require("express");
const Project = require("../../models/Project");
const auth = require("../../middleWare/auth");
const projectsController = require("../../controllers/projects");

const router = express.Router();

// // Projects Routes // //

//@route --post api/projects/
//@description --Make a New Project
//@access --private
router.post("/", auth, projectsController.createProject);

//@route-- get api/projects/:id
//@description --Find a Project
//@access --private
router.get("/:id", auth, projectsController.findProject);

//@route-- delete api/projects/:id
//@description --Delete an Existing Project
//@access --private
router.delete("/:id", auth, projectsController.deleteProject);

//@route --patch api/projects/:id
//@description --Perform actions on projects like adding and removing likes, adding and deleting comments
//@access --private
router.patch("/:id", auth, projectsController.updateProject);

//@route --patch api/projects/
//@description --Get projects
//@access --private
router.get("/", auth, projectsController.getProjects);

module.exports = router;
