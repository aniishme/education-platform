const db = require("../db");

const getEnrolments = async (req, res) => {
    try {
        const [enrolments] = await db.query(
            `SELECT
                e.id,
                e.user_id,
                e.course_id,
                e.enrolled_at,
                u.name AS user_name,
                u.email AS user_email,
                c.title AS course_title
             FROM enrolments e
             INNER JOIN users u ON e.user_id = u.id
             INNER JOIN courses c ON e.course_id = c.id
             ORDER BY e.enrolled_at DESC`
        );

        res.json(enrolments);

    } catch (error) {
        console.error("Error fetching enrolments:", error);

        res.status(500).json({
            message: "Unable to fetch enrolments"
        });
    }
};
const createEnrolment = async (req, res) => {
    try {
        const { user_id, course_id } = req.body;

        if (!user_id || !course_id) {
            return res.status(400).json({
                message: "User ID and course ID are required"
            });
        }

        const [result] = await db.query(
            `INSERT INTO enrolments (user_id, course_id)
             VALUES (?, ?)`,
            [user_id, course_id]
        );

        const [enrolments] = await db.query(
            `SELECT
                e.id,
                e.user_id,
                e.course_id,
                e.enrolled_at,
                u.name AS user_name,
                u.email AS user_email,
                c.title AS course_title
             FROM enrolments e
             INNER JOIN users u ON e.user_id = u.id
             INNER JOIN courses c ON e.course_id = c.id
             WHERE e.id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            message: "Course enrolled successfully",
            enrolment: enrolments[0]
        });

    } catch (error) {
        console.error("Error creating enrolment:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "User is already enrolled in this course"
            });
        }

        res.status(500).json({
            message: "Unable to create enrolment"
        });
    }
};
module.exports = {
    getEnrolments,
    createEnrolment
};

