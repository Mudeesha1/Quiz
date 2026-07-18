const express = require("express");
const { loginAdmin, registerAdmin } = require("./controllers/adminAuth.controller");
const { getAllUsers, createUser, updateUser, deleteUser, getUserPerformance, getDashboardStats, toggleReviewVisibility } = require("./controllers/adminUser.controller");
const { getAllQuizzes, createQuiz, updateQuiz, deleteQuiz } = require("./controllers/adminQuiz.controller");
const { getAdminProfile, updateAdminProfile, changeAdminPassword, getOpenRouterKey, updateOpenRouterKey } = require("./controllers/adminSettings.controller");
const { generateQuizFromAI, chatWithAI } = require("./controllers/adminAI.controller");
const { requireAdmin } = require("../../middleware/auth");
const { uploadSingleFile, UPLOAD_CONFIG } = require("../../middleware/fileUpload");

const adminRoutes = express.Router();

// Public Routes
adminRoutes.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Admin Server is running",
    timestamp: new Date().toISOString(),
  });
});

adminRoutes.post("/login", loginAdmin);
adminRoutes.post("/register", registerAdmin);

// Admin Settings Routes
adminRoutes.get("/settings/profile", requireAdmin, getAdminProfile);
adminRoutes.put("/settings/profile", requireAdmin, uploadSingleFile("profiles"), updateAdminProfile);
adminRoutes.put("/settings/change-password", requireAdmin, changeAdminPassword);
adminRoutes.get("/settings/openrouter-key", requireAdmin, getOpenRouterKey);
adminRoutes.put("/settings/openrouter-key", requireAdmin, updateOpenRouterKey);
adminRoutes.post("/ai-assistant/generate-quiz", requireAdmin, generateQuizFromAI);
adminRoutes.post("/ai-assistant/chat", requireAdmin, chatWithAI);

// Protected Admin Routes
adminRoutes.get("/users", requireAdmin, getAllUsers);
adminRoutes.post("/users", requireAdmin, uploadSingleFile("profiles"), createUser);
adminRoutes.put("/users/:userId", requireAdmin, uploadSingleFile("profiles"), updateUser);
adminRoutes.delete("/users/:userId", requireAdmin, deleteUser);
adminRoutes.get("/users/:userId/performance", requireAdmin, getUserPerformance);
adminRoutes.put("/users/:userId/review/visibility", requireAdmin, toggleReviewVisibility);
adminRoutes.get("/dashboard-stats", requireAdmin, getDashboardStats);

// Quizzes CRUD Routes
adminRoutes.get("/quizzes", requireAdmin, getAllQuizzes);
adminRoutes.post("/quizzes", requireAdmin, createQuiz);
adminRoutes.put("/quizzes/:quizId", requireAdmin, updateQuiz);
adminRoutes.delete("/quizzes/:quizId", requireAdmin, deleteQuiz);
adminRoutes.post("/quizzes/upload-image", requireAdmin, uploadSingleFile("quiz-questions"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "fail",
        message: "No file uploaded",
      });
    }
    const fileUrl = UPLOAD_CONFIG.getUrlPath("quiz-questions", req.file.filename);
    return res.status(200).json({
      status: "success",
      message: "Question image uploaded successfully",
      data: {
        url: fileUrl,
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
});

module.exports = adminRoutes;