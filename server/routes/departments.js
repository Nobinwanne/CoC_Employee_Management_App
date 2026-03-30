import express from "express";
import {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "./departments-handlers.js";

const router = express.Router();

// GET all departments
router.get("/", getDepartments);

// GET single department
router.get("/:id", getDepartment);

// CREATE department
router.post("/", createDepartment);

// UPDATE department
router.put("/:id", updateDepartment);

// DELETE department
router.delete("/:id", deleteDepartment);

export default router;
