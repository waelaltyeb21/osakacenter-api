const { default: mongoose } = require("mongoose");

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  group: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "groups",
    required: true,
  },
  studentId: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    default: "Not Paid",
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const StudentModel = mongoose.model("students", StudentSchema);
module.exports = StudentModel;
