const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/database');

// Get all work units
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .query(`
        SELECT w.*, d.Name as DepartmentName 
        FROM WorkUnits w
        LEFT JOIN Departments d ON w.DepartmentId = d.Id
        ORDER BY w.Name
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching work units:', err);
    res.status(500).json({ error: 'Failed to fetch work units', details: err.message });
  }
});

// Get single work unit
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT w.*, d.Name as DepartmentName 
        FROM WorkUnits w
        LEFT JOIN Departments d ON w.DepartmentId = d.Id
        WHERE w.Id = @id
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Work unit not found' });
    }
    
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching work unit:', err);
    res.status(500).json({ error: 'Failed to fetch work unit', details: err.message });
  }
});

// Create new work unit
router.post('/', async (req, res) => {
  try {
    const { Name, DepartmentId } = req.body;
    
    if (!Name || !DepartmentId) {
      return res.status(400).json({ error: 'Name and DepartmentId are required' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('name', sql.NVarChar(100), Name)
      .input('departmentId', sql.Int, DepartmentId)
      .query(`
        INSERT INTO WorkUnits (Name, DepartmentId) 
        OUTPUT INSERTED.Id
        VALUES (@name, @departmentId)
      `);
    
    res.status(201).json({ 
      message: 'Work unit created successfully',
      id: result.recordset[0].Id 
    });
  } catch (err) {
    console.error('Error creating work unit:', err);
    res.status(500).json({ error: 'Failed to create work unit', details: err.message });
  }
});

// Update work unit
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, DepartmentId } = req.body;
    
    if (!Name || !DepartmentId) {
      return res.status(400).json({ error: 'Name and DepartmentId are required' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar(100), Name)
      .input('departmentId', sql.Int, DepartmentId)
      .query(`
        UPDATE WorkUnits 
        SET Name = @name, DepartmentId = @departmentId 
        WHERE Id = @id
      `);
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Work unit not found' });
    }
    
    res.json({ message: 'Work unit updated successfully' });
  } catch (err) {
    console.error('Error updating work unit:', err);
    res.status(500).json({ error: 'Failed to update work unit', details: err.message });
  }
});

// Delete work unit
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM WorkUnits WHERE Id = @id');
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Work unit not found' });
    }
    
    res.json({ message: 'Work unit deleted successfully' });
  } catch (err) {
    console.error('Error deleting work unit:', err);
    res.status(500).json({ error: 'Failed to delete work unit', details: err.message });
  }
});

module.exports = router;