const { default: mongoose } = require("mongoose");

const CourseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});
const CourseModel = mongoose.model("courses", CourseSchema);

module.exports = CourseModel;
