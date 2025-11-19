const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/database');

// Get all employees
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .query('SELECT * FROM Users ORDER BY CreatedAt DESC');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ error: 'Failed to fetch employees', details: err.message });
  }
});

// Get single employee
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Employees WHERE Id = @id');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching employee:', err);
    res.status(500).json({ error: 'Failed to fetch employee', details: err.message });
  }
});

// Create new employee
router.post('/', async (req, res) => {
  try {
    const { 
        Id,
    FirstName,
    LastName,
    EmployeeId,
    Email,
    EmployeeLogin,
    Title,
    Step,
    Level,
    ReportingLevel,
    DateEmployed,
    Supervisor,
    SupervisorId,
    ManagerId,
    Manager,
    IsSupervisor,
    IsManager,
    IsPDRRequired,
    IsLFLicRequired,
    IsWorksiteRequired,
    Status,
    WorkUnitId
    } = req.body;
    
    // Validation
    if (
    !FirstName ||
    !LastName ||
    !EmployeeId ||
    !Email ||
    !EmployeeLogin ||
    !Title ||
    !Step ||
    !Level ||
    !ReportingLevel ||
    !DateEmployed ||
    !Supervisor ||
    !SupervisorId ||
    !ManagerId ||
    !Manager ||
    !IsSupervisor ||
    !IsManager ||
    !IsPDRRequired ||
    !IsLFLicRequired ||
    !IsWorksiteRequired ||
    !Status ||
    !WorkUnitId
    ) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('firstName', sql.NVarChar(100), FirstName)
      .input('lastName', sql.NVarChar(100), LastName)
      .input('employeeId', sql.NVarChar(100), EmployeeId)
      .input('email', sql.NVarChar(100), Email)
      .input('employeeLogin', sql.Int, EmployeeLogin)
      .input('workUnitId', sql.Int, WorkUnitId)
      .query(`
        INSERT INTO Users (FirstName, LastName, EmployeeId, Email, EmployeeLogin, Title, Step, Level, ReportingLevel,
        DateEmployed, Supervisor, SupervisorId, ManagerId, Manager, IsSupervisor, IsManager, IsPDRRequired, IsLFLicenseRequired,
        IsWorksiteRequired, Status, WorkUnitId, CreatedAt) 
        OUTPUT INSERTED.Id
        VALUES (@firstName, @lastName, @employeeId, @email, @employeeLogin, GETDATE())
      `);
    
    res.status(201).json({ 
      message: 'User created successfully',
      id: result.recordset[0].Id 
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Failed to create user', details: err.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { FirstName, LastName, Email, WorkUnitId } = req.body;
    
    // Validation
    if (!FirstName || !LastName || !Email || !WorkUnitId) {
      return res.status(400).json({ error: 'FirstName, LastName, Email, and WorkUnitId are required' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('firstName', sql.NVarChar(100), FirstName)
       .input('lastName', sql.NVarChar(100), LastName)
      .input('email', sql.NVarChar(100), Email)
      .input('workUnitId', sql.Int, WorkUnitId)
      .query(`
        UPDATE Users 
        SET firstName = @FirstName, Email = @email, workUnitId = @WorkUnitId 
        WHERE Id = @id
      `);
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user', details: err.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Users WHERE Id = @id');
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user', details: err.message });
  }
});

module.exports = router;