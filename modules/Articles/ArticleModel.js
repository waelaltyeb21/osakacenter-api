const { default: mongoose } = require("mongoose");

const ArticleSchema = new mongoose.Schema({
  title: {
    type: String, // Title of the article
    required: true,
  },
  content: {
    type: Object, // Content of the article
    required: true,
  },
  imageUrl: {
    type: String, // URL of the article image
    // required: true,
  },
  likes: {
    type: Number, // Number of likes for the article
    default: 0,
  },
  level: {
    type: String, // Level of the article (e.g., beginner, intermediate, advanced)
    required: true,
  },
  courseID: {
    type: mongoose.SchemaTypes.ObjectId, // Reference to CourseModel
    ref: "courses",
    required: true,
  },
  publishedBy: {
    type: mongoose.SchemaTypes.ObjectId, // Reference to the user who published the article
    ref: "supervisors",
    required: true,
  },
  publishDate: {
    type: Date, // Date when the article was created
    default: Date.now,
  },
});

const ArticleModel = mongoose.model("articles", ArticleSchema);
module.exports = ArticleModel;
