const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const path = require("node:path");
const db = require("../db");
const run = promisify(execFile);
after(() => db.end());
async function seed() {
  await run(process.execPath, [path.join(__dirname, "../database/seed.js")], {
    timeout: 30000,
  });
}
async function snapshot() {
  const tables = {
    courses: "SELECT c.* FROM courses c WHERE demo_key IS NOT NULL ORDER BY id",
    sections:
      "SELECT s.* FROM sections s JOIN courses c ON c.id=s.course_id WHERE c.demo_key IS NOT NULL ORDER BY s.id",
    lessons:
      "SELECT l.* FROM lessons l JOIN sections s ON s.id=l.section_id JOIN courses c ON c.id=s.course_id WHERE c.demo_key IS NOT NULL ORDER BY l.id",
    enrolments:
      "SELECT e.* FROM enrolments e JOIN users u ON u.id=e.user_id JOIN courses c ON c.id=e.course_id WHERE c.demo_key IS NOT NULL AND u.email IN ('learner@example.com','maya@example.com','oliver@example.com','aisha@example.com','lucas@example.com','emma@example.com') ORDER BY e.id",
    progress:
      "SELECT p.* FROM lesson_progress p JOIN users u ON u.id=p.user_id WHERE u.email IN ('learner@example.com','maya@example.com','oliver@example.com','aisha@example.com','lucas@example.com','emma@example.com') ORDER BY p.user_id,p.lesson_id",
  };
  const result = {};
  for (const [table, sql] of Object.entries(tables))
    result[table] = (await db.query(sql)).rows;
  return result;
}
test("demo seed is repeatable without duplicates, overwritten content or lost progress", async () => {
  await seed();
  const before = await snapshot();
  await seed();
  const after = await snapshot();
  assert.deepEqual(after, before);
  assert.equal(after.courses.length, 12);
  assert.ok(after.lessons.length >= 73);
  assert.ok(after.enrolments.length > 20);
  assert.ok(after.progress.length > 40);
});
