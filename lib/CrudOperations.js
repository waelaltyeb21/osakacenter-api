const { isValidObjectId } = require("mongoose");

// Get All Docs
const GetAllDocs = async (model) => {
  try {
    const data = await model.find();
    // if No Data Found
    if (data?.length == 0) return [];
    return data;
  } catch (error) {
    console.error("Error: ", error);
    return null;
  }
};

// Get Doc By Id
const GetDocById = async (model, id) => {
  try {
    // If Invalid ID
    if (!isValidObjectId(id)) return null;
    const data = await model.findById(id);
    // if No Data Found
    if (!data) return null;
    return data;
  } catch (error) {
    console.error("Error: ", error);
    return null;
  }
};

// Create New Doc
const CreateDoc = async (model, data) => {
  try {
    const doc = await model.create(data);
    if (!doc) return null;
    return doc;
  } catch (error) {
    console.error("Error: ", error);
    return null;
  }
};

// Update Doc
const UpdateDoc = async (model, id, data) => {
  try {
    // If Invalid ID
    if (!isValidObjectId(id)) return null;
    const doc = await model.findByIdAndUpdate(id, data, { new: true });
    // If Doc Not Found
    if (!doc) return null;
    return doc;
  } catch (error) {
    console.error("Error: ", error);
    return null;
  }
};

// Delete Doc
const DeleteDoc = async (model, id) => {
  try {
    // If Invalid ID
    if (!isValidObjectId(id)) return null;
    const doc = await model.findByIdAndDelete(id);
    // If Doc Not Found
    if (!doc) return null;
    return doc;
  } catch (error) {
    console.error("Error: ", error);
    return null;
  }
};

module.exports = {
  GetAllDocs,
  GetDocById,
  CreateDoc,
  UpdateDoc,
  DeleteDoc,
};
