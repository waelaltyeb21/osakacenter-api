const Auth = require("express").Router();

const { isAuthenticated } = require("../../middlewares/Auth");
const { Login, GetOTP, CheckOTP, ResetPassword } = require("./auth");

Auth.post("/login", Login);

// Routes Require Authenticate
Auth.get("/otp/:id", isAuthenticated, GetOTP);
Auth.post("/check-otp", isAuthenticated, CheckOTP);
Auth.post("/reset-password", isAuthenticated, ResetPassword);

module.exports = Auth;
