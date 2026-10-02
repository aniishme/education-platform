const express = require("express");

const router = express.Router();

const {
    getLessonsByCourse,
    getLessonById,
    completeLesson,
    getLessonProgress
} = require("../controllers/lessonsController");

// Get all lessons for a course
router.get("/course/:courseId", getLessonsByCourse);

// Get completed lessons for a user in a course
router.get("/progress/:userId/:courseId", getLessonProgress);

// Mark a lesson as completed
router.post("/complete", completeLesson);

// Get one lesson
router.get("/:id", getLessonById);

module.exports = router;