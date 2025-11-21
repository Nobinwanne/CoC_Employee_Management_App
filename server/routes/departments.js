const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/database');

// Get all departments
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .query('SELECT Id, DepartmentName as Name FROM Departments ORDER BY DepartmentName');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ error: 'Failed to fetch departments', details: err.message });
  }
});

// Get single department
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .query('SELECT Id, DepartmentName as Name FROM Departments WHERE Id = @id');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching department:', err);
    res.status(500).json({ error: 'Failed to fetch department', details: err.message });
  }
});

// Create new department
router.post('/', async (req, res) => {
  try {
    const { Name } = req.body;
    
    if (!Name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const pool = await getPool();
    const newId = sql.UniqueIdentifier.value = require('crypto').randomUUID();
    
    await pool.request()
      .input('id', sql.UniqueIdentifier, newId)
      .input('name', sql.NVarChar(50), Name)
      .input('createdBy', sql.NVarChar(50), 'system')
      .input('updatedBy', sql.NVarChar(50), 'system')
      .query(`
        INSERT INTO Departments (Id, DepartmentName, CreatedBy, DateCreated, UpdatedBy, DateUpdated) 
        VALUES (@id, @name, @createdBy, GETDATE(), @updatedBy, GETDATE())
      `);
    
    res.status(201).json({ 
      message: 'Department created successfully',
      id: newId
    });
  } catch (err) {
    console.error('Error creating department:', err);
    res.status(500).json({ error: 'Failed to create department', details: err.message });
  }
});

// Update department
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { Name } = req.body;
    
    if (!Name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('name', sql.NVarChar(50), Name)
      .input('updatedBy', sql.NVarChar(50), 'system')
      .query(`
        UPDATE Departments 
        SET DepartmentName = @name, UpdatedBy = @updatedBy, DateUpdated = GETDATE() 
        WHERE Id = @id
      `);
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    res.json({ message: 'Department updated successfully' });
  } catch (err) {
    console.error('Error updating department:', err);
    res.status(500).json({ error: 'Failed to update department', details: err.message });
  }
});

// Delete department
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    
    // Check if department has employees or work units
    const checkEmployees = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .query('SELECT COUNT(*) as count FROM Employees WHERE DepartmentId = @id AND IsDeleted = 0');
    
    if (checkEmployees.recordset[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete department with associated employees' 
      });
    }
    
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .query('DELETE FROM Departments WHERE Id = @id');
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    res.json({ message: 'Department deleted successfully' });
  } catch (err) {
    console.error('Error deleting department:', err);
    res.status(500).json({ error: 'Failed to delete department', details: err.message });
  }
});

module.exports = router;