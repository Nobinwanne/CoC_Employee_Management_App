import { testConnection, getPool, closePool, sql } from "./config/database.js";

console.log("═══════════════════════════════════════════════");
console.log("Database Connection Test");
console.log("═══════════════════════════════════════════════");
console.log("");

async function runTests() {
  try {
    // Test 1: Basic connection
    console.log("Test 1: Testing basic connection...");
    const isConnected = await testConnection();

    if (!isConnected) {
      console.log("✗ Connection failed");
      process.exit(1);
    }

    // Test 2: Query departments
    console.log("");
    console.log("Test 2: Querying Departments table...");
    const pool = await getPool();
    const deptResult = await pool
      .request()
      .query("SELECT TOP 5 Id, Description FROM Departments");

    console.log(`✓ Found ${deptResult.recordset.length} departments:`);
    deptResult.recordset.forEach((dept) => {
      console.log(`  - ${dept.Description}`);
    });

    // Test 3: Query employees
    console.log("");
    console.log("Test 3: Querying Employees table...");
    const empResult = await pool
      .request()
      .query("SELECT COUNT(*) as count FROM Employees");

    console.log(
      `✓ Total employees in database: ${empResult.recordset[0].count}`,
    );

    // Test 4: Query work units
    console.log("");
    console.log("Test 4: Querying WorkUnits table...");
    const wuResult = await pool
      .request()
      .query("SELECT COUNT(*) as count FROM WorkUnits");

    console.log(
      `✓ Total work units in database: ${wuResult.recordset[0].count}`,
    );

    console.log("");
    console.log("═══════════════════════════════════════════════");
    console.log("✓ All tests passed!");
    console.log("═══════════════════════════════════════════════");
  } catch (err) {
    console.error("");
    console.error("✗ Test failed:", err.message);
    console.error("");
    console.error("Full error:", err);
  } finally {
    await closePool();
    process.exit(0);
  }
}

runTests();
