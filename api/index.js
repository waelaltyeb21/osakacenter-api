const express = require("express");
const app = express();
// Enviroment Variables
require("dotenv").config();

const limiter = require("../middlewares/RateLimiter");
const { default: helmet } = require("helmet");
const corsOptions = require("../config/Cors");
const { isAuthenticated } = require("../middlewares/Auth");
// Middleware
app.use(express.json());
app.use(corsOptions);
// protect against common attacks like XSS, clickjacking
app.use(helmet());

// Routes
const StudentRoutes = require("../modules/Student/StudentRoutes");
const CourseRoutes = require("../modules/Courses/CourseRoutes");
const GroupRoutes = require("../modules/Groups/GroupRoutes");
const Auth = require("../modules/Auth/authRoutes");
const ArticlesRoutes = require("../modules/Articles/ArticleRoutes");
const MagazineRoutes = require("../modules/Magazine/MagazineRoutes");
const SupervisorRoutes = require("../modules/Supervisors/SupervisorRoutes");
const path = require("path");
const ResultRoutes = require("../modules/Results/ResultRoutes");

// app.use("/api/v1/teachers");
app.use("/api/v1/students", StudentRoutes);
app.use("/api/v1/courses", CourseRoutes);
app.use("/api/v1/groups", GroupRoutes);
app.use("/api/v1/magazines", MagazineRoutes);
app.use("/api/v1/articles", ArticlesRoutes);
app.use("/api/v1/auth", limiter, Auth);
app.use("/api/v1/supervisors", isAuthenticated, SupervisorRoutes);
app.use("/api/v1/results", ResultRoutes);

// Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", async (req, res) => {
  return res.status(200).send({
    message: "Hello World",
  });
});

// Not Found Endpoint
// app.use((err, req, res, next) =>
//   res.status(404).json({ message: "Not Found!", error: err })
// );

module.exports = app;
// Connect To DataBase And Start The Server
require("../config/ConnectDB");
