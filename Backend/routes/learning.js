const router = require("express").Router();
const db = require("../db");
const s = require("../security");
const access = require("../courseAccess");
const { progress } = require("./courses");
router.get("/learning/progress", s.requireRole("LEARNER"), async (req, res) => {
  const [activity, history, modules] = await Promise.all([
    db.query(
      `SELECT to_char(p.completed_at AT TIME ZONE 'UTC','YYYY-MM-DD') AS day,COUNT(*)::int AS lessons FROM lesson_progress p JOIN lessons l ON l.id=p.lesson_id JOIN sections s ON s.id=l.section_id JOIN enrolments e ON e.course_id=s.course_id AND e.user_id=p.user_id WHERE p.user_id=$1 AND p.completed_at>=((NOW() AT TIME ZONE 'UTC')::date-27) AT TIME ZONE 'UTC' GROUP BY day ORDER BY day`,
      [req.user.id],
    ),
    db.query(
      `SELECT p.lesson_id,l.title,c.title AS course_title,c.id AS course_id,p.completed_at FROM lesson_progress p JOIN lessons l ON l.id=p.lesson_id JOIN sections s ON s.id=l.section_id JOIN courses c ON c.id=s.course_id JOIN enrolments e ON e.course_id=c.id AND e.user_id=p.user_id WHERE p.user_id=$1 ORDER BY p.completed_at DESC,p.lesson_id LIMIT 12`,
      [req.user.id],
    ),
    db.query(
      `SELECT s.id,s.title,s.course_id,COUNT(l.id)::int AS total_lessons,COUNT(p.lesson_id)::int AS completed_lessons FROM sections s JOIN enrolments e ON e.course_id=s.course_id AND e.user_id=$1 LEFT JOIN lessons l ON l.section_id=s.id LEFT JOIN lesson_progress p ON p.lesson_id=l.id AND p.user_id=e.user_id GROUP BY s.id ORDER BY s.course_id,s.position,s.id`,
      [req.user.id],
    ),
  ]);
  res.json({
    activity: activity.rows,
    history: history.rows,
    modules: modules.rows.map(progress),
  });
});
router.get("/enrolments", s.requireRole(), async (req, res) => {
  const args = [];
  let filter = "";
  if (req.user.role !== "ADMIN") {
    args.push(req.user.id);
    filter =
      req.user.role === "EDUCATOR"
        ? "WHERE c.educator_id=$1"
        : "WHERE e.user_id=$1";
  }
  const { rows } = await db.query(
    `SELECT e.*,c.title,c.title AS course_title,c.description,c.category,c.status,c.image,c.subtitle,c.level,c.duration,u.name AS user_name,u.email AS user_email,
 (SELECT COUNT(*)::int FROM lessons l JOIN sections s ON s.id=l.section_id WHERE s.course_id=c.id) AS total_lessons,
 (SELECT COUNT(*)::int FROM lesson_progress p JOIN lessons l ON l.id=p.lesson_id JOIN sections s ON s.id=l.section_id WHERE p.user_id=e.user_id AND s.course_id=c.id) AS completed_lessons
 FROM enrolments e JOIN courses c ON c.id=e.course_id JOIN users u ON u.id=e.user_id ${filter}
 ORDER BY e.last_accessed_at DESC NULLS LAST,e.enrolled_at DESC`,
    args,
  );
  res.json(rows.map(progress));
});
router.post("/enrolments", s.requireRole("LEARNER"), async (req, res) => {
  const course = await access.course(req, req.body.course_id);
  const { rows } = await db.query(
    "INSERT INTO enrolments(user_id,course_id) VALUES($1,$2) RETURNING *",
    [req.user.id, course.id],
  );
  await db.query("INSERT INTO activity(message) VALUES($1)", [
    `${req.user.name} enrolled in ${course.title}`.slice(0, 255),
  ]);
  res.status(201).json({ enrolment: rows[0] });
});
router.delete(
  "/enrolments/:id",
  s.requireRole("LEARNER", "ADMIN"),
  async (req, res) => {
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query(
        "SELECT * FROM enrolments WHERE id=$1 FOR UPDATE",
        [s.id(req.params.id)],
      );
      if (!rows[0]) s.fail(404, "Enrolment not found.");
      if (req.user.role !== "ADMIN" && rows[0].user_id !== req.user.id)
        s.fail(403, "You can only leave your own enrolments.");
      await client.query(
        "DELETE FROM lesson_progress p USING lessons l,sections s WHERE p.lesson_id=l.id AND l.section_id=s.id AND s.course_id=$1 AND p.user_id=$2",
        [rows[0].course_id, rows[0].user_id],
      );
      await client.query("DELETE FROM enrolments WHERE id=$1", [rows[0].id]);
      await client.query("COMMIT");
      res.json({ message: "Enrolment removed." });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
);
router.get("/lessons/:id", s.requireRole(), async (req, res) => {
  const lesson = await access.lesson(req, req.params.id);
  const { rowCount } = await db.query(
    "SELECT 1 FROM lesson_progress WHERE user_id=$1 AND lesson_id=$2",
    [req.user.id, lesson.id],
  );
  if (req.user.role === "LEARNER")
    await db.query(
      "UPDATE enrolments SET last_lesson_id=$1,last_accessed_at=NOW() WHERE user_id=$2 AND course_id=$3",
      [lesson.id, req.user.id, lesson.course_id],
    );
  res.json({ ...lesson, completed: rowCount > 0 });
});
router.put(
  "/lessons/:id/progress",
  s.requireRole("LEARNER"),
  async (req, res) => {
    const lesson = await access.lesson(req, req.params.id);
    if (typeof req.body.completed !== "boolean")
      s.fail(400, "Completed must be true or false.");
    if (req.body.completed)
      await db.query(
        "INSERT INTO lesson_progress(user_id,lesson_id) VALUES($1,$2) ON CONFLICT DO NOTHING",
        [req.user.id, lesson.id],
      );
    else
      await db.query(
        "DELETE FROM lesson_progress WHERE user_id=$1 AND lesson_id=$2",
        [req.user.id, lesson.id],
      );
    res.json({ completed: req.body.completed });
  },
);
router.get("/courses/:id/progress", s.requireRole(), async (req, res) => {
  const course = await access.course(req, req.params.id, false, true);
  const { rows } = await db.query(
    "SELECT p.lesson_id FROM lesson_progress p JOIN lessons l ON l.id=p.lesson_id JOIN sections s ON s.id=l.section_id WHERE p.user_id=$1 AND s.course_id=$2",
    [req.user.id, course.id],
  );
  res.json(rows.map((row) => row.lesson_id));
});
module.exports = router;
