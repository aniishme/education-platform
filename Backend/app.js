const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const db = require("./db");
const s = require("./security");
const app = express();
const origin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
app.disable("x-powered-by");
app.use(cors({ origin, credentials: true }));
app.use(express.json({ limit: "256kb" }));
app.use((req,res,next)=>{
 if(req.body!==undefined && (req.body===null || typeof req.body!=='object' || Array.isArray(req.body))) return res.status(400).json({message:'Request body must be a JSON object.'});
 req.body ||= {};
 next();
});
app.use("/api", (req, res, next) => {
  if (
    !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
    req.headers.origin &&
    req.headers.origin !== origin
  )
    return res.status(403).json({ message: "Request origin is not allowed." });
  next();
});
app.use("/api", rateLimit({ windowMs: 15 * 60000, limit: 1000 }));
app.use("/api", s.session);
app.get("/api/health", async (req, res) => {
  await db.query("SELECT 1");
  res.json({ status: "ok", database: "PostgreSQL" });
});
app.use("/api/auth", require("./routes/auth"));
app.use("/api/courses", require("./routes/courses").router);
app.use("/api", require("./routes/learning"));
app.get("/api/dashboard", s.requireRole(), async (req, res) => {
  if (req.user.role === "ADMIN") {
    const { rows } =
      await db.query(`SELECT (SELECT COUNT(*)::int FROM users) AS users,
   (SELECT COUNT(*)::int FROM users WHERE role='LEARNER') AS learners,
   (SELECT COUNT(*)::int FROM users WHERE role='EDUCATOR') AS educators,
   (SELECT COUNT(*)::int FROM courses) AS courses,(SELECT COUNT(*)::int FROM enrolments) AS enrolments`);
    res.json(rows[0]);
  } else if (req.user.role === "EDUCATOR") {
    const { rows } = await db.query(
      `SELECT COUNT(*)::int AS courses,COUNT(*) FILTER(WHERE status='PUBLISHED')::int AS published,
   (SELECT COUNT(*)::int FROM enrolments e JOIN courses c ON c.id=e.course_id WHERE c.educator_id=$1) AS enrolments FROM courses WHERE educator_id=$1`,
      [req.user.id],
    );
    res.json(rows[0]);
  } else res.json({ message: "See your enrolments for course progress." });
});
app.use("/api", require("./routes/admin"));
app.use((req, res) => res.status(404).json({ message: "Resource not found." }));
app.use((error, req, res, _next) => {
  if (error.code === "23505")
    return res
      .status(409)
      .json({ message: "This email or enrolment already exists." });
  if (error.code === "23503")
    return res
      .status(400)
      .json({ message: "A related resource is unavailable." });
  if (error.type === "entity.parse.failed")
    return res.status(400).json({ message: "Invalid JSON request." });
  if (error.status)
    return res.status(error.status).json({ message: error.message });
  console.error(error);
  res
    .status(500)
    .json({ message: "Unable to complete your request. Please try again." });
});
module.exports = app;
