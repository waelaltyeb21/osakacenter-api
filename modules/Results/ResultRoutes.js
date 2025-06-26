const { isAuthenticated } = require("../../middlewares/Auth");
const {
  GetGroupResult,
  GetStudentResult,
  AddResult,
  AddGroupResult,
} = require("./ResultController");

const ResultRoutes = require("express").Router();

ResultRoutes.get("/group/:id", GetGroupResult);
ResultRoutes.get("/student/:id", GetStudentResult);

// Routes Require Authenticate
ResultRoutes.post("/add", isAuthenticated, AddResult);
ResultRoutes.post("/group-result", isAuthenticated, AddGroupResult);

module.exports = ResultRoutes;
