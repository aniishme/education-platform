const router = require("express").Router();
const db = require("../db");
const s = require("../security");
router.get("/dashboard/details", s.requireRole(), async (req, res) => {
  const role = req.user.role;
  // Scope every activity/statistic to the signed-in role. These are completion
  // records, not estimates of video watch time.
  const filter =
    role === "LEARNER"
      ? "p.user_id=$1"
      : role === "EDUCATOR"
        ? "c.educator_id=$1"
        : "TRUE";
  const args = role === "ADMIN" ? [] : [req.user.id];
  const [weekly, recent, categories, registrations] = await Promise.all([
    db.query(
      `SELECT (p.completed_at AT TIME ZONE 'UTC')::date AS day,COUNT(*)::int AS lessons FROM lesson_progress p JOIN lessons l ON l.id=p.lesson_id JOIN sections s ON s.id=l.section_id JOIN courses c ON c.id=s.course_id WHERE ${filter} AND p.completed_at>=CURRENT_DATE-6 GROUP BY day ORDER BY day`,
      args,
    ),
    db.query(
      `SELECT l.title,c.title AS course_title,c.id AS course_id,u.name,p.completed_at FROM lesson_progress p JOIN users u ON u.id=p.user_id JOIN lessons l ON l.id=p.lesson_id JOIN sections s ON s.id=l.section_id JOIN courses c ON c.id=s.course_id WHERE ${filter} ORDER BY p.completed_at DESC LIMIT 6`,
      args,
    ),
    db.query(
      `SELECT c.category,COUNT(DISTINCT c.id)::int AS courses,COUNT(e.id)::int AS enrolments FROM courses c LEFT JOIN enrolments e ON e.course_id=c.id WHERE ${role === "EDUCATOR" ? "c.educator_id=$1" : role === "LEARNER" ? "e.user_id=$1" : "c.status='PUBLISHED'"} GROUP BY c.category ORDER BY enrolments DESC,c.category`,
      args,
    ),
    role === "ADMIN"
      ? db.query(
          "SELECT id,name,role,created_at FROM users ORDER BY created_at DESC LIMIT 6",
        )
      : db.query(
          `SELECT u.name,c.title,e.course_id,e.enrolled_at FROM enrolments e JOIN users u ON u.id=e.user_id JOIN courses c ON c.id=e.course_id WHERE ${role === "EDUCATOR" ? "c.educator_id=$1" : "e.user_id=$1"} ORDER BY e.enrolled_at DESC LIMIT 6`,
          [req.user.id],
        ),
  ]);
  res.json({
    weekly: weekly.rows,
    recent: recent.rows,
    categories: categories.rows,
    registrations: registrations.rows,
  });
});
module.exports = router;
