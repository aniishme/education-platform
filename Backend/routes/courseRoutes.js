const express = require("express");
const {
    getCourses,
    createCourse
} = require("../controllers/courseController");

const router = express.Router();

router.get("/", getCourses);
router.post("/", createCourse);

module.exports = router;