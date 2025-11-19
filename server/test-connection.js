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

async function testConnection() {
  try {
    console.log('Attempting to connect to SQL Server...');
    console.log('Server:', config.server);
    console.log('Database:', config.database);
    console.log('User:', config.user);
    
    const pool = await sql.connect(config);
    console.log('✓ Successfully connected to SQL Server!');
    
    const result = await pool.request().query('SELECT @@VERSION as Version');
    console.log('SQL Server Version:', result.recordset[0].Version);
    
    await pool.close();
    console.log('✓ Connection closed');
  } catch (err) {
    console.error('✗ Connection failed:', err.message);
    console.error('Full error:', err);
  }
}

testConnection();