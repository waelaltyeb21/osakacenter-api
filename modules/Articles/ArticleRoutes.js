const { isAuthenticated } = require("../../middlewares/Auth");
const { upload } = require("../../services/UploadFiles");
const {
  GetArticles,
  GetArticle,
  CreateArticle,
  UpdateArticle,
  DeleteArticle,
} = require("./ArticleController");

const ArticlesRoutes = require("express").Router();

ArticlesRoutes.get("/", GetArticles);
ArticlesRoutes.get("/:id", GetArticle);

// Routes Require Authenticate
ArticlesRoutes.post(
  "/create",
  [isAuthenticated, upload.single("article")],
  CreateArticle
);
ArticlesRoutes.put(
  "/update/:id",
  [isAuthenticated, upload.single("article")],
  UpdateArticle
);

ArticlesRoutes.delete("/delete/:id", isAuthenticated, DeleteArticle);

module.exports = ArticlesRoutes;
