import express from "express";
import { getPool, sql } from "../config/database.js";

const router = express.Router();

// Get all employees with filtering
router.get("/", async (req, res) => {
  try {
    const { status, department, workunit, employeeType, search } = req.query;
    const pool = await getPool();

    let query = `
      SELECT 
        e.ID,
        e.EmployeeID,
        e.Name,
        e.Email,
        e.EmployeeLogin,
        e.PositionCode,
        e.Title,
        e.SupervisorID,
        sup.Name as SupervisorName,
        e.ManagerID,
        mgr.Name as ManagerName,
        e.Step,
        e.Level,
        e.ReportingLevel,
        e.WorkUnitID,
        wu.Description as WorkUnitName,
        e.DepartmentID,
        d.Description as DepartmentName,
        e.IsPDRRequired,
        e.IsLFLicRequired,
        e.WorkType,
        e.EmployeeType,
        e.WorkLocation,
        e.DateEmployed,
        e.Status,
        e.TerminationDate,
        e.KnowBe4Classification,
        e.DATSClassification
      FROM Employees e
      LEFT JOIN Employees sup ON e.SupervisorID = sup.ID
      LEFT JOIN Employees mgr ON e.ManagerID = mgr.ID
      LEFT JOIN WorkUnits wu ON e.WorkUnitID = wu.Id
      LEFT JOIN Departments d ON e.DepartmentID = d.Id
      WHERE 1=1
    `;

    const request = pool.request();

    // Add filters
    if (status) {
      query += " AND e.Status = @status";
      request.input("status", sql.NVarChar(20), status);
    }

    if (department) {
      query += " AND e.DepartmentID = @department";
      request.input("department", sql.UniqueIdentifier, department);
    }

    if (workunit) {
      query += " AND e.WorkUnitID = @workunit";
      request.input("workunit", sql.UniqueIdentifier, workunit);
    }

    if (employeeType) {
      query += " AND e.EmployeeType = @employeeType";
      request.input("employeeType", sql.NVarChar(30), employeeType);
    }

    if (search) {
      query +=
        " AND (e.Name LIKE @search OR e.Email LIKE @search OR e.Title LIKE @search)";
      request.input("search", sql.NVarChar(200), `%${search}%`);
    }

    query += " ORDER BY e.Name";

    const result = await request.query(query);

    res.json({
      success: true,
      data: result.recordset,
      count: result.recordset.length,
    });
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch employees",
      message: err.message,
    });
  }
});

// Get single employee
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const result = await pool.request().input("id", sql.VarChar(50), id).query(`
        SELECT 
          e.ID,
          e.EmployeeID,
          e.Name,
          e.Email,
          e.EmployeeLogin,
          e.PositionCode,
          e.Title,
          e.SupervisorID,
          sup.Name as SupervisorName,
          e.ManagerID,
          mgr.Name as ManagerName,
          e.Step,
          e.Level,
          e.ReportingLevel,
          e.WorkUnitID,
          wu.Description as WorkUnitName,
          e.DepartmentID,
          d.Description as DepartmentName,
          e.IsPDRRequired,
          e.IsLFLicRequired,
          e.WorkType,
          e.EmployeeType,
          e.WorkLocation,
          e.DateEmployed,
          e.Status,
          e.TerminationDate,
          e.KnowBe4Classification,
          e.DATSClassification
        FROM Employees e
        LEFT JOIN Employees sup ON e.SupervisorID = sup.ID
        LEFT JOIN Employees mgr ON e.ManagerID = mgr.ID
        LEFT JOIN WorkUnits wu ON e.WorkUnitID = wu.Id
        LEFT JOIN Departments d ON e.DepartmentID = d.Id
        WHERE e.ID = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    res.json({
      success: true,
      data: result.recordset[0],
    });
  } catch (err) {
    console.error("Error fetching employee:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch employee",
      message: err.message,
    });
  }
});

// Get employee's direct reports
router.get("/:id/direct-reports", async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const result = await pool.request().input("id", sql.VarChar(50), id).query(`
        SELECT 
          e.ID,
          e.Name,
          e.Email,
          e.Title,
          e.EmployeeType,
          e.Status,
          wu.Description as WorkUnitName,
          d.Description as DepartmentName
        FROM Employees e
        LEFT JOIN WorkUnits wu ON e.WorkUnitID = wu.Id
        LEFT JOIN Departments d ON e.DepartmentID = d.Id
        WHERE e.SupervisorID = @id OR e.ManagerID = @id
        ORDER BY e.Name
      `);

    res.json({
      success: true,
      data: result.recordset,
      count: result.recordset.length,
    });
  } catch (err) {
    console.error("Error fetching direct reports:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch direct reports",
      message: err.message,
    });
  }
});

// Create new employee
router.post("/", async (req, res) => {
  try {
    const {
      ID,
      EmployeeID,
      Name,
      Email,
      EmployeeLogin,
      PositionCode,
      Title,
      SupervisorID,
      ManagerID,
      Step,
      Level,
      ReportingLevel,
      WorkUnitID,
      DepartmentID,
      IsPDRRequired,
      IsLFLicRequired,
      WorkType,
      EmployeeType,
      WorkLocation,
      DateEmployed,
      Status,
      KnowBe4Classification,
      DATSClassification,
    } = req.body;

    // Validation
    if (
      !ID ||
      !Name ||
      !Email ||
      !DepartmentID ||
      !WorkType ||
      !EmployeeType ||
      !DateEmployed
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Required fields: ID, Name, Email, DepartmentID, WorkType, EmployeeType, DateEmployed",
      });
    }

    const pool = await getPool();

    // Check if ID already exists
    const checkId = await pool
      .request()
      .input("id", sql.VarChar(50), ID)
      .query("SELECT ID FROM Employees WHERE ID = @id");

    if (checkId.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Employee ID already exists",
      });
    }

    // Check if email already exists
    const checkEmail = await pool
      .request()
      .input("email", sql.VarChar(100), Email)
      .query("SELECT ID FROM Employees WHERE Email = @email");

    if (checkEmail.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }

    // Insert employee
    const request = pool
      .request()
      .input("id", sql.VarChar(50), ID)
      .input("employeeId", sql.VarChar(50), EmployeeID || "0")
      .input("name", sql.VarChar(100), Name)
      .input("email", sql.VarChar(100), Email)
      .input("employeeLogin", sql.VarChar(50), EmployeeLogin || null)
      .input("positionCode", sql.VarChar(20), PositionCode || null)
      .input("title", sql.VarChar(100), Title || null)
      .input("supervisorId", sql.VarChar(50), SupervisorID || null)
      .input("managerId", sql.VarChar(50), ManagerID || null)
      .input("step", sql.VarChar(10), Step || null)
      .input("level", sql.VarChar(10), Level || null)
      .input("reportingLevel", sql.VarChar(10), ReportingLevel || null)
      .input("workUnitId", sql.UniqueIdentifier, WorkUnitID || null)
      .input("departmentId", sql.UniqueIdentifier, DepartmentID)
      .input("isPDRRequired", sql.Bit, IsPDRRequired || false)
      .input("isLFLicRequired", sql.Bit, IsLFLicRequired || false)
      .input("workType", sql.NVarChar(30), WorkType)
      .input("employeeType", sql.NVarChar(30), EmployeeType)
      .input("workLocation", sql.NVarChar(200), WorkLocation || null)
      .input("dateEmployed", sql.Date, new Date(DateEmployed))
      .input("status", sql.NVarChar(20), Status || "Active")
      .input("knowBe4", sql.NVarChar(50), KnowBe4Classification || null)
      .input("dats", sql.NVarChar(50), DATSClassification || null);

    await request.query(`
      INSERT INTO Employees (
        ID, EmployeeID, Name, Email, EmployeeLogin, PositionCode, Title,
        SupervisorID, ManagerID, Step, Level, ReportingLevel, WorkUnitID,
        DepartmentID, IsPDRRequired, IsLFLicRequired, WorkType, EmployeeType,
        WorkLocation, DateEmployed, Status, KnowBe4Classification, DATSClassification
      ) VALUES (
        @id, @employeeId, @name, @email, @employeeLogin, @positionCode, @title,
        @supervisorId, @managerId, @step, @level, @reportingLevel, @workUnitId,
        @departmentId, @isPDRRequired, @isLFLicRequired, @workType, @employeeType,
        @workLocation, @dateEmployed, @status, @knowBe4, @dats
      )
    `);

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: { id: ID },
    });
  } catch (err) {
    console.error("Error creating employee:", err);
    res.status(500).json({
      success: false,
      error: "Failed to create employee",
      message: err.message,
    });
  }
});

// Update employee
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      Name,
      Email,
      EmployeeLogin,
      PositionCode,
      Title,
      SupervisorID,
      ManagerID,
      Step,
      Level,
      ReportingLevel,
      WorkUnitID,
      DepartmentID,
      IsPDRRequired,
      IsLFLicRequired,
      WorkType,
      EmployeeType,
      WorkLocation,
      Status,
      TerminationDate,
      KnowBe4Classification,
      DATSClassification,
    } = req.body;

    const pool = await getPool();

    // Check if employee exists
    const checkExists = await pool
      .request()
      .input("id", sql.VarChar(50), id)
      .query("SELECT ID FROM Employees WHERE ID = @id");

    if (checkExists.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    // Check if email conflicts with another employee
    if (Email) {
      const checkEmail = await pool
        .request()
        .input("email", sql.VarChar(100), Email)
        .input("id", sql.VarChar(50), id)
        .query("SELECT ID FROM Employees WHERE Email = @email AND ID != @id");

      if (checkEmail.recordset.length > 0) {
        return res.status(400).json({
          success: false,
          error: "Email already exists",
        });
      }
    }

    // Build dynamic update query
    let updateFields = [];
    const request = pool.request().input("id", sql.VarChar(50), id);

    if (Name !== undefined) {
      updateFields.push("Name = @name");
      request.input("name", sql.VarChar(100), Name);
    }
    if (Email !== undefined) {
      updateFields.push("Email = @email");
      request.input("email", sql.VarChar(100), Email);
    }
    if (EmployeeLogin !== undefined) {
      updateFields.push("EmployeeLogin = @employeeLogin");
      request.input("employeeLogin", sql.VarChar(50), EmployeeLogin);
    }
    if (PositionCode !== undefined) {
      updateFields.push("PositionCode = @positionCode");
      request.input("positionCode", sql.VarChar(20), PositionCode);
    }
    if (Title !== undefined) {
      updateFields.push("Title = @title");
      request.input("title", sql.VarChar(100), Title);
    }
    if (SupervisorID !== undefined) {
      updateFields.push("SupervisorID = @supervisorId");
      request.input("supervisorId", sql.VarChar(50), SupervisorID);
    }
    if (ManagerID !== undefined) {
      updateFields.push("ManagerID = @managerId");
      request.input("managerId", sql.VarChar(50), ManagerID);
    }
    if (Step !== undefined) {
      updateFields.push("Step = @step");
      request.input("step", sql.VarChar(10), Step);
    }
    if (Level !== undefined) {
      updateFields.push("Level = @level");
      request.input("level", sql.VarChar(10), Level);
    }
    if (ReportingLevel !== undefined) {
      updateFields.push("ReportingLevel = @reportingLevel");
      request.input("reportingLevel", sql.VarChar(10), ReportingLevel);
    }
    if (WorkUnitID !== undefined) {
      updateFields.push("WorkUnitID = @workUnitId");
      request.input("workUnitId", sql.UniqueIdentifier, WorkUnitID);
    }
    if (DepartmentID !== undefined) {
      updateFields.push("DepartmentID = @departmentId");
      request.input("departmentId", sql.UniqueIdentifier, DepartmentID);
    }
    if (IsPDRRequired !== undefined) {
      updateFields.push("IsPDRRequired = @isPDRRequired");
      request.input("isPDRRequired", sql.Bit, IsPDRRequired);
    }
    if (IsLFLicRequired !== undefined) {
      updateFields.push("IsLFLicRequired = @isLFLicRequired");
      request.input("isLFLicRequired", sql.Bit, IsLFLicRequired);
    }
    if (WorkType !== undefined) {
      updateFields.push("WorkType = @workType");
      request.input("workType", sql.NVarChar(30), WorkType);
    }
    if (EmployeeType !== undefined) {
      updateFields.push("EmployeeType = @employeeType");
      request.input("employeeType", sql.NVarChar(30), EmployeeType);
    }
    if (WorkLocation !== undefined) {
      updateFields.push("WorkLocation = @workLocation");
      request.input("workLocation", sql.NVarChar(200), WorkLocation);
    }
    if (Status !== undefined) {
      updateFields.push("Status = @status");
      request.input("status", sql.NVarChar(20), Status);
    }
    if (TerminationDate !== undefined) {
      updateFields.push("TerminationDate = @terminationDate");
      request.input(
        "terminationDate",
        sql.Date,
        TerminationDate ? new Date(TerminationDate) : null,
      );
    }
    if (KnowBe4Classification !== undefined) {
      updateFields.push("KnowBe4Classification = @knowBe4");
      request.input("knowBe4", sql.NVarChar(50), KnowBe4Classification);
    }
    if (DATSClassification !== undefined) {
      updateFields.push("DATSClassification = @dats");
      request.input("dats", sql.NVarChar(50), DATSClassification);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No fields to update",
      });
    }

    const query = `UPDATE Employees SET ${updateFields.join(", ")} WHERE ID = @id`;
    await request.query(query);

    res.json({
      success: true,
      message: "Employee updated successfully",
    });
  } catch (err) {
    console.error("Error updating employee:", err);
    res.status(500).json({
      success: false,
      error: "Failed to update employee",
      message: err.message,
    });
  }
});

// Delete employee (soft delete - set status to Inactive)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { hard } = req.query; // ?hard=true for permanent delete
    const pool = await getPool();

    // Check if employee has direct reports
    const checkReports = await pool
      .request()
      .input("id", sql.VarChar(50), id)
      .query(
        "SELECT COUNT(*) as count FROM Employees WHERE SupervisorID = @id OR ManagerID = @id",
      );

    if (checkReports.recordset[0].count > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete employee with direct reports",
        message: `This employee has ${checkReports.recordset[0].count} direct report(s). Reassign them first.`,
      });
    }

    if (hard === "true") {
      // Permanent delete
      const result = await pool
        .request()
        .input("id", sql.VarChar(50), id)
        .query("DELETE FROM Employees WHERE ID = @id");

      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({
          success: false,
          error: "Employee not found",
        });
      }

      res.json({
        success: true,
        message: "Employee permanently deleted",
      });
    } else {
      // Soft delete - set to Inactive
      const result = await pool.request().input("id", sql.VarChar(50), id)
        .query(`
          UPDATE Employees 
          SET Status = 'Inactive', TerminationDate = GETDATE()
          WHERE ID = @id
        `);

      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({
          success: false,
          error: "Employee not found",
        });
      }

      res.json({
        success: true,
        message: "Employee deactivated successfully",
      });
    }
  } catch (err) {
    console.error("Error deleting employee:", err);
    res.status(500).json({
      success: false,
      error: "Failed to delete employee",
      message: err.message,
    });
  }
});

// Get org chart / hierarchy
router.get("/org/chart", async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
        WITH OrgHierarchy AS (
          -- Top level employees (no supervisor)
          SELECT 
            e.ID,
            e.Name,
            e.Title,
            e.EmployeeType,
            e.Email,
            e.DepartmentID,
            e.WorkUnitID,
            e.SupervisorID,
            e.Status,
            0 as Level,
            CAST(e.Name AS NVARCHAR(MAX)) as Path
          FROM Employees e
          WHERE e.SupervisorID IS NULL AND e.Status = 'Active'
          
          UNION ALL
          
          -- Recursive part - employees with supervisors
          SELECT 
            e.ID,
            e.Name,
            e.Title,
            e.EmployeeType,
            e.Email,
            e.DepartmentID,
            e.WorkUnitID,
            e.SupervisorID,
            e.Status,
            oh.Level + 1,
            CAST(oh.Path + ' > ' + e.Name AS NVARCHAR(MAX))
          FROM Employees e
          INNER JOIN OrgHierarchy oh ON e.SupervisorID = oh.ID
          WHERE e.Status = 'Active'
        )
        SELECT 
          oh.*,
          d.Description as DepartmentName,
          wu.Description as WorkUnitName
        FROM OrgHierarchy oh
        LEFT JOIN Departments d ON oh.DepartmentID = d.Id
        LEFT JOIN WorkUnits wu ON oh.WorkUnitID = wu.Id
        ORDER BY oh.Level, oh.Name
      `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (err) {
    console.error("Error fetching org chart:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch org chart",
      message: err.message,
    });
  }
});

export default router;
