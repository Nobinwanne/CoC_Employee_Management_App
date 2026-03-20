const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/database');

// Get all employees
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .query(`
        SELECT 
          e.Id,
          e.FirstName,
          e.LastName,
          e.Email,
          e.EmployeeLogin,
          e.Title,
          e.WorkUnitId,
          w.Description as 'Work Unit',
          e.DepartmentId,
          d.DepartmentName as DepartmentName
        FROM Employees e
        LEFT JOIN Departments d ON e.DepartmentId = d.Id
        LEFT JOIN WorkUnits w ON e.WorkUnitId = w.Id
        ORDER BY e.LastName, e.FirstName
      `);
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
      .input('id', sql.UniqueIdentifier, id)
      .query(`
        SELECT 
          e.Id,
          e.FirstName,
          e.LastName,
          e.Email,
          e.EmployeeLogin,
          e.Title,
          e.WorkUnitId,
          w.Description as 'Work Unit',
          e.DepartmentId,
          d.DepartmentName as DepartmentName
        FROM Employees e
        WHERE e.Id = @id
      `);
    
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
    const { FirstName, LastName, Email, WorkUnitId, DepartmentId } = req.body;
    
    if (!FirstName || !LastName || !Email || !WorkUnitId || !DepartmentId) {
      return res.status(400).json({ error: 'FirstName, LastName Email, WorkUnitId and DepartmentId are required' });
    }

    // Split name into FirstName and LastName
    const nameParts = Name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    const pool = await getPool();
    const newId = require('crypto').randomUUID();
    
    await pool.request()
      .input('id', sql.UniqueIdentifier, newId)
      .input('firstName', sql.NVarChar(50), firstName)
      .input('lastName', sql.NVarChar(50), lastName)
      .input('email', sql.NVarChar(50), Email)
      .input('departmentId', sql.UniqueIdentifier, DepartmentId)
      .input('createdBy', sql.NVarChar(50), 'system')
      .input('updatedBy', sql.NVarChar(50), 'system')
      .query(`
        INSERT INTO Employees (
          Id, FirstName, LastName, Email, DepartmentId, 
          IsDeleted, CreatedBy, DateCreated, UpdatedBy, DateUpdated
        ) 
        VALUES (
          @id, @firstName, @lastName, @email, @departmentId,
          0, @createdBy, GETDATE(), @updatedBy, GETDATE()
        )
      `);
    
    res.status(201).json({ 
      message: 'Employee created successfully',
      id: newId
    });
  } catch (err) {
    console.error('Error creating employee:', err);
    res.status(500).json({ error: 'Failed to create employee', details: err.message });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, Email, DepartmentId } = req.body;
    
    if (!Name || !Email || !DepartmentId) {
      return res.status(400).json({ error: 'Name, Email, and DepartmentId are required' });
    }

    // Split name into FirstName and LastName
    const nameParts = Name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('firstName', sql.NVarChar(50), firstName)
      .input('lastName', sql.NVarChar(50), lastName)
      .input('email', sql.NVarChar(50), Email)
      .input('departmentId', sql.UniqueIdentifier, DepartmentId)
      .input('updatedBy', sql.NVarChar(50), 'system')
      .query(`
        UPDATE Employees 
        SET 
          FirstName = @firstName, 
          LastName = @lastName,
          Email = @email, 
          DepartmentId = @departmentId,
          UpdatedBy = @updatedBy,
          DateUpdated = GETDATE()
        WHERE Id = @id
      `);
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json({ message: 'Employee updated successfully' });
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ error: 'Failed to update employee', details: err.message });
  }
});

// Delete employee (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('updatedBy', sql.NVarChar(50), 'system')
      .query(`
        UPDATE Employees 
        SET IsDeleted = 1, UpdatedBy = @updatedBy, DateUpdated = GETDATE()
        WHERE Id = @id
      `);
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.status(500).json({ error: 'Failed to delete employee', details: err.message });
  }
});

module.exports = router;