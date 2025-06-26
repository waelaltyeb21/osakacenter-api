const { default: mongoose } = require("mongoose");

const GroupSchema = new mongoose.Schema({
  time: {
    type: String, // 4 PM
    required: true,
  },
  level: {
    type: String, // B2
    required: true,
  },
  supervisor: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "supervisors",
    required: true,
  },
  members: {
    type: Number, // 20 Members
    default: 20,
  },
  startingDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String, // On Register - On Going - Finished
    required: true,
  },
  course: {
    type: mongoose.SchemaTypes.ObjectId, // Reference to CourseModel
    ref: "courses",
    required: true,
  },
});
const GroupModel = mongoose.model("groups", GroupSchema);

module.exports = GroupModel;
