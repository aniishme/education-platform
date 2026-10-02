const db = require("../db");

// Get all lessons for a course
exports.getLessonsByCourse = (req, res) => {
    const { courseId } = req.params;

    const sql = `
        SELECT *
        FROM lessons
        WHERE course_id = ?
        ORDER BY lesson_order ASC
    `;

    db.query(sql, [courseId], (err, results) => {
        if (err) {
            console.error("Error fetching lessons:", err);
            return res.status(500).json({
                message: "Failed to fetch lessons"
            });
        }

        res.json(results);
    });
};

// Get a single lesson
exports.getLessonById = (req, res) => {
    const { id } = req.params;

    const sql = "SELECT * FROM lessons WHERE id = ?";

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Error fetching lesson:", err);
            return res.status(500).json({
                message: "Failed to fetch lesson"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Lesson not found"
            });
        }

        res.json(results[0]);
    });
};