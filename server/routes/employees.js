import express from "express";
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getDirectReports,
  getOrgChart,
} from "./employees-handlers.js";

const router = express.Router();

// GET organization chart
router.get("/org/chart", getOrgChart);

// GET employee's direct reports
router.get("/:id/direct-reports", getDirectReports);

// GET all employees
router.get("/", getEmployees);

// GET single employee
router.get("/:id", getEmployee);

// CREATE employee
router.post("/", createEmployee);

// UPDATE employee
router.put("/:id", updateEmployee);

// DELETE employee
router.delete("/:id", deleteEmployee);

export default router;
