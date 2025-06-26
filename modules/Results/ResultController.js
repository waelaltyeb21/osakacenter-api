const { default: mongoose } = require("mongoose");
const ResultModel = require("./ResultModel");
const { CreateDoc, UpdateDoc } = require("../../lib/CrudOperations");
const { Levels } = require("../Groups/GroupController");
const GroupModel = require("../Groups/GroupModel");
const { SendMail } = require("../../services/SendMail");

const GetGroupResult = async (req, res) => {
  const { id } = req.params;
  try {
    const group = await GroupModel.findById(id);
    const results = await ResultModel.aggregate([
      {
        $match: {
          group: new mongoose.Types.ObjectId(id),
          level: group.level,
        },
      },
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "studentId",
          as: "student",
        },
      },
      {
        $unwind: "$student",
      },
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "courses",
        },
      },
      {
        $unwind: "$courses",
      },
      {
        $lookup: {
          from: "groups",
          localField: "group",
          foreignField: "_id",
          as: "groups",
        },
      },
      {
        $unwind: "$groups",
      },
      {
        $lookup: {
          from: "supervisors",
          localField: "groups.supervisor",
          foreignField: "_id",
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
          student: {
            $first: {
              name: "$student.name",
              studentId: "$student.studentId",
              result: "$result",
              overall: "$overall",
              rating: "$rating",
            },
          },
          group: {
            $first: {
              level: "$groups.level",
              time: "$groups.time",
              course: "$courses.name",
              supervisor: "$supervisors.name",
            },
          },
        },
      },
      {
        $sort: {
          name: 1,
        },
      },
    ]);
    if (!results)
      return res
        .status(400)
        .json({ message: "There Is No Results For This Group Yet" });
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const GetStudentResult = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await ResultModel.aggregate([
      {
        $match: {
          student: parseInt(id),
        },
      },
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "studentId",
          as: "students",
        },
      },
      {
        $unwind: "$students",
      },
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "courses",
        },
      },
      {
        $unwind: "$courses",
      },
      {
        $lookup: {
          from: "groups",
          localField: "group",
          foreignField: "_id",
          as: "groups",
        },
      },
      {
        $unwind: "$groups",
      },
      {
        $lookup: {
          from: "supervisors",
          localField: "groups.supervisor",
          foreignField: "_id",
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
          student: {
            $first: {
              name: "$students.name",
              studentId: "$students.studentId",
              level: "$level",
              result: "$result",
              overall: "$overall",
              rating: "$rating",
            },
          },
          group: {
            $first: {
              course: "$courses.name",
              group: "$groups.level",
              time: "$groups.time",
              supervisor: "$supervisors.name",
            },
          },
          createdAt: { $first: "$createdAt" },
        },
      },
      {
        $sort: {
          createdAt: 1,
        },
      },
    ]);
    console.log("result: ", result);
    if (!result)
      return res
        .status(400)
        .json({ message: "There Is No Results For This Student Yet" });
    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error });
  }
};

const AddResult = async (req, res) => {
  const { student, level, group, course, result, overall, rating } = req.body;
  try {
    const studentResult = await CreateDoc(ResultModel, {
      student,
      level,
      group,
      course,
      result,
      overall,
      rating,
    });
    if (!studentResult)
      return res.status(400).json({ message: "Faild To Add New Result" });
    return res.status(201).json({ message: "The Result Created Successfuly" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const AddGroupResult = async (req, res) => {
  const { results, group, level } = req.body;
  try {
    // Go To Next Level
    const nextLevel =
      Levels.indexOf(level) != Levels.length - 1
        ? Levels[Levels.indexOf(level) + 1]
        : level;

    console.log("Next: ", nextLevel);

    const updatedGroup = await UpdateDoc(GroupModel, group, {
      level: nextLevel,
    });

    console.log("UpdatedGroup: ", updatedGroup);

    // await StudentModel.find({
    //   studentId: { $in: results.map((result) => result.student) },
    //   paymentStatus: "Passed",
    // });
    // Add Group Result
    const groupResult = await ResultModel.insertMany(results);

    if (!groupResult)
      return res.status(400).json({ message: "Faild To Add Group Result" });

    const sendMail = await SendMail(
      "weal53335@gmail.com",
      `Group Result`,
      `Group Result For Level ${level} Added Successfuly`
    );
    console.log("sendMail: ", sendMail);
    return res.status(201).json({ message: "Group Result Added Successfuly" });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

module.exports = {
  GetGroupResult,
  GetStudentResult,
  AddResult,
  AddGroupResult,
};
