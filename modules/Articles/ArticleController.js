const { default: mongoose } = require("mongoose");
const { CreateDoc, DeleteDoc, UpdateDoc } = require("../../lib/CrudOperations");
const ArticleModel = require("./ArticleModel");

const GetArticles = async (req, res) => {
  try {
    const articles = await ArticleModel.aggregate([
      {
        $lookup: {
          from: "courses",
          localField: "courseID",
          foreignField: "_id",
          as: "courses",
        },
      },
      {
        $unwind: "$courses",
      },
      {
        $lookup: {
          from: "supervisors",
          localField: "publishedBy",
          foreignField: "_id",
          as: "supervisors",
        },
      },
      {
        $unwind: "$supervisors",
      },
    ]);
    // Check If Articles Exists
    if (!articles)
      return res.status(400).json({ message: "No Articles Found" });

    return res.status(200).json({
      message: `${articles.length} Articles Found`,
      articles: articles,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const GetArticle = async (req, res) => {
  const { id } = req.params;
  try {
    const [article] = await ArticleModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "courseID",
          foreignField: "_id",
          as: "course",
        },
      },
      {
        $unwind: "$course",
      },
      {
        $lookup: {
          from: "supervisors",
          localField: "publishedBy",
          foreignField: "_id",
          as: "supervisor",
        },
      },
      {
        $unwind: "$supervisor",
      },
      {
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          content: { $first: "$content" },
          level: { $first: "$level" },
          imageUrl: { $first: "$imageUrl" },
          course: { $first: "$course.name" },
          publishedBy: { $first: "$supervisor.name" },
          publishDate: { $first: "$publishDate" },
        },
      },
    ]);
    // Check If Article Exists
    if (!article) return res.status(400).json({ message: "No Article Found" });
    // Return Article
    return res.status(200).json(article);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const CreateArticle = async (req, res) => {
  const { title, content, level, courseID, publishedBy } = req.body;
  try {
    console.log(title, content, level, courseID, publishedBy);
    const image = req?.file?.originalname || "Image Not Found";
    console.log("image: ", image);
    const article = await CreateDoc(ArticleModel, {
      title,
      content,
      level,
      imageUrl: image,
      courseID,
      publishedBy,
    });

    console.log("article: ", article);
    // Check If Article Exists
    if (!article)
      return res.status(400).json({ message: "Failed To Create Article" });

    // Return Created Article
    return res
      .status(201)
      .json({ message: "Article Created Successfully", article: article });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const UpdateArticle = async (req, res) => {
  const { id } = req.params;
  const { title, content, level, courseID, publishedBy } = req.body;
  try {
    const image = req.file.originalname;
    const article = await UpdateDoc(ArticleModel, id, {
      title,
      content,
      level,
      imageUrl: image,
      courseID,
      publishedBy,
    });

    // Check If Article Exists
    if (!article) return res.status(400).json({ message: "No Article Found" });

    // Return Updated Article
    return res.status(200).json({
      message: "Article Updated Successfully",
      article: article,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const DeleteArticle = async (req, res) => {
  const { id } = req.params;
  try {
    const article = await DeleteDoc(ArticleModel, id);
    // Check If Article Exists
    if (!article) return res.status(400).json({ message: "No Article Found" });
    // Return Deleted Article
    return res.status(200).json({ message: "Article Deleted Successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  GetArticles,
  GetArticle,
  CreateArticle,
  UpdateArticle,
  DeleteArticle,
};
