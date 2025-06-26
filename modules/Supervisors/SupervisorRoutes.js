const SupervisorRoutes = require("express").Router();
const {
  GetSupervisors,
  GetSupervisor,
  CreateSupervisor,
  UpdateSupervisor,
  DeleteSupervisor,
} = require("./SupervisorController");

SupervisorRoutes.get("/", GetSupervisors);
SupervisorRoutes.get("/:id", GetSupervisor);
SupervisorRoutes.post("/create", CreateSupervisor);
SupervisorRoutes.put("/update/:id", UpdateSupervisor);
SupervisorRoutes.delete("/delete/:id", DeleteSupervisor);

module.exports = SupervisorRoutes;
