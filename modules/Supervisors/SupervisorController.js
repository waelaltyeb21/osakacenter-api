const { default: mongoose } = require("mongoose");
const { CreateDoc } = require("../../lib/CrudOperations");
const {
  Encrypt,
  EncryptedEmail,
  DecryptedEmail,
} = require("../../services/Encryption");
const SupervisorModel = require("./SupervisorModel");

const GetSupervisors = async (req, res) => {
  try {
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const GetSupervisor = async (req, res) => {
  const { id } = req.params;
  try {
    const check_supervisor = await SupervisorModel.findById(id);

    if (!check_supervisor)
      return res.status(400).json({ message: "Supervisor Does'nt Exist" });

    const [supervisor] = await SupervisorModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "groups",
          localField: "_id",
          foreignField: "supervisor",
          as: "groups",
        },
      },
      {
        $addFields: {
          groups_count: { $size: "$groups" },
        },
      },
      {
        $unwind: "$groups",
      },
      {
        $lookup: {
          from: "courses",
          localField: "groups.course",
          foreignField: "_id",
          as: "courses",
        },
      },
      {
        $unwind: "$courses",
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          email: { $first: "$email" },
          emailIv: { $first: "$emailIv" },
          role: { $first: "$role" },
          groups: {
            $push: {
              _id: "$groups._id",
              course: "$courses.name",
              level: "$groups.level",
              time: "$groups.time",
              startingDate: "$groups.startingDate",
              status: "$groups.status",
            },
          },
          groups_count: { $first: "$groups_count" },
        },
      },
    ]);

    const decrypt_email = await DecryptedEmail(
      supervisor.email,
      supervisor.emailIv
    );

    return res.status(200).json({
      message: "Supervisor Found",
      supervisor: {
        id: supervisor._id,
        name: supervisor.name,
        email: decrypt_email,
        role: supervisor.role,
        groups: supervisor.groups,
        groups_count: supervisor.groups_count,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const CreateSupervisor = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    // Check if Supervisor Already Exists
    const check = await SupervisorModel.findOne({ name });
    if (check)
      return res
        .status(400)
        .json({ message: "This Supervisor Is Already Exist" });
    // Encrypt Password
    const EncryptPassword = await Encrypt(password);
    // Encrypt Email
    const { encryptedData, iv } = await EncryptedEmail(email);

    const supervisor_data = {
      name,
      email: encryptedData,
      emailIv: iv,
      password: EncryptPassword,
      role,
    };
    // Create New Supervisor
    const supervisor = await CreateDoc(SupervisorModel, supervisor_data);
    // Check if supervisor created or not
    if (!supervisor)
      return res.status(400).json({ message: "Faild To Add New Supervisor" });
    // Return Response To Client
    return res.status(201).json({ message: "Supervisor Created Successfuly" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const UpdateSupervisor = async (req, res) => {
  try {
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const DeleteSupervisor = async (req, res) => {
  try {
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  GetSupervisors,
  GetSupervisor,
  CreateSupervisor,
  UpdateSupervisor,
  DeleteSupervisor,
};
