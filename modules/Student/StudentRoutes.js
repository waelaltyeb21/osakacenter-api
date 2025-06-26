const { isAuthenticated } = require("../../middlewares/Auth");
const {
  GetStudents,
  GetStudentByID,
  CreateStudent,
  UpdateStudent,
  DeleteStudent,
  DeleteManyStudents,
} = require("./StudentController");

const StudentRoutes = require("express").Router();

StudentRoutes.get("/", GetStudents);
StudentRoutes.get("/:id", GetStudentByID);

// Routes Require Authenticate
StudentRoutes.post("/create", isAuthenticated, CreateStudent);
StudentRoutes.put("/update/:id", isAuthenticated, UpdateStudent);
StudentRoutes.delete("/delete/:id", isAuthenticated, DeleteStudent);
StudentRoutes.delete("/students", isAuthenticated, DeleteManyStudents);

module.exports = StudentRoutes;
