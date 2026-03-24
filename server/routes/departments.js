import express from "express";
import { getPool, sql } from "../config/database.js";
import crypto from "crypto";

const router = express.Router();

// Get all departments
router.get("/", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
        SELECT 
          d.Id,
          d.Description as Name,
          (SELECT COUNT(*) FROM WorkUnits WHERE DepartmentId = d.Id) as WorkUnitCount,
          (SELECT COUNT(*) FROM Employees WHERE DepartmentId = d.Id) as EmployeeCount
        FROM Departments d
        ORDER BY d.Description
      `);

    res.json({
      success: true,
      data: result.recordset,
      count: result.recordset.length,
    });
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch departments",
      message: err.message,
    });
  }
});

// Get single department
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    // Get department info
    const deptResult = await pool
      .request()
      .input("id", sql.UniqueIdentifier, id).query(`
        SELECT 
          d.Id,
          d.Description as Name,
          d.CreatedBy,
          d.DateCreated,
          d.UpdatedBy,
          d.DateUpdated,
          (SELECT COUNT(*) FROM WorkUnits WHERE DepartmentId = d.Id) as WorkUnitCount,
          (SELECT COUNT(*) FROM Employees WHERE DepartmentId = d.Id) as EmployeeCount
        FROM Departments d
        WHERE d.Id = @id
      `);

    if (deptResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Department not found",
      });
    }

    // Get work units in this department
    const workUnitsResult = await pool
      .request()
      .input("id", sql.UniqueIdentifier, id).query(`
        SELECT 
          wu.Id,
          wu.Description as Name,
          (SELECT COUNT(*) FROM Employees WHERE WorkUnitId = wu.Id) as EmployeeCount
        FROM WorkUnits wu
        WHERE wu.DepartmentId = @id
        ORDER BY wu.Description
      `);

    const department = {
      ...deptResult.recordset[0],
      workUnits: workUnitsResult.recordset,
    };

    res.json({
      success: true,
      data: department,
    });
  } catch (err) {
    console.error("Error fetching department:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch department",
      message: err.message,
    });
  }
});

// Create new department
router.post("/", async (req, res) => {
  try {
    const { Name } = req.body;

    // Validation
    if (!Name) {
      return res.status(400).json({
        success: false,
        error: "Name is required",
      });
    }

    const pool = await getPool();
    const newId = crypto.randomUUID();

    // Check if department name already exists
    const checkName = await pool
      .request()
      .input("name", sql.NVarChar(50), Name)
      .query("SELECT Id FROM Departments WHERE Description = @name");

    if (checkName.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Department name already exists",
      });
    }

    // Insert department
    await pool
      .request()
      .input("id", sql.UniqueIdentifier, newId)
      .input("description", sql.NVarChar(50), Name)
      .input("createdBy", sql.NVarChar(50), "system")
      .input("updatedBy", sql.NVarChar(50), "system").query(`
        INSERT INTO Departments (Id, Description, CreatedBy, DateCreated, UpdatedBy, DateUpdated) 
        VALUES (@id, @description, @createdBy, GETDATE(), @updatedBy, GETDATE())
      `);

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: { id: newId },
    });
  } catch (err) {
    console.error("Error creating department:", err);
    res.status(500).json({
      success: false,
      error: "Failed to create department",
      message: err.message,
    });
  }
});

// Update department
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { Name } = req.body;

    // Validation
    if (!Name) {
      return res.status(400).json({
        success: false,
        error: "Name is required",
      });
    }

    const pool = await getPool();

    // Check if department exists
    const checkExists = await pool
      .request()
      .input("id", sql.UniqueIdentifier, id)
      .query("SELECT Id FROM Departments WHERE Id = @id");

    if (checkExists.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Department not found",
      });
    }

    // Check if new name conflicts with another department
    const checkName = await pool
      .request()
      .input("name", sql.NVarChar(50), Name)
      .input("id", sql.UniqueIdentifier, id)
      .query(
        "SELECT Id FROM Departments WHERE Description = @name AND Id != @id",
      );

    if (checkName.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Department name already exists",
      });
    }

    // Update department
    await pool
      .request()
      .input("id", sql.UniqueIdentifier, id)
      .input("description", sql.NVarChar(50), Name)
      .input("updatedBy", sql.NVarChar(50), "system").query(`
        UPDATE Departments 
        SET Description = @description, 
            UpdatedBy = @updatedBy, 
            DateUpdated = GETDATE() 
        WHERE Id = @id
      `);

    res.json({
      success: true,
      message: "Department updated successfully",
    });
  } catch (err) {
    console.error("Error updating department:", err);
    res.status(500).json({
      success: false,
      error: "Failed to update department",
      message: err.message,
    });
  }
});

// Delete department
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    // Check if department has work units
    const checkWorkUnits = await pool
      .request()
      .input("id", sql.UniqueIdentifier, id)
      .query(
        "SELECT COUNT(*) as count FROM WorkUnits WHERE DepartmentId = @id",
      );

    if (checkWorkUnits.recordset[0].count > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete department with work units",
        message: `This department has ${checkWorkUnits.recordset[0].count} work unit(s). Delete them first.`,
      });
    }

    // Check if department has employees
    const checkEmployees = await pool
      .request()
      .input("id", sql.UniqueIdentifier, id)
      .query(
        "SELECT COUNT(*) as count FROM Employees WHERE DepartmentId = @id",
      );

    if (checkEmployees.recordset[0].count > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete department with employees",
        message: `This department has ${checkEmployees.recordset[0].count} employee(s)`,
      });
    }

    // Delete department
    const result = await pool
      .request()
      .input("id", sql.UniqueIdentifier, id)
      .query("DELETE FROM Departments WHERE Id = @id");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        error: "Department not found",
      });
    }

    res.json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting department:", err);
    res.status(500).json({
      success: false,
      error: "Failed to delete department",
      message: err.message,
    });
  }
});

export default router;
