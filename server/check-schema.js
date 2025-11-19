const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function checkSchema() {
  try {
    const pool = await sql.connect(config);
    console.log('✓ Connected to SQL Server\n');
    
    // Check for tables with similar names
    const tables = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
        AND (
          TABLE_NAME LIKE '%employee%' OR 
          TABLE_NAME LIKE '%department%' OR 
          TABLE_NAME LIKE '%work%' OR
          TABLE_NAME LIKE '%unit%'
        )
      ORDER BY TABLE_NAME
    `);
    
    console.log('Tables found related to employees/departments/work units:');
    console.log('='.repeat(60));
    tables.recordset.forEach(t => console.log(`  ${t.TABLE_NAME}`));
    console.log('='.repeat(60));
    
    // For each table, get column information
    for (const table of tables.recordset) {
      const columns = await pool.request().query(`
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          IS_NULLABLE,
          CHARACTER_MAXIMUM_LENGTH
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = '${table.TABLE_NAME}'
        ORDER BY ORDINAL_POSITION
      `);
      
      console.log(`\n📋 Table: ${table.TABLE_NAME}`);
      console.log('-'.repeat(60));
      columns.recordset.forEach(col => {
        const nullable = col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL';
        const length = col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : '';
        console.log(`  ${col.COLUMN_NAME.padEnd(30)} ${col.DATA_TYPE}${length} ${nullable}`);
      });
    }
    
    await pool.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkSchema();