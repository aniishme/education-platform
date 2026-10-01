const db = require("../db");

const getCourses = async (req, res) => {
    try {
        const [courses] = await db.query(
            `SELECT
    id,
    title,
    description,
    category,
    level,
    duration,
    instructor,
    image,
    created_at
FROM courses`
        );

        res.json(courses);
    } catch (error) {
        console.error("Error fetching courses:", error);

        res.status(500).json({
            message: "Unable to fetch courses"
        });
    }
};

const createCourse = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            level,
            duration,
            instructor,
            image
        } = req.body;

        if (!title || !description || !category || !level) {
            return res.status(400).json({
                message: "Title, description, category and level are required"
            });
        }

        const [result] = await db.query(
            "INSERT INTO courses (title, description, category, level, duration, instructor, image) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
    title.trim(),
    description.trim(),
    category,
    level,
    duration ? duration.trim() : "",
    instructor || "TBD",
    image || ""
]
        );

        const [courses] = await db.query(
            "SELECT * FROM courses WHERE id = ?",
            [result.insertId]
        );

        res.status(201).json({
            message: "Course created successfully",
            course: courses[0]
        });

    } catch (error) {
        console.error("Error creating course:", error);

        res.status(500).json({
            message: "Unable to create course"
        });
    }
};

module.exports = {
    getCourses,
    createCourse
};