const { isAuthenticated } = require("../../middlewares/Auth");
const {
  GetGroups,
  GetGroup,
  CreateGroup,
  UpdateGroup,
  DeleteGroup,
  GetGroupStudents,
} = require("./GroupController");

const GroupRoutes = require("express").Router();

GroupRoutes.get("/", GetGroups);
GroupRoutes.get("/:id", GetGroup);
GroupRoutes.get("/group-students/:id", GetGroupStudents);

// Routes Require Authenticate
GroupRoutes.post("/create", isAuthenticated, CreateGroup);
GroupRoutes.put("/update/:id", isAuthenticated, UpdateGroup);
GroupRoutes.delete("/delete/:id", isAuthenticated, DeleteGroup);

module.exports = GroupRoutes;
