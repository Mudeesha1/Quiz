require("express-async-error");
const express = require("express");
const cors = require("cors");
const path = require("path");
const errorHandler = require("./handlers/error.handler");
require("dotenv").config();
const sequelize = require("./config/db.config");
require("./models/associations");
const usersRoutes = require("./modules/users/users.routes");
const adminRoutes = require("./modules/admin/admin.routes");
const applicationRoutes = require("./modules/application/application.routes");
const uploadsRoutes = require("./modules/uploads/uploads.routes");
const { initializeSystemData } = require("./managers/systemInitializer");
const app = express();
app.use(cors());

// Initialize Database Connection
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("✓ Database connection established successfully!");
    await sequelize.sync();
    console.log("✓ Database synchronized successfully!");
    
    // Initialize system data (levels, badges, etc)
    await initializeSystemData();
  } catch (error) {
    console.error("✗ Unable to connect to database:", error.message);
    process.exit(1);
  }
};

initializeDatabase();


/// Express 
app.use(express.json());

// Serve static files from uploads directory
app.use("/api/v1/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Use the defined routes
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/app", applicationRoutes);
app.use("/api/v1/uploads", uploadsRoutes);


/// end of all routes......
app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

app.use(errorHandler);


module.exports = app;

if (require.main === module) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log("Server started successfully !");
    console.log(`http://localhost:${port}`);
  });
}