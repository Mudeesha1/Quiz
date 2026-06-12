const Grade = require("./grade.model");
const User = require("./users.model");
const Admin = require("./admin.model");
const UserLevel = require("./userLevel.model");
const Subject = require("./subject.model");
const GradeHasSubject = require("./gradeHasSubject.model");
const Year = require("./year.model");
const SubjectHasYear = require("./subjectHasYear.model");
const Paper = require("./paper.model");
const UserPaperProgress = require("./userPaperProgress.model");
const UserPaperBookmark = require("./userPaperBookmark.model");
const Quiz = require("./quiz.model");
const Question = require("./question.model");
const QuestionOption = require("./questionOption.model");
const QuizAttempt = require("./quizAttempt.model");
const UserAnswer = require("./userAnswer.model");
const Badge = require("./badge.model");
const UserBadge = require("./userBadge.model");
const UserReview = require("./userReview.model");

// Grade - User relationship
Grade.hasMany(User, {
  foreignKey: "grade_id",
  as: "users",
});

User.belongsTo(Grade, {
  foreignKey: "grade_id",
  as: "grade",
});

// UserLevel - User relationship
UserLevel.hasMany(User, {
  foreignKey: "current_level_id",
  as: "users",
});

User.belongsTo(UserLevel, {
  foreignKey: "current_level_id",
  as: "currentLevel",
});

// Grade - Subject relationship (Many to Many through GradeHasSubject)
Grade.hasMany(GradeHasSubject, {
  foreignKey: "grade_id",
  as: "gradeHasSubjects",
  onDelete: "CASCADE",
});

GradeHasSubject.belongsTo(Grade, {
  foreignKey: "grade_id",
  as: "grade",
});

Subject.hasMany(GradeHasSubject, {
  foreignKey: "subjects_id",
  as: "gradeHasSubjects",
  onDelete: "CASCADE",
});

GradeHasSubject.belongsTo(Subject, {
  foreignKey: "subjects_id",
  as: "subject",
});

Grade.belongsToMany(Subject, {
  through: GradeHasSubject,
  foreignKey: "grade_id",
  otherKey: "subjects_id",
  as: "subjects",
});

Subject.belongsToMany(Grade, {
  through: GradeHasSubject,
  foreignKey: "subjects_id",
  otherKey: "grade_id",
  as: "grades",
});

// Year relationships
Subject.hasMany(SubjectHasYear, {
  foreignKey: "subjects_id",
  as: "subjectHasYears",
  onDelete: "CASCADE",
});

SubjectHasYear.belongsTo(Subject, {
  foreignKey: "subjects_id",
  as: "subject",
});

Year.hasMany(SubjectHasYear, {
  foreignKey: "years_id",
  as: "subjectHasYears",
  onDelete: "CASCADE",
});

SubjectHasYear.belongsTo(Year, {
  foreignKey: "years_id",
  as: "year",
});

Subject.belongsToMany(Year, {
  through: SubjectHasYear,
  foreignKey: "subjects_id",
  otherKey: "years_id",
  as: "years",
});

Year.belongsToMany(Subject, {
  through: SubjectHasYear,
  foreignKey: "years_id",
  otherKey: "subjects_id",
  as: "subjects",
});

// Paper relationships
SubjectHasYear.hasMany(Paper, {
  foreignKey: "subjects_has_years_id",
  as: "papers",
  onDelete: "CASCADE",
});

Paper.belongsTo(SubjectHasYear, {
  foreignKey: "subjects_has_years_id",
  as: "subjectHasYear",
});

// User - Paper relationships (through UserPaperProgress)
User.hasMany(UserPaperProgress, {
  foreignKey: "user_id",
  as: "paperProgress",
  onDelete: "CASCADE",
});

UserPaperProgress.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

Paper.hasMany(UserPaperProgress, {
  foreignKey: "paper_id",
  as: "userProgress",
  onDelete: "CASCADE",
});

UserPaperProgress.belongsTo(Paper, {
  foreignKey: "paper_id",
  as: "paper",
});

User.belongsToMany(Paper, {
  through: UserPaperProgress,
  foreignKey: "user_id",
  otherKey: "paper_id",
  as: "papers",
});

Paper.belongsToMany(User, {
  through: UserPaperProgress,
  foreignKey: "paper_id",
  otherKey: "user_id",
  as: "users",
});

// User - Paper Bookmarks relationships
User.hasMany(UserPaperBookmark, {
  foreignKey: "user_id",
  as: "paperBookmarks",
  onDelete: "CASCADE",
});

UserPaperBookmark.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

Paper.hasMany(UserPaperBookmark, {
  foreignKey: "paper_id",
  as: "userBookmarks",
  onDelete: "CASCADE",
});

UserPaperBookmark.belongsTo(Paper, {
  foreignKey: "paper_id",
  as: "paper",
});

User.belongsToMany(Paper, {
  through: UserPaperBookmark,
  foreignKey: "user_id",
  otherKey: "paper_id",
  as: "bookmarkedPapers",
});

Paper.belongsToMany(User, {
  through: UserPaperBookmark,
  foreignKey: "paper_id",
  otherKey: "user_id",
  as: "bookmarkedByUsers",
});

// Quiz relationships
Quiz.hasMany(Question, {
  foreignKey: "quiz_id",
  as: "questions",
  onDelete: "CASCADE",
});

Question.belongsTo(Quiz, {
  foreignKey: "quiz_id",
  as: "quiz",
});

// GradeHasSubject - Quiz relationship
GradeHasSubject.hasMany(Quiz, {
  foreignKey: "grade_has_subjects_id",
  as: "quizzes",
  onDelete: "CASCADE",
});

Quiz.belongsTo(GradeHasSubject, {
  foreignKey: "grade_has_subjects_id",
  as: "gradeHasSubject",
});

// Question - QuestionOption relationship
Question.hasMany(QuestionOption, {
  foreignKey: "question_id",
  as: "options",
  onDelete: "CASCADE",
});

QuestionOption.belongsTo(Question, {
  foreignKey: "question_id",
  as: "question",
});

// User - QuizAttempt relationship
User.hasMany(QuizAttempt, {
  foreignKey: "user_id",
  as: "quizAttempts",
  onDelete: "CASCADE",
});

QuizAttempt.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// Quiz - QuizAttempt relationship
Quiz.hasMany(QuizAttempt, {
  foreignKey: "quiz_id",
  as: "attempts",
  onDelete: "CASCADE",
});

QuizAttempt.belongsTo(Quiz, {
  foreignKey: "quiz_id",
  as: "quiz",
});

// QuizAttempt - UserAnswer relationship
QuizAttempt.hasMany(UserAnswer, {
  foreignKey: "quiz_attempt_id",
  as: "answers",
  onDelete: "CASCADE",
});

UserAnswer.belongsTo(QuizAttempt, {
  foreignKey: "quiz_attempt_id",
  as: "quizAttempt",
});

// Question - UserAnswer relationship
Question.hasMany(UserAnswer, {
  foreignKey: "question_id",
  as: "userAnswers",
  onDelete: "CASCADE",
});

UserAnswer.belongsTo(Question, {
  foreignKey: "question_id",
  as: "question",
});

// QuestionOption - UserAnswer relationship
QuestionOption.hasMany(UserAnswer, {
  foreignKey: "selected_option_id",
  as: "userAnswers",
});

UserAnswer.belongsTo(QuestionOption, {
  foreignKey: "selected_option_id",
  as: "selectedOption",
});

// User - Badge relationship (Many to Many through UserBadge)
User.hasMany(UserBadge, {
  foreignKey: "user_id",
  as: "userBadges",
  onDelete: "CASCADE",
});

UserBadge.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

Badge.hasMany(UserBadge, {
  foreignKey: "badge_id",
  as: "userBadges",
  onDelete: "CASCADE",
});

UserBadge.belongsTo(Badge, {
  foreignKey: "badge_id",
  as: "badge",
});

// Many to Many relationship via association
User.belongsToMany(Badge, {
  through: UserBadge,
  foreignKey: "user_id",
  otherKey: "badge_id",
  as: "badges",
});

Badge.belongsToMany(User, {
  through: UserBadge,
  foreignKey: "badge_id",
  otherKey: "user_id",
  as: "users",
});

// User - UserReview relationship (One-to-One)
User.hasOne(UserReview, {
  foreignKey: "user_id",
  as: "review",
  onDelete: "CASCADE",
});

UserReview.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

module.exports = {
  Grade,
  User,
  Admin,
  UserLevel,
  Subject,
  GradeHasSubject,
  Year,
  SubjectHasYear,
  Paper,
  UserPaperProgress,
  UserPaperBookmark,
  Quiz,
  Question,
  QuestionOption,
  QuizAttempt,
  UserAnswer,
  Badge,
  UserBadge,
  UserReview,
};