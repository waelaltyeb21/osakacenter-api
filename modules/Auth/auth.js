const { UpdateDoc, GetDocById } = require("../../lib/CrudOperations");
const {
  Compare,
  DecryptedEmail,
  Encrypt,
} = require("../../services/Encryption");
const { SendMail } = require("../../services/SendMail");
const SupervisorModel = require("../Supervisors/SupervisorModel");
const jwt = require("jsonwebtoken");

const OTPs = [];

const Login = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const supervisor = await SupervisorModel.findOne({ name });
    console.log("supervisor: ", supervisor);
    // If No Supervisor Found With The Provided Email
    if (!supervisor)
      return res.status(400).json({ message: "Wrong Email Or Password" });

    const decryptedData = await DecryptedEmail(
      supervisor.email,
      supervisor.emailIv
    );
    // Compare the provided password with the stored hashed password
    const verifyPassword = await Compare(password, supervisor.password);
    // If Wrong Email Or Password Doesn't Match
    if (decryptedData !== email || !verifyPassword)
      return res.status(400).json({ message: "Wrong Email Or Password" });

    // Generate Token To Auth Supervisor
    const token = jwt.sign(
      {
        id: supervisor._id,
        name: supervisor.name,
        email: supervisor.email,
        role: supervisor.role,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    // Return Token To Client
    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 60 * 60 * 1000,
      })
      .cookie("supervisor", supervisor._id, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 60 * 60 * 1000,
      })
      .json({
        message: `Welcome Back ${supervisor.name}`,
        supervisor: supervisor.name,
      });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const GetOTP = async (req, res) => {
  const { id } = req.params;
  try {
    const supervisor = await SupervisorModel.findById(id);

    if (!supervisor)
      return res.status(400).json({ message: "Supervisor Does'nt Exist" });

    // Decrypt Email
    const deMail = await DecryptedEmail(supervisor.email, supervisor.emailIv);

    const email = deMail;

    // Generate OTP
    const GenerateOTP = () => {
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += Math.floor(Math.random() * 10);
      }
      return Number(code);
    };

    const otp = GenerateOTP();

    OTPs.push({ email, otp, createdAt: Date.now() });

    const response = await SendMail(
      email,
      "OTP For Reset Password",
      `<p>Your one-time verification code has been generated for your Osaka account.
       This code expires in 10 minutes. Never share your code with anyone.
       If you did not request this, please contact our support team immediately.
       Your one-time verification code is:</p> <h1>${otp}</h1>
      `
    );
    // Faild To Send OTP
    console.log("response: ", response ? "Success" : "Faild To Send OTP");
    // Return Response To Client
    return res.status(200).json({
      message: "OTP Sent To Your Email",
      supervisor: { _id: supervisor._id, name: supervisor.name, email: email },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const CheckOTP = async (req, res) => {
  const { email, otp } = req.body;
  console.log("email: ", email, "otp: ", otp);
  try {
    const OTP = OTPs.find((OTP) => OTP.email === email && OTP.otp === otp);

    console.log("OTP: ", OTP.otp, " otp: ", otp);

    // Check If OTP Is Valid
    // OTP is valid for 5 minute
    const isInValid = OTP && OTP.createdAt < Date.now() - 60000 * 5;
    console.log("isInValid: ", isInValid);
    // Remove Expired OTP
    OTPs.filter((OTP) => OTP.createdAt > Date.now() - 60000 * 5);

    if (isInValid) return res.status(400).json({ message: "OTP Expired" });
    // If OTP Doesn't Match
    if (!OTP) return res.status(400).json({ message: "Wrong OTP" });
    // Return Response To Client
    return res.status(200).json({ message: "OTP Matched" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const ResetPassword = async (req, res) => {
  const { id, password, confirmPassword } = req.body;
  try {
    const supervisor = await GetDocById(SupervisorModel, id);
    // Check If Supervisor Exist
    if (!supervisor)
      return res.status(400).json({ message: "Supervisor Does'nt Exist" });
    // Check If Passwords Match
    if (password !== confirmPassword)
      return res.status(400).json({ message: "Password Doesn't Match" });

    // Encrypt Password
    const EncryptPassword = await Encrypt(password);
    // Update Password
    const UpdatePassword = await UpdateDoc(SupervisorModel, id, {
      password: EncryptPassword,
    });

    // Faild To Reset Password
    if (UpdatePassword.modifiedCount == 0)
      return res.status(400).json({ message: "Faild To Reset Password" });

    // Return Response To Client
    return res.status(200).json({ message: "Password Reset Successfuly" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error });
  }
};

module.exports = { Login, GetOTP, CheckOTP, ResetPassword };
