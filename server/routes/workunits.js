import express from "express";
import {
  getWorkUnits,
  getWorkUnit,
  getWorkUnitsByDepartment,
  createWorkUnit,
  updateWorkUnit,
  deleteWorkUnit,
} from "./workunits-handlers.js";

const router = express.Router();

// GET all work units
router.get("/", getWorkUnits);

// GET work units by department
router.get("/department/:departmentId", getWorkUnitsByDepartment);

// GET single work unit
router.get("/:id", getWorkUnit);

// CREATE work unit
router.post("/", createWorkUnit);

// UPDATE work unit
router.put("/:id", updateWorkUnit);

// DELETE work unit
router.delete("/:id", deleteWorkUnit);

export default router;
