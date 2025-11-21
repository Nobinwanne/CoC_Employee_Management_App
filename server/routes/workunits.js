const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/database');

// Get all work units
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .query(`
        SELECT 
          w.Id,
          w.Description as Name
        FROM WorkUnits w
        ORDER BY w.Description
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
      .input('id', sql.UniqueIdentifier, id)
      .query(`
        SELECT 
          w.Id,
          w.Description as Name
        FROM WorkUnits w
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
    const { Name } = req.body;
    
    if (!Name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const pool = await getPool();
    const newId = require('crypto').randomUUID();
    
    await pool.request()
      .input('id', sql.UniqueIdentifier, newId)
      .input('description', sql.NVarChar(50), Name)
      .input('createdBy', sql.NVarChar(50), 'system')
      .input('updatedBy', sql.NVarChar(50), 'system')
      .query(`
        INSERT INTO WorkUnits (Id, Description, CreatedBy, DateCreated, UpdatedBy, DateUpdated) 
        VALUES (@id, @description, @createdBy, GETDATE(), @updatedBy, GETDATE())
      `);
    
    res.status(201).json({ 
      message: 'Work unit created successfully',
      id: newId
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
    const { Name } = req.body;
    
    if (!Name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.UniqueIdentifier, id)
      .input('description', sql.NVarChar(50), Name)
      .input('updatedBy', sql.NVarChar(50), 'system')
      .query(`
        UPDATE WorkUnits 
        SET Description = @description, UpdatedBy = @updatedBy, DateUpdated = GETDATE() 
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
      .input('id', sql.UniqueIdentifier, id)
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