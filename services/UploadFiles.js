const multer = require("multer");
const FILE_LIMIT = 20;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("File: ", file);
    if (file.mimetype.startsWith("image/")) {
      if (file.fieldname === "magazine") {
        cb(null, "uploads/images/magazines");
      } else if (file.fieldname === "article") {
        cb(null, "uploads/images/articles");
      } else if (file.fieldname === "cover") {
        cb(null, "uploads/images/courses");
      } else {
        cb(null, "uploads/images");
      }
    } else if (file.mimetype === "application/pdf") {
      cb(null, "uploads/documents");
    } else {
      cb(null, false);
    }
  },
  filename: (req, file, cb) => {
    const fileName = `${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({
  storage: storage,
  // limits: {
  //   fileSize: 1024 * 1024 * FILE_LIMIT,
  // },
});

module.exports = {
  upload,
};
