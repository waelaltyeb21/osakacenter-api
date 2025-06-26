const fs = require("fs");
const path = require("path");
const {
  GetAllDocs,
  GetDocById,
  CreateDoc,
  DeleteDoc,
} = require("../../lib/CrudOperations");
const MagazineModel = require("./MagazineModel");

const GetMagazines = async (req, res) => {
  try {
    const magazines = await GetAllDocs(MagazineModel);

    console.log("magazines: ", magazines);

    return res.status(200).json({
      message: `${magazines?.length} Magazines Found`,
      magazines: magazines,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error });
  }
};

const GetMagazine = async (req, res) => {
  const { id } = req.params;
  try {
    const magazine = await GetDocById(MagazineModel, id);
    if (!magazine)
      return res.status(400).json({ message: "No Magazine Found" });

    return res.status(200).json({
      magazine: magazine,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const DownloadMagazine = async (req, res) => {
  const { id } = req.params;
  try {
    const magazine = await GetDocById(MagazineModel, id);
    if (!magazine)
      return res.status(400).json({ message: "No Magazine Found" });

    const filePath = path.join(
      process.cwd(),
      "uploads/documents",
      magazine.title
    );

    const file = magazine.title;
    console.log("title: ", magazine.title);

    if (!fs.existsSync(filePath)) {
      console.error("File does not exist:", filePath);
      return res.status(404).json({ message: "File Not Found" });
    }

    return res.download(filePath, file, (err) => {
      if (err) {
        return res.status(400).json({ message: "No Files" });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const CreateMagazine = async (req, res) => {
  const { description, version } = req.body;
  try {
    if (!description || !version)
      return res.status(400).json({ message: "All Fields Are Required" });

    if (!req.file)
      return res.status(400).json({ message: "Magazine File Is Required" });

    const fileSize = parseFloat((req.file.size / (1024 * 1024)).toPrecision(2));

    const magazine = await CreateDoc(MagazineModel, {
      title: req.file.originalname,
      description,
      version,
      magazineSize: fileSize,
    });

    if (!magazine)
      return res.status(400).json({ message: "Faild To Add New Magazine" });

    return res.status(201).json({
      message: "Magazine Created Successfully",
      magazine: magazine,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const UpdateMagazine = async (req, res) => {
  const { id } = req.params;
  const { description, version } = req.body;
  try {
    const magazine = await UpdateDoc(MagazineModel, id, {
      description,
      version,
    });

    // Check If magazine Exists
    if (!magazine)
      return res.status(400).json({ message: "No Magazine Found" });

    // Return Updated magazine
    return res.status(200).json({
      message: "Magazine Updated Successfully",
      magazine: magazine,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const DeleteMagazine = async (req, res) => {
  const { id } = req.params;
  try {
    const magazine = await DeleteDoc(MagazineModel, id);
    // Check If magazine Exists
    const found = fs.existsSync(
      path.join(process.cwd(), "uploads/documents", magazine.title)
    );

    if (!magazine || !found)
      return res.status(400).json({ message: "No Magazine Found" });

    // Delete File
    fs.unlinkSync(
      path.join(process.cwd(), "uploads/documents", magazine.title)
    );

    return res.status(200).json({ message: "magazine Deleted Successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  GetMagazines,
  GetMagazine,
  DownloadMagazine,
  CreateMagazine,
  UpdateMagazine,
  DeleteMagazine,
};
