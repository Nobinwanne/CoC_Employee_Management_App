const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/database');

// Get all departments
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .query('SELECT * FROM Departments ORDER BY Name');
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
      .input('id', sql.Int, id)
      .query('SELECT * FROM Departments WHERE Id = @id');
    
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
    const { Name, Description } = req.body;
    
    if (!Name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('name', sql.NVarChar(100), Name)
      .input('description', sql.NVarChar(500), Description || '')
      .query(`
        INSERT INTO Departments (Name, Description) 
        OUTPUT INSERTED.Id
        VALUES (@name, @description)
      `);
    
    res.status(201).json({ 
      message: 'Department created successfully',
      id: result.recordset[0].Id 
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
    const { Name, Description } = req.body;
    
    if (!Name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar(100), Name)
      .input('description', sql.NVarChar(500), Description || '')
      .query(`
        UPDATE Departments 
        SET Name = @name, Description = @description 
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
    
    // Check if department has users or work units
    const checkUsers = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT COUNT(*) as count FROM Users WHERE DepartmentId = @id');
    
    const checkWorkUnits = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT COUNT(*) as count FROM WorkUnits WHERE DepartmentId = @id');
    
    if (checkUsers.recordset[0].count > 0 || checkWorkUnits.recordset[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete department with associated users or work units' 
      });
    }
    
    const result = await pool.request()
      .input('id', sql.Int, id)
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