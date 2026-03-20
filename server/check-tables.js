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

async function checkTables() {
  try {
    const pool = await sql.connect(config);
    console.log('✓ Connected to SQL Server\n');
    
    // Get all tables
    const tables = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);
    
    console.log('Available tables in CoC_EMS database:');
    console.log('='.repeat(50));
    tables.recordset.forEach(t => console.log(`  - ${t.TABLE_NAME}`));
    console.log('='.repeat(50));
    console.log(`\nTotal tables: ${tables.recordset.length}\n`);
    
    // Check if our expected tables exist
    const checkTable = async (tableName) => {
      const result = await pool.request().query(`
        SELECT COUNT(*) as count 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = '${tableName}'
      `);
      return result.recordset[0].count > 0;
    };
    
    const hasEmployees = await checkTable('Employees');
    const hasDepartments = await checkTable('Departments');
    const hasWorkUnits = await checkTable('WorkUnits');
    
    console.log('Expected tables status:');
    console.log(`  Employees: ${hasEmployees ? '✓ EXISTS' : '✗ MISSING'}`);
    console.log(`  Departments: ${hasDepartments ? '✓ EXISTS' : '✗ MISSING'}`);
    console.log(`  WorkUnits: ${hasWorkUnits ? '✓ EXISTS' : '✗ MISSING'}`);
    
    if (!hasEmployees || !hasDepartments || !hasWorkUnits) {
      console.log('\n⚠ Some tables are missing. Would you like to create them?');
      console.log('Run the schema.sql script to create the required tables.');
    }
    
    await pool.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkTables();