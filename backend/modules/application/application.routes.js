const express = require("express");
const { getGrades, getSubjectsByGrade, getTopRankedUsers } = require("./controllers/grade.controller");
const { getPapers, downloadPaper, bookmarkPaper, completePaper } = require("./controllers/paper.controller");
const { getQuizzes, getQuizById, submitQuiz } = require("./controllers/quiz.controller");
const { requireUser } = require("../../middleware/auth");

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
applicationRoutes.get("/papers", requireUser, getPapers);
applicationRoutes.post("/papers/:paperId/download", requireUser, downloadPaper);
applicationRoutes.post("/papers/:paperId/bookmark", requireUser, bookmarkPaper);
applicationRoutes.post("/papers/:paperId/complete", requireUser, completePaper);

// Quizzes
applicationRoutes.get("/quizzes", requireUser, getQuizzes);
applicationRoutes.get("/quizzes/:quizId", requireUser, getQuizById);
applicationRoutes.post("/quizzes/:quizId/submit", requireUser, submitQuiz);

module.exports = applicationRoutes;