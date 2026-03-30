import { getPool } from "../config/database.js";

// GET all employees with department and work unit info
export const getEmployees = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT 
        e.ID,
        e.EmployeeID,
        e.Name,
        e.Email,
        e.EmployeeLogin,
        e.PositionCode,
        e.Title,
        e.SupervisorID,
        e.ManagerID,
        e.Step,
        e.Level,
        e.ReportingLevel,
        e.WorkUnitID,
        wu.WorkUnitName,
        e.DepartmentID,
        d.DepartmentName,
        e.IsPDRRequired,
        e.IsLFLicRequired,
        e.WorkType,
        e.EmployeeType,
        e.WorkLocation,
        e.DateEmployed,
        e.Status,
        e.TerminationDate,
        e.FTE,
        e.KnowBe4Classification,
        e.DATSClassification,
        e.CreatedAt,
        e.UpdatedAt
      FROM Employees e
      INNER JOIN Departments d ON e.DepartmentID = d.DepartmentID
      LEFT JOIN WorkUnits wu ON e.WorkUnitID = wu.WorkUnitID
      ORDER BY e.Name
    `);

    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET single employee
export const getEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const result = await pool.request().input("id", id).query(`
        SELECT 
          e.ID,
          e.EmployeeID,
          e.Name,
          e.Email,
          e.EmployeeLogin,
          e.PositionCode,
          e.Title,
          e.SupervisorID,
          e.ManagerID,
          e.Step,
          e.Level,
          e.ReportingLevel,
          e.WorkUnitID,
          wu.WorkUnitName,
          e.DepartmentID,
          d.DepartmentName,
          e.IsPDRRequired,
          e.IsLFLicRequired,
          e.WorkType,
          e.EmployeeType,
          e.WorkLocation,
          e.DateEmployed,
          e.Status,
          e.TerminationDate,
          e.FTE,
          e.KnowBe4Classification,
          e.DATSClassification,
          e.CreatedAt,
          e.UpdatedAt
        FROM Employees e
        INNER JOIN Departments d ON e.DepartmentID = d.DepartmentID
        LEFT JOIN WorkUnits wu ON e.WorkUnitID = wu.WorkUnitID
        WHERE e.ID = @id
      `);

    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Employee not found" });
    }

    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    console.error("Error fetching employee:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// CREATE employee
export const createEmployee = async (req, res) => {
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
      TerminationDate,
      FTE,
      KnowBe4Classification,
      DATSClassification,
    } = req.body;

    // Validation
    if (!ID || !Name || !Email || !DepartmentID) {
      return res.status(400).json({
        success: false,
        error: "ID, Name, Email, and Department are required",
      });
    }

    const pool = await getPool();

    const result = await pool
      .request()
      .input("id", ID)
      .input("empId", EmployeeID || "0")
      .input("name", Name)
      .input("email", Email)
      .input("login", EmployeeLogin || Email)
      .input("posCode", PositionCode || null)
      .input("title", Title || "")
      .input("supId", SupervisorID || null)
      .input("mgrId", ManagerID || null)
      .input("step", Step || null)
      .input("level", Level || null)
      .input("repLevel", ReportingLevel || null)
      .input("wuId", WorkUnitID ? parseInt(WorkUnitID) : null)
      .input("deptId", parseInt(DepartmentID))
      .input("pdr", IsPDRRequired || "No")
      .input("lflic", IsLFLicRequired || "No")
      .input("workType", WorkType || "Permanent - Full Time")
      .input("empType", EmployeeType || "Worker")
      .input("workLoc", WorkLocation || null)
      .input("dateEmp", DateEmployed || new Date().toISOString().split("T")[0])
      .input("status", Status || "Active")
      .input("termDate", TerminationDate || null)
      .input("fte", parseFloat(FTE) || 1.0)
      .input("kb4", KnowBe4Classification || null)
      .input("dats", DATSClassification || null).query(`
        INSERT INTO Employees (
          ID, EmployeeID, Name, Email, EmployeeLogin, PositionCode, Title,
          SupervisorID, ManagerID, Step, Level, ReportingLevel,
          WorkUnitID, DepartmentID, IsPDRRequired, IsLFLicRequired,
          WorkType, EmployeeType, WorkLocation, DateEmployed, Status,
          TerminationDate, FTE, KnowBe4Classification, DATSClassification,
          CreatedAt, UpdatedAt
        )
        VALUES (
          @id, @empId, @name, @email, @login, @posCode, @title,
          @supId, @mgrId, @step, @level, @repLevel,
          @wuId, @deptId, @pdr, @lflic,
          @workType, @empType, @workLoc, @dateEmp, @status,
          @termDate, @fte, @kb4, @dats,
          GETDATE(), GETDATE()
        )
      `);

    // Fetch the created employee with joined data
    const newEmployee = await pool.request().input("id", ID).query(`
        SELECT 
          e.ID,
          e.Name,
          e.Email,
          e.Title,
          e.WorkUnitID,
          wu.WorkUnitName,
          e.DepartmentID,
          d.DepartmentName,
          e.EmployeeType,
          e.WorkType,
          e.Status
        FROM Employees e
        INNER JOIN Departments d ON e.DepartmentID = d.DepartmentID
        LEFT JOIN WorkUnits wu ON e.WorkUnitID = wu.WorkUnitID
        WHERE e.ID = @id
      `);

    res.status(201).json({ success: true, data: newEmployee.recordset[0] });
  } catch (err) {
    console.error("Error creating employee:", err);

    if (err.number === 2627) {
      // Duplicate key error
      return res.status(400).json({
        success: false,
        error: "Employee ID already exists",
      });
    }

    res.status(500).json({ success: false, error: err.message });
  }
};

// UPDATE employee
export const updateEmployee = async (req, res) => {
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
      DateEmployed,
      Status,
      TerminationDate,
      FTE,
      KnowBe4Classification,
      DATSClassification,
    } = req.body;

    // Log for debugging
    console.log("Update Employee - EmployeeType:", EmployeeType);

    if (!Name || !Email) {
      return res.status(400).json({
        success: false,
        error: "Name and Email are required",
      });
    }

    const pool = await getPool();

    await pool
      .request()
      .input("id", id)
      .input("name", Name)
      .input("email", Email)
      .input("login", EmployeeLogin || Email)
      .input("posCode", PositionCode || null)
      .input("title", Title || "")
      .input("supId", SupervisorID || null)
      .input("mgrId", ManagerID || null)
      .input("step", Step || null)
      .input("level", Level || null)
      .input("repLevel", ReportingLevel || null)
      .input("wuId", WorkUnitID ? parseInt(WorkUnitID) : null)
      .input("deptId", parseInt(DepartmentID))
      .input("pdr", IsPDRRequired || "No")
      .input("lflic", IsLFLicRequired || "No")
      .input("workType", WorkType || "Permanent - Full Time")
      .input("empType", EmployeeType || "Worker")
      .input("workLoc", WorkLocation || null)
      .input("dateEmp", DateEmployed || new Date().toISOString().split("T")[0])
      .input("status", Status || "Active")
      .input("termDate", TerminationDate || null)
      .input("fte", parseFloat(FTE) || 1.0)
      .input("kb4", KnowBe4Classification || null)
      .input("dats", DATSClassification || null).query(`
        UPDATE Employees
        SET Name = @name,
            Email = @email,
            EmployeeLogin = @login,
            PositionCode = @posCode,
            Title = @title,
            SupervisorID = @supId,
            ManagerID = @mgrId,
            Step = @step,
            Level = @level,
            ReportingLevel = @repLevel,
            WorkUnitID = @wuId,
            DepartmentID = @deptId,
            IsPDRRequired = @pdr,
            IsLFLicRequired = @lflic,
            WorkType = @workType,
            EmployeeType = @empType,
            WorkLocation = @workLoc,
            DateEmployed = @dateEmp,
            Status = @status,
            TerminationDate = @termDate,
            FTE = @fte,
            KnowBe4Classification = @kb4,
            DATSClassification = @dats,
            UpdatedAt = GETDATE()
        WHERE ID = @id
      `);

    // Fetch the updated employee with joined data
    const updatedEmployee = await pool.request().input("id", id).query(`
        SELECT 
          e.ID,
          e.Name,
          e.Email,
          e.Title,
          e.WorkUnitID,
          wu.WorkUnitName,
          e.DepartmentID,
          d.DepartmentName,
          e.EmployeeType,
          e.WorkType,
          e.Status
        FROM Employees e
        INNER JOIN Departments d ON e.DepartmentID = d.DepartmentID
        LEFT JOIN WorkUnits wu ON e.WorkUnitID = wu.WorkUnitID
        WHERE e.ID = @id
      `);

    if (updatedEmployee.recordset.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Employee not found" });
    }

    res.json({ success: true, data: updatedEmployee.recordset[0] });
  } catch (err) {
    console.error("Error updating employee:", err);
    console.error("SQL Error Number:", err.number);
    console.error("SQL Error Message:", err.message);
    console.error("SQL Original Error:", err.originalError);
    res.status(500).json({
      success: false,
      error: err.message,
      sqlError: err.number,
    });
  }
};

// GET organizational chart data
export const getOrgChart = async (req, res) => {
  try {
    const pool = await getPool();

    // Get all active employees with their department and work unit info
    const result = await pool.request().query(`
      SELECT 
        e.ID,
        e.EmployeeID,
        e.Name,
        e.Email,
        e.Title,
        e.EmployeeType,
        e.DepartmentID,
        d.DepartmentName,
        e.WorkUnitID,
        wu.WorkUnitName,
        e.ManagerID,
        e.SupervisorID,
        e.Status,
        e.FTE,
        e.PositionID
      FROM Employees e
      INNER JOIN Departments d ON e.DepartmentID = d.DepartmentID
      LEFT JOIN WorkUnits wu ON e.WorkUnitID = wu.WorkUnitID
      WHERE e.Status = 'Active'
      ORDER BY d.DepartmentName, e.EmployeeType, e.Name
    `);

    // Get departments
    const depts = await pool.request().query(`
      SELECT 
        DepartmentID AS Id,
        DepartmentName AS Name,
        Description,
        IsActive
      FROM Departments
      WHERE IsActive = 1
      ORDER BY DepartmentName
    `);

    // Get work units
    const units = await pool.request().query(`
      SELECT 
        WorkUnitID AS Id,
        WorkUnitName AS Name,
        DepartmentID AS DepartmentId,
        Description,
        IsActive
      FROM WorkUnits
      WHERE IsActive = 1
      ORDER BY WorkUnitName
    `);

    res.json({
      success: true,
      data: {
        employees: result.recordset,
        departments: depts.recordset,
        workUnits: units.recordset,
      },
    });
  } catch (err) {
    console.error("Error fetching org chart:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE employee (soft delete - set status to Inactive)
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { hard } = req.query;

    const pool = await getPool();

    if (hard === "true") {
      // Hard delete (permanent)
      await pool
        .request()
        .input("id", id)
        .query("DELETE FROM Employees WHERE ID = @id");

      res.json({ success: true, message: "Employee permanently deleted" });
    } else {
      // Soft delete (set status to Inactive)
      await pool.request().input("id", id).query(`
          UPDATE Employees
          SET Status = 'Inactive',
              TerminationDate = GETDATE(),
              UpdatedAt = GETDATE()
          WHERE ID = @id
        `);

      res.json({ success: true, message: "Employee status set to Inactive" });
    }
  } catch (err) {
    console.error("Error deleting employee:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET employee's direct reports
export const getDirectReports = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const result = await pool.request().input("id", id).query(`
        SELECT 
          e.ID,
          e.Name,
          e.Email,
          e.Title,
          d.DepartmentName,
          wu.WorkUnitName
        FROM Employees e
        INNER JOIN Departments d ON e.DepartmentID = d.DepartmentID
        LEFT JOIN WorkUnits wu ON e.WorkUnitID = wu.WorkUnitID
        WHERE e.SupervisorID = @id AND e.Status = 'Active'
        ORDER BY e.Name
      `);

    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error("Error fetching direct reports:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
