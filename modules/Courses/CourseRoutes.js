const { isAuthenticated } = require("../../middlewares/Auth");
const { upload } = require("../../services/UploadFiles");
const {
  GetCourses,
  GetCourse,
  CreateCourse,
  UpdateCourse,
  DeleteCourse,
} = require("./CourseController");

const CourseRoutes = require("express").Router();

CourseRoutes.get("/", GetCourses);
CourseRoutes.get("/:id", GetCourse);

// Routes Require Authenticate
CourseRoutes.post(
  "/create",
  [isAuthenticated, upload.single("cover")],
  CreateCourse
);
CourseRoutes.put(
  "/update/:id",
  [isAuthenticated, upload.single("cover")],
  UpdateCourse
);
CourseRoutes.delete("/delete/:id", isAuthenticated, DeleteCourse);

module.exports = CourseRoutes;
