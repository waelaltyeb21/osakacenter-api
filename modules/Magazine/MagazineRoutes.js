const { isAuthenticated } = require("../../middlewares/Auth");
const { upload } = require("../../services/UploadFiles");
const {
  GetMagazines,
  GetMagazine,
  CreateMagazine,
  UpdateMagazine,
  DeleteMagazine,
  DownloadMagazine,
} = require("./MagazineController");

const MagazineRoutes = require("express").Router();

MagazineRoutes.get("/", GetMagazines);
MagazineRoutes.get("/:id", GetMagazine);
MagazineRoutes.get("/download/:id", DownloadMagazine);

// Routes Require Authenticate
MagazineRoutes.post(
  "/create",
  [isAuthenticated, upload.single("magazine")],
  CreateMagazine
);
MagazineRoutes.put("/update/:id", isAuthenticated, UpdateMagazine);
MagazineRoutes.delete("/delete/:id", isAuthenticated, DeleteMagazine);

module.exports = MagazineRoutes;
