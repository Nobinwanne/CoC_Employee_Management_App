import express from "express";
import { getPool, sql } from "../config/database.js";
import crypto from "crypto";

const router = express.Router();

// Get all work units with department information
router.get("/", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
        SELECT 
          wu.Id,
          wu.Description as Name,
          wu.DepartmentId,
          d.Description as DepartmentName,
          (SELECT COUNT(*) FROM Employees WHERE WorkUnitId = wu.Id) as EmployeeCount
        FROM WorkUnits wu
        LEFT JOIN Departments d ON wu.DepartmentId = d.Id
        ORDER BY d.Description, wu.Description
      `);

    res.json({
      success: true,
      data: result.recordset,
      count: result.recordset.length,
    });
  } catch (err) {
    console.error("Error fetching work units:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch work units",
      message: err.message,
    });
  }
});

// Get work units by department
router.get("/department/:departmentId", async (req, res) => {
  try {
    const { departmentId } = req.params;
    const pool = await getPool();
    const result = await pool
      .request()
      .input("departmentId", sql.UniqueIdentifier, departmentId).query(`
        SELECT 
          wu.Id,
          wu.Description as Name,
          wu.DepartmentId,
          (SELECT COUNT(*) FROM Employees WHERE WorkUnitId = wu.Id) as EmployeeCount
        FROM WorkUnits wu
        WHERE wu.DepartmentId = @departmentId
        ORDER BY wu.Description
      `);

    res.json({
      success: true,
      data: result.recordset,
      count: result.recordset.length,
    });
  } catch (err) {
    console.error("Error fetching work units by department:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch work units",
      message: err.message,
    });
  }
});

// Get single work unit
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool.request().input("id", sql.UniqueIdentifier, id)
      .query(`
        SELECT 
          wu.Id,
          wu.Description as Name,
          wu.DepartmentId,
          d.Description as DepartmentName,
          wu.CreatedBy,
          wu.DateCreated,
          wu.UpdatedBy,
          wu.DateUpdated,
          (SELECT COUNT(*) FROM Employees WHERE WorkUnitId = wu.Id) as TotalEmployees
        FROM WorkUnits wu
        LEFT JOIN Departments d ON wu.DepartmentId = d.Id
        WHERE wu.Id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Work unit not found",
      });
    }

    res.json({
      success: true,
      data: result.recordset[0],
    });
  } catch (err) {
    console.error("Error fetching work unit:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch work unit",
      message: err.message,
    });
  }
});

// Create new work unit
router.post("/", async (req, res) => {
  try {
    const { Name, DepartmentId } = req.body;

    // Validation
    if (!Name || !DepartmentId) {
      return res.status(400).json({
        success: false,
        error: "Name and DepartmentId are required",
      });
    }

    const pool = await getPool();
    const newId = crypto.randomUUID();

    // Check if department exists
    const checkDept = await pool
      .request()
      .input("deptId", sql.UniqueIdentifier, DepartmentId)
      .query("SELECT Id FROM Departments WHERE Id = @deptId");

    if (checkDept.recordset.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Department not found",
      });
    }

    // Insert work unit
    await pool
      .request()
      .input("id", sql.UniqueIdentifier, newId)
      .input("description", sql.NVarChar(50), Name)
      .input("departmentId", sql.UniqueIdentifier, DepartmentId)
      .input("createdBy", sql.NVarChar(50), "system")
      .input("updatedBy", sql.NVarChar(50), "system").query(`
        INSERT INTO WorkUnits (Id, Description, DepartmentId, CreatedBy, DateCreated, UpdatedBy, DateUpdated) 
        VALUES (@id, @description, @departmentId, @createdBy, GETDATE(), @updatedBy, GETDATE())
      `);

    res.status(201).json({
      success: true,
      message: "Work unit created successfully",
      data: { id: newId },
    });
  } catch (err) {
    console.error("Error creating work unit:", err);
    res.status(500).json({
      success: false,
      error: "Failed to create work unit",
      message: err.message,
    });
  }
});

// Update work unit
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, DepartmentId } = req.body;

    // Validation
    if (!Name) {
      return res.status(400).json({
        success: false,
        error: "Name is required",
      });
    }

    const pool = await getPool();

    // Check if work unit exists
    const checkExists = await pool
      .request()
      .input("id", sql.UniqueIdentifier, id)
      .query("SELECT Id FROM WorkUnits WHERE Id = @id");

    if (checkExists.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Work unit not found",
      });
    }

    // If updating department, check if it exists
    if (DepartmentId) {
      const checkDept = await pool
        .request()
        .input("deptId", sql.UniqueIdentifier, DepartmentId)
        .query("SELECT Id FROM Departments WHERE Id = @deptId");

      if (checkDept.recordset.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Department not found",
        });
      }
    }

    // Build update query
    const request = pool
      .request()
      .input("id", sql.UniqueIdentifier, id)
      .input("description", sql.NVarChar(50), Name)
      .input("updatedBy", sql.NVarChar(50), "system");

    let query = `
      UPDATE WorkUnits 
      SET Description = @description, 
          UpdatedBy = @updatedBy, 
          DateUpdated = GETDATE()
    `;

    if (DepartmentId) {
      request.input("departmentId", sql.UniqueIdentifier, DepartmentId);
      query += ", DepartmentId = @departmentId";
    }

    query += " WHERE Id = @id";

    await request.query(query);

    res.json({
      success: true,
      message: "Work unit updated successfully",
    });
  } catch (err) {
    console.error("Error updating work unit:", err);
    res.status(500).json({
      success: false,
      error: "Failed to update work unit",
      message: err.message,
    });
  }
});

// Delete work unit
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    // Check if work unit has employees
    const checkEmployees = await pool
      .request()
      .input("id", sql.UniqueIdentifier, id)
      .query("SELECT COUNT(*) as count FROM Employees WHERE WorkUnitId = @id");

    if (checkEmployees.recordset[0].count > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete work unit with employees",
        message: `This work unit has ${checkEmployees.recordset[0].count} employee(s)`,
      });
    }

    // Delete work unit
    const result = await pool
      .request()
      .input("id", sql.UniqueIdentifier, id)
      .query("DELETE FROM WorkUnits WHERE Id = @id");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        error: "Work unit not found",
      });
    }

    res.json({
      success: true,
      message: "Work unit deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting work unit:", err);
    res.status(500).json({
      success: false,
      error: "Failed to delete work unit",
      message: err.message,
    });
  }
});

export default router;
