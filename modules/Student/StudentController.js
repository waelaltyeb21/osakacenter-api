const { isValidObjectId, default: mongoose } = require("mongoose");
const { CreateDoc, UpdateDoc, DeleteDoc } = require("../../lib/CrudOperations");
const StudentModel = require("./StudentModel");
const CourseModel = require("../Courses/CourseModel");
const GroupModel = require("../Groups/GroupModel");
const { GetGroups } = require("../Groups/GroupController");

// Get all students
const GetStudents = async (req, res) => {
  const limit = parseInt(req.query.limit) || 2;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;
  // filtering and sorting parameters
  const { sort, group, course, student, paymentStatus, address } = req.query;
  try {
    const filters = {};
    // if group is provided, filter by group
    if (group) {
      filters.group = new mongoose.Types.ObjectId(group);
    }
    // if place is provided, filter by place
    if (address) {
      filters.address = address;
    }
    // If student is a string, search by name, else search by studentId
    if (student && isNaN(+student)) {
      filters.name = { $regex: student, $options: "i" };
    } else if (student != "" && !isNaN(+student)) {
      filters.studentId = +student;
    }
    if (paymentStatus && paymentStatus != "") {
      filters.paymentStatus = paymentStatus;
    }
    // count total students for pagination
    const TotalStudents = await StudentModel.countDocuments();
    const totalPages = Math.ceil(TotalStudents / limit);
    // get all students with pagination and course/group details
    const students = await StudentModel.aggregate([
      {
        $match: {
          ...filters,
        },
      },
      {
        $lookup: {
          from: "groups",
          foreignField: "_id",
          localField: "group",
          as: "groups",
        },
      },
      {
        $unwind: "$groups",
      },
      {
        $match: {
          ...(course && {
            "groups.course": new mongoose.Types.ObjectId(course),
          }),
        },
      },
      {
        $lookup: {
          from: "courses",
          foreignField: "_id",
          localField: "groups.course",
          as: "courses",
        },
      },
      {
        $unwind: "$courses",
      },
      {
        $group: {
          _id: "$_id",
          studentId: { $first: "$studentId" },
          name: { $first: "$name" },
          age: { $first: "$age" },
          address: { $first: "$address" },
          phone: { $first: "$phone" },
          course: { $first: "$courses.name" },
          group: { $first: "$groups.level" },
          time: { $first: "$groups.time" },
          paymentStatus: { $first: "$paymentStatus" },
          joinedAt: { $first: "$joinedAt" },
        },
      },
      { $sort: { joinedAt: parseInt(sort) || -1 } },
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
    if (!students)
      return res.status(400).json({ message: "No Students Found" });
    return res.status(200).json({
      message: `${students.length} Students Found`,
      total_pages: totalPages,
      students_count: TotalStudents,
      students_left: TotalStudents - students.length,
      courses: info,
      students: students,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get student by ID
const GetStudentByID = async (req, res) => {
  const { id } = req.params;
  // const { role } = req.user;
  try {
    const role = "admin";
    const student = await StudentModel.findOne({ studentId: parseInt(id) })
      .populate({
        select: "studentId name age address phone paymentStatus joinedAt",
        path: "group",
        select: "level time startingDate status course supervisor",
        populate: [
          { path: "course", select: "name" },
          { path: "supervisor", select: "name" },
        ],
      })
      .exec();

    if (!student)
      return res
        .status(400)
        .json({ message: "There Is No Student By This ID", id: id });

    const response = {
      id: student?.studentId,
      name: student?.name,
      age: student?.age,
      address: student?.address,
      phone: student?.phone,
      paymentStatus: student?.paymentStatus,
      joinedAt: student?.joinedAt,
      group: {
        _id: student?.group?._id,
        time: student?.group?.time,
        level: student?.group?.level,
        status: student?.group?.status,
        course: student?.group?.course?.name,
        supervisor: student?.group?.supervisor?.name,
      },
    };

    if (role === "admin") {
      // Get All Groups
      const groups = await GroupModel.aggregate([
        {
          $lookup: {
            from: "courses",
            foreignField: "_id",
            localField: "course",
            as: "courses",
          },
        },
        {
          $unwind: {
            path: "$courses",
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
            level: { $first: "$level" },
            time: { $first: "$time" },
            course: { $first: "$courses.name" },
            supervisor: { $first: "$supervisors.name" },
          },
        },
        {
          $sort: {
            course: 1,
          },
        },
      ]);
      // Return Student Data To Admin Panel
      return res
        .status(200)
        .json({ message: "Student Found", student: response, groups: groups });
    }
    // Return Student Data
    return res
      .status(200)
      .json({ message: "Student Found", student: response });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Create a new student
const CreateStudent = async (req, res) => {
  const { name, age, address, phone, paymentStatus, group } = req.body;
  try {
    const student = await StudentModel.findOne({ name, group });
    if (student)
      return res
        .status(400)
        .json({ message: "This Student Is Already Exist", student: student });

    // Create New Student
    const Studnet = {
      studentId: Math.floor(Math.random() * 10000), // Should Be Generated
      group,
      name,
      age,
      address,
      phone,
      paymentStatus,
    };
    console.log("Studnet: ", Studnet);
    const student_check = await StudentModel.findOne({
      name: name,
    });
    if (student_check) {
      return res.status(400).json({
        message: "This Student Is Already Exist!",
        student: student_check,
      });
    }
    const NewStudent = await CreateDoc(StudentModel, Studnet);
    if (!NewStudent)
      return res.status(400).json({
        message: "Something Went Wrong When Trying To Create New Student!",
        student: NewStudent,
      });
    return res
      .status(201)
      .json({ message: "New Student Has Been Created Successfuly!" });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Update student by ID
const UpdateStudent = async (req, res) => {
  const { id } = req.params;
  const { name, age, address, group, phone, paymentStatus } = req.body;
  try {
    const UpdateStudent = await UpdateDoc(StudentModel, id, {
      name,
      age,
      address,
      group,
      phone,
      paymentStatus,
    });
    // If There is no student with the id
    if (!UpdateStudent)
      return res.status(400).json({ message: "Something Went Wrong!" });
    // if updated
    return res.status(200).json({ message: "Student Updated Successfuly" });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Delete student by ID
const DeleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const student = await DeleteDoc(StudentModel, id);
    // if no student with the id
    if (!student) return res.status(400).json({ message: "No Student Found" });
    return res.status(200).json({ message: "Student Has Been Deleted" });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const DeleteManyStudents = async (req, res) => {
  const { studentIds } = req.body;
  console.log("studentIds: ", studentIds);
  try {
    if (studentIds.length == 0)
      return res.status(400).json({ message: "No Student Selected" });
    const students = await StudentModel.deleteMany({
      _id: { $in: studentIds },
    });
    // if no student with the id
    if (!students) return res.status(400).json({ message: "No Student Found" });
    return res.status(200).json({ message: "Students Has Been Deleted" });
  } catch (error) {
    res.status(500).json({
      status: "Internal Server Error",
      message: error.message,
    });
  }
};

module.exports = {
  GetStudents,
  GetStudentByID,
  CreateStudent,
  UpdateStudent,
  DeleteStudent,
  DeleteManyStudents,
};
