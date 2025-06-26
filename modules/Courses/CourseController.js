// Number Of Student In Each Course

const { default: mongoose, isValidObjectId } = require("mongoose");
const {
  GetAllDocs,
  DeleteDoc,
  UpdateDoc,
  CreateDoc,
  GetDocById,
} = require("../../lib/CrudOperations");
const CourseModel = require("./CourseModel");

// Students In Each Course
const GetCourses = async (req, res) => {
  try {
    const courses = await GetAllDocs(CourseModel);
    if (!courses) return res.status(400).json({ message: "No Courses Found" });
    return res.status(200).json(courses);
  } catch (error) {
    return res.status(500).json({ message: "Server Internal Error" });
  }
};
// Get Course Information
const GetCourse = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id))
    return res.status(400).json({ message: "Invalid Course ID" });
  try {
    // const course = await GetDocById(CourseModel, id);
    const [course] = await CourseModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "students",
          foreignField: "course",
          localField: "_id",
          as: "students_courses",
        },
      },
    ]);
    if (!course) return res.status(404).json({ message: "No Course Found" });
    return res.status(200).json(course);
  } catch (error) {
    return res.status(500).json({ message: "Server Internal Error" });
  }
};
// Create New Course
const CreateCourse = async (req, res) => {
  const { name, description, price, duration, isAvailable } = req.body;
  console.log("File: ", req.file);
  console.table({ name, description, price, duration, isAvailable });
  try {
    const course_check = await CourseModel.findOne({ name });
    if (course_check)
      return res.status(400).json({
        message: "This Course Is Already Exist",
        course: course_check,
      });
    // Create New Course
    const course = await CreateDoc(CourseModel, {
      name,
      description,
      price,
      duration,
      image: req?.file?.originalname,
      isAvailable,
    });
    if (!course)
      return res.status(400).json({ message: "Faild To Add New Course" });
    return res.status(201).json({ message: "New Course Added Successfuly" });
  } catch (error) {
    return res.status(500).json({ message: "Server Internal Error" });
  }
};
// Update Course
const UpdateCourse = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, duration, isAvailable } = req.body;
  console.table({ id, name, description, price, duration, isAvailable });
  try {
    const data = {
      name,
      description,
      price,
      duration,
      isAvailable,
    };
    if (req.file) {
      data.image = req.file.originalname;
    }
    const course = await UpdateDoc(CourseModel, id, data);
    console.log("course: ", data);
    if (!course) return res.status(400).json({ message: "No Course Found" });
    return res.status(200).json({ message: "Course Data Has Been Updated" });
  } catch (error) {
    return res.status(500).json({ message: "Server Internal Error" });
  }
};
// Delete Course
const DeleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const course = await DeleteDoc(CourseModel, id);
    // Check If Deleted
    if (!course) return res.status(400).json({ message: "Course Not Found" });
    return res.status(200).json({ message: "Course Has Been Deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server Internal Error" });
  }
};

module.exports = {
  GetCourses,
  GetCourse,
  CreateCourse,
  UpdateCourse,
  DeleteCourse,
};
