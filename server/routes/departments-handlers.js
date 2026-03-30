import { getPool } from "../config/database.js";

// GET all departments with counts
export const getDepartments = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        d.DepartmentID as Id,
        d.DepartmentName as Name,
        d.Description,
        d.IsActive,
        d.CreatedAt,
        d.UpdatedAt,
        COUNT(DISTINCT wu.WorkUnitID) as WorkUnitCount,
        COUNT(DISTINCT e.ID) as EmployeeCount
      FROM Departments d
      LEFT JOIN WorkUnits wu ON d.DepartmentID = wu.DepartmentID
      LEFT JOIN Employees e ON d.DepartmentID = e.DepartmentID
      WHERE d.IsActive = 1
      GROUP BY d.DepartmentID, d.DepartmentName, d.Description, d.IsActive, d.CreatedAt, d.UpdatedAt
      ORDER BY d.DepartmentName
    `);

    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET single department
export const getDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const result = await pool.request().input("id", id).query(`
        SELECT
          DepartmentID as Id,
          DepartmentName as Name,
          Description,
          IsActive,
          CreatedAt,
          UpdatedAt
        FROM Departments
        WHERE DepartmentID = @id AND IsActive = 1
      `);

    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Department not found" });
    }

    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    console.error("Error fetching department:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// CREATE department
export const createDepartment = async (req, res) => {
  try {
    const { Name, Description } = req.body;

    if (!Name) {
      return res
        .status(400)
        .json({ success: false, error: "Department name is required" });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("name", Name)
      .input("description", Description || "").query(`
        INSERT INTO Departments (DepartmentName, Description, IsActive, CreatedAt, UpdatedAt)
        OUTPUT INSERTED.DepartmentID as Id, INSERTED.DepartmentName as Name, INSERTED.Description
        VALUES (@name, @description, 1, GETDATE(), GETDATE())
      `);

    res.status(201).json({ success: true, data: result.recordset[0] });
  } catch (err) {
    console.error("Error creating department:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// UPDATE department
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, Description } = req.body;

    if (!Name) {
      return res
        .status(400)
        .json({ success: false, error: "Department name is required" });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("id", id)
      .input("name", Name)
      .input("description", Description || "").query(`
        UPDATE Departments
        SET DepartmentName = @name,
            Description = @description,
            UpdatedAt = GETDATE()
        OUTPUT INSERTED.DepartmentID as Id, INSERTED.DepartmentName as Name, INSERTED.Description
        WHERE DepartmentID = @id
      `);

    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Department not found" });
    }

    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    console.error("Error updating department:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE department (soft delete)
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    // Check if department has work units or employees
    const checkResult = await pool.request().input("id", id).query(`
        SELECT
          (SELECT COUNT(*) FROM WorkUnits WHERE DepartmentID = @id AND IsActive = 1) as WorkUnitCount,
          (SELECT COUNT(*) FROM Employees WHERE DepartmentID = @id AND Status = 'Active') as EmployeeCount
      `);

    const { WorkUnitCount, EmployeeCount } = checkResult.recordset[0];

    if (WorkUnitCount > 0 || EmployeeCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete department. It has ${WorkUnitCount} work unit(s) and ${EmployeeCount} active employee(s).`,
      });
    }

    // Soft delete
    await pool.request().input("id", id).query(`
        UPDATE Departments
        SET IsActive = 0, UpdatedAt = GETDATE()
        WHERE DepartmentID = @id
      `);

    res.json({ success: true, message: "Department deleted successfully" });
  } catch (err) {
    console.error("Error deleting department:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
