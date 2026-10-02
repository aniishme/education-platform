const express = require("express");
const router = express.Router();

const {
    getLessonsByCourse,
    getLessonById
} = require("../controllers/lessonsController");

// Get all lessons for a course
router.get("/course/:courseId", getLessonsByCourse);

// Get one lesson
router.get("/:id", getLessonById);

module.exports = router;