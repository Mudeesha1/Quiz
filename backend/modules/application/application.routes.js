const express = require("express");
const { getGrades, getSubjectsByGrade, getTopRankedUsers, getLeaderboard } = require("./controllers/grade.controller");
const { getPapers, createPaper, downloadPaper, bookmarkPaper, completePaper } = require("./controllers/paper.controller");
const { getQuizzes, getQuizById, submitQuiz } = require("./controllers/quiz.controller");
const { requireUser, requireUserOrAdmin } = require("../../middleware/auth");
const { uploadMultipleFiles } = require("../../middleware/fileUpload");

const applicationRoutes = express.Router();

// Public Routes
applicationRoutes.get("/health", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Application Server is running",
        timestamp: new Date().toISOString(),
    });
});

applicationRoutes.get("/grades", getGrades);
applicationRoutes.get("/grades/:gradeId/subjects", getSubjectsByGrade);
applicationRoutes.get("/leaderboard/top-3", getTopRankedUsers);

// Protected routes for registered users
applicationRoutes.get("/papers", requireUserOrAdmin, getPapers);
applicationRoutes.post("/papers", requireUserOrAdmin, uploadMultipleFiles("papers"), createPaper);
applicationRoutes.post("/papers/:paperId/download", requireUserOrAdmin, downloadPaper);
applicationRoutes.post("/papers/:paperId/bookmark", requireUserOrAdmin, bookmarkPaper);
applicationRoutes.post("/papers/:paperId/complete", requireUserOrAdmin, completePaper);

// Quizzes
applicationRoutes.get("/quizzes", requireUser, getQuizzes);
applicationRoutes.get("/quizzes/:quizId", requireUser, getQuizById);
applicationRoutes.post("/quizzes/:quizId/submit", requireUser, submitQuiz);

// Leaderboard
applicationRoutes.get("/leaderboard", requireUser, getLeaderboard);

module.exports = applicationRoutes;
