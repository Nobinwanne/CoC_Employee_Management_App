import { getPool } from "../config/database.js";

// GET all work units with department info
export const getWorkUnits = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT 
        wu.WorkUnitID as Id,
        wu.WorkUnitName as Name,
        wu.DepartmentID as DepartmentId,
        d.DepartmentName as DepartmentName,
        wu.Description,
        wu.IsActive,
        wu.CreatedAt,
        wu.UpdatedAt,
        COUNT(e.ID) as EmployeeCount
      FROM WorkUnits wu
      INNER JOIN Departments d ON wu.DepartmentID = d.DepartmentID
      LEFT JOIN Employees e ON wu.WorkUnitID = e.WorkUnitID AND e.Status = 'Active'
      WHERE wu.IsActive = 1
      GROUP BY wu.WorkUnitID, wu.WorkUnitName, wu.DepartmentID, d.DepartmentName, wu.Description, wu.IsActive, wu.CreatedAt, wu.UpdatedAt
      ORDER BY d.DepartmentName, wu.WorkUnitName
    `);

    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error("Error fetching work units:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET work units by department
export const getWorkUnitsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const pool = await getPool();

    const result = await pool.request().input("deptId", departmentId).query(`
        SELECT 
          wu.WorkUnitID as Id,
          wu.WorkUnitName as Name,
          wu.DepartmentID as DepartmentId,
          wu.Description,
          wu.IsActive
        FROM WorkUnits wu
        WHERE wu.DepartmentID = @deptId AND wu.IsActive = 1
        ORDER BY wu.WorkUnitName
      `);

    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error("Error fetching work units by department:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET single work unit
export const getWorkUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const result = await pool.request().input("id", id).query(`
        SELECT 
          wu.WorkUnitID as Id,
          wu.WorkUnitName as Name,
          wu.DepartmentID as DepartmentId,
          d.DepartmentName as DepartmentName,
          wu.Description,
          wu.IsActive,
          wu.CreatedAt,
          wu.UpdatedAt
        FROM WorkUnits wu
        INNER JOIN Departments d ON wu.DepartmentID = d.DepartmentID
        WHERE wu.WorkUnitID = @id AND wu.IsActive = 1
      `);

    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Work unit not found" });
    }

    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    console.error("Error fetching work unit:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// CREATE work unit
export const createWorkUnit = async (req, res) => {
  try {
    const { Name, DepartmentId, Description } = req.body;

    if (!Name || !DepartmentId) {
      return res
        .status(400)
        .json({ success: false, error: "Name and Department are required" });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("name", Name)
      .input("deptId", DepartmentId)
      .input("description", Description || "").query(`
        INSERT INTO WorkUnits (WorkUnitName, DepartmentID, Description, IsActive, CreatedAt, UpdatedAt)
        OUTPUT INSERTED.WorkUnitID as Id, INSERTED.WorkUnitName as Name, INSERTED.DepartmentID as DepartmentId, INSERTED.Description
        VALUES (@name, @deptId, @description, 1, GETDATE(), GETDATE())
      `);

    res.status(201).json({ success: true, data: result.recordset[0] });
  } catch (err) {
    console.error("Error creating work unit:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// UPDATE work unit
export const updateWorkUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, DepartmentId, Description } = req.body;

    if (!Name) {
      return res
        .status(400)
        .json({ success: false, error: "Name is required" });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("id", id)
      .input("name", Name)
      .input("deptId", DepartmentId)
      .input("description", Description || "").query(`
        UPDATE WorkUnits
        SET WorkUnitName = @name,
            DepartmentID = @deptId,
            Description = @description,
            UpdatedAt = GETDATE()
        OUTPUT INSERTED.WorkUnitID as Id, INSERTED.WorkUnitName as Name, INSERTED.DepartmentID as DepartmentId, INSERTED.Description
        WHERE WorkUnitID = @id
      `);

    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Work unit not found" });
    }

    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    console.error("Error updating work unit:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE work unit (soft delete)
export const deleteWorkUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    // Check if work unit has employees
    const checkResult = await pool.request().input("id", id).query(`
        SELECT COUNT(*) as EmployeeCount
        FROM Employees
        WHERE WorkUnitID = @id AND Status = 'Active'
      `);

    const { EmployeeCount } = checkResult.recordset[0];

    if (EmployeeCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete work unit. It has ${EmployeeCount} active employee(s).`,
      });
    }

    // Soft delete
    await pool.request().input("id", id).query(`
        UPDATE WorkUnits
        SET IsActive = 0, UpdatedAt = GETDATE()
        WHERE WorkUnitID = @id
      `);

    res.json({ success: true, message: "Work unit deleted successfully" });
  } catch (err) {
    console.error("Error deleting work unit:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
