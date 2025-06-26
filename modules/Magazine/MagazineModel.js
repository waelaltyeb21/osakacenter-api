const { default: mongoose, version } = require("mongoose");

const MagazineSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  version: {
    type: String,
    required: true,
  },
  magazineSize: {
    type: Number,
    required: true,
  },
  publishDate: {
    type: Date,
    default: Date.now,
  },
});
const MagazineModel = mongoose.model("magazins", MagazineSchema);
module.exports = MagazineModel;
