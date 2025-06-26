const { default: mongoose, isValidObjectId } = require("mongoose");
const { UpdateDoc, DeleteDoc, CreateDoc } = require("../../lib/CrudOperations");
const GroupModel = require("./GroupModel");
const CourseModel = require("../Courses/CourseModel");
const StudentModel = require("../Student/StudentModel");
const SupervisorModel = require("../Supervisors/SupervisorModel");

const Levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

// Get All Groups
const GetGroups = async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;
  const { course, supervisor, status, sortby, sort_type } = req.query;
  // Initialize filters
  const filters = {};
  if (course && isValidObjectId(course)) {
    filters.course = new mongoose.Types.ObjectId(course);
  }
  if (status && status !== "") {
    filters.status = status;
  }
  if (supervisor && isValidObjectId(supervisor)) {
    filters.supervisor = new mongoose.Types.ObjectId(supervisor);
  }
  try {
    const groups = await GroupModel.aggregate([
      {
        $match: {
          ...filters,
        },
      },
      {
        $lookup: {
          from: "courses",
          foreignField: "_id",
          localField: "course",
          as: "course",
        },
      },
      {
        $unwind: { path: "$course", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "students",
          foreignField: "group",
          localField: "_id",
          as: "students",
        },
      },
      {
        $addFields: {
          students_count: { $size: "$students" },
        },
      },
      {
        $unwind: {
          path: "$students",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "supervisors",
          foreignField: "_id",
          localField: "supervisor",
          as: "supervisors",
        },
      },
      {
        $unwind: {
          path: "$supervisors",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          time: { $first: "$time" },
          level: { $first: "$level" },
          status: { $first: "$status" },
          startingDate: { $first: "$startingDate" },
          students_count: { $first: "$students_count" },
          course: { $first: "$course.name" },
          supervisor: { $first: "$supervisors.name" },
        },
      },
      {
        $sort: {
          [sortby || "course"]: sort_type === "asc" ? 1 : -1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);
    const info = await CourseModel.aggregate([
      {
        $lookup: {
          from: "groups",
          foreignField: "course",
          localField: "_id",
          as: "groups",
        },
      },
      {
        $lookup: {
          from: "students",
          foreignField: "group",
          localField: "groups._id",
          as: "students",
        },
      },
      {
        $addFields: {
          groups_count: { $size: "$groups" },
          students_count: { $size: "$students" },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          groups_count: 1,
          students_count: 1,
        },
      },
    ]);
    const supervisors = await SupervisorModel.aggregate([
      {
        $project: {
          _id: 1,
          name: 1,
        },
      },
    ]);
    // Check If Groups Exists
    if (!groups) return res.status(400).json({ message: "No Group Found" });
    return res.status(200).json({
      message: `${groups?.length} Groups Found`,
      info: info,
      groups: groups,
      supervisors: supervisors,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Get One Group
const GetGroup = async (req, res) => {
  const { id } = req.params;
  try {
    const [group] = await GroupModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "students",
          foreignField: "group",
          localField: "_id",
          as: "students",
        },
      },
      {
        $addFields: {
          students_count: { $size: "$students" },
        },
      },
      {
        $lookup: {
          from: "courses",
          foreignField: "_id",
          localField: "course",
          as: "course",
        },
      },
      {
        $unwind: "$course",
      },
      {
        $lookup: {
          from: "supervisors",
          foreignField: "_id",
          localField: "supervisor",
          as: "supervisors",
        },
      },
      {
        $unwind: {
          path: "$supervisors",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          time: { $first: "$time" },
          level: { $first: "$level" },
          membersNumber: { $first: "$membersNumber" },
          status: { $first: "$status" },
          startingDate: { $first: "$startingDate" },
          course: { $first: "$course.name" },
          supervisor: { $first: "$supervisors.name" },
          students: { $first: "$students" },
          students_count: { $first: "$students_count" },
        },
      },
    ]);
    if (!group)
      return res.status(400).json({ message: "No Group Found With This ID" });
    return res.status(200).json({ message: "Group Found", group: group });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const GetGroupStudents = async (req, res) => {
  const { id } = req.params;
  try {
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid Group ID" });

    const [groupStudents] = await GroupModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "students",
          foreignField: "group",
          localField: "_id",
          as: "students",
        },
      },
      {
        $lookup: {
          from: "courses",
          foreignField: "_id",
          localField: "course",
          as: "course",
        },
      },
      {
        $unwind: "$course",
      },

      {
        $group: {
          _id: "$_id",
          time: { $first: "$time" },
          level: { $first: "$level" },
          status: { $first: "$status" },
          courseId: { $first: "$course._id" },
          course: { $first: "$course.name" },
          students: { $first: "$students" },
        },
      },
    ]);

    if (!groupStudents)
      return res.status(400).json({ message: "No Students Added Yet" });

    return res.status(200).json({ message: "Students", group: groupStudents });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Add New Group
const CreateGroup = async (req, res) => {
  const {
    time,
    startingDate,
    supervisor,
    level,
    membersNumber,
    status,
    course,
  } = req.body;
  try {
    const group = await CreateDoc(GroupModel, {
      time,
      startingDate,
      supervisor,
      level,
      membersNumber,
      status,
      course,
    });
    if (!group) return res.status({ message: "This Group Is Not Exist" });
    return res.status(201).json({ message: "The Group Created Successfuly" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update Group
const UpdateGroup = async (req, res) => {
  const { id } = req.params;
  const { time, level, membersNumber, status } = req.body;
  try {
    const group = await UpdateDoc(GroupModel, id, {
      time,
      level,
      membersNumber,
      status,
    });
    if (!group) return res.status({ message: "This Group Is Not Exist" });
    return res.status(200).json({ message: "Group Updated Successfuly" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Group
const DeleteGroup = async (req, res) => {
  const { id } = req.params;
  try {
    // Delete group
    const group = await DeleteDoc(GroupModel, id);
    if (!group)
      return res.status(400).json({ message: "This Group Is Not Exist" });
    // Delete all students in this group
    const students = await StudentModel.deleteMany({ group: id });
    // if no student with the id
    if (students.modifiedCount == 0)
      return res.status(400).json({ message: "No Students Found" });
    // Return Response
    return res
      .status(200)
      .json({ message: "The Group Has Been Deleted Successfuly" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  Levels,
  GetGroups,
  GetGroup,
  GetGroupStudents,
  CreateGroup,
  UpdateGroup,
  DeleteGroup,
};
