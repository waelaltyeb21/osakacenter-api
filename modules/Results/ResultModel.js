const { default: mongoose } = require("mongoose");

const ResultSchema = new mongoose.Schema({
  student: {
    type: Number,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
  course: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "courses",
    required: true,
  },
  group: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "groups",
    required: true,
  },
  result: {
    type: Object,
    required: true,
  },
  overall: {
    type: String,
    required: true,
  },
  rating: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ResultModel = mongoose.model("results", ResultSchema);
module.exports = ResultModel;
