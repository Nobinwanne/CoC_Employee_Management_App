import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getPool, closePool, testConnection } from "./config/database.js";

// Import routes
import employeesRouter from "./routes/employees.js";
import departmentsRouter from "./routes/departments.js";
import workunitsRouter from "./routes/workunits.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database: pool ? "Connected" : "Disconnected",
  });
});

// Database connection test endpoint
app.get("/api/test-connection", async (req, res) => {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      res.json({
        success: true,
        message: "Database connection successful",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Database connection failed",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Database connection test failed",
      message: err.message,
    });
  }
});

// API Routes
app.use("/api/employees", employeesRouter);
app.use("/api/departments", departmentsRouter);
app.use("/api/workunits", workunitsRouter);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Employee Management API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      testConnection: "/api/test-connection",
      employees: "/api/employees",
      departments: "/api/departments",
      workunits: "/api/workunits",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
let pool = null;

async function startServer() {
  try {
    // Test database connection
    console.log("Testing database connection...");
    pool = await getPool();
    console.log("✓ Database connected successfully");

    // Start Express server
    app.listen(PORT, () => {
      console.log("");
      console.log("═══════════════════════════════════════════════");
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`✓ Database: ${process.env.DB_DATABASE}`);
      console.log("");
      console.log("API Endpoints:");
      console.log(`  - Health Check:  http://localhost:${PORT}/health`);
      console.log(`  - Employees:     http://localhost:${PORT}/api/employees`);
      console.log(
        `  - Departments:   http://localhost:${PORT}/api/departments`,
      );
      console.log(`  - Work Units:    http://localhost:${PORT}/api/workunits`);
      console.log("═══════════════════════════════════════════════");
      console.log("");
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down gracefully...");
  await closePool();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nShutting down gracefully...");
  await closePool();
  process.exit(0);
});

// Start the server
startServer();
