const { default: mongoose } = require("mongoose");

const SupervisorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  emailIv: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "teacher",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SupervisorModel = mongoose.model("supervisors", SupervisorSchema);
module.exports = SupervisorModel;
