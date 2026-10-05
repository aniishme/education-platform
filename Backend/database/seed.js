const bcrypt = require("bcrypt");
const db = require("../db");
async function seed() {
  if (process.env.NODE_ENV === "production")
    throw new Error("Demo seeding is only allowed in development.");
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const password = await bcrypt.hash("DemoPass123!", 12);
    const ids = {};
    for (const [role, name, email] of [
      ["ADMIN", "StudyFlow Admin", "admin@example.com"],
      ["EDUCATOR", "Alex Educator", "educator@example.com"],
      ["LEARNER", "Sam Learner", "learner@example.com"],
    ]) {
      const { rows } = await client.query(
        "INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4) ON CONFLICT(email) DO UPDATE SET email=EXCLUDED.email RETURNING id",
        [name, email, password, role],
      );
      ids[role] = rows[0].id;
    }
    for (const [title, category, modules] of [
      [
        "Web Development Fundamentals",
        "Web Development",
        [
          ["HTML", ["Introduction to HTML", "HTML Elements", "Forms"]],
          ["CSS", ["CSS Basics", "Flexbox", "Grid"]],
        ],
      ],
      [
        "Database Management",
        "Database",
        [
          [
            "Relational Design",
            ["Entities and Relationships", "Keys and Constraints"],
          ],
          ["SQL", ["Select Queries", "Joins"]],
        ],
      ],
      [
        "Python Programming",
        "Programming",
        [["Python Basics", ["Variables and Types", "Loops", "Functions"]]],
      ],
    ]) {
      if (
        (
          await client.query(
            "SELECT id FROM courses WHERE title=$1 AND educator_id=$2",
            [title, ids.EDUCATOR],
          )
        ).rowCount
      )
        continue;
      const {
        rows: [course],
      } = await client.query(
        "INSERT INTO courses(title,description,category,educator_id,status,duration) VALUES($1,$2,$3,$4,'PUBLISHED','Self-paced') RETURNING id",
        [
          title,
          `Learn ${title.toLowerCase()} with explanations and practical exercises.`,
          category,
          ids.EDUCATOR,
        ],
      );
      let firstLesson;
      for (const [index, [module, titles]] of modules.entries()) {
        const {
          rows: [section],
        } = await client.query(
          "INSERT INTO sections(course_id,title,position) VALUES($1,$2,$3) RETURNING id",
          [course.id, module, index],
        );
        for (const [position, title] of titles.entries()) {
          const {
            rows: [lesson],
          } = await client.query(
            "INSERT INTO lessons(section_id,title,description,content,position) VALUES($1,$2,$3,$4,$5) RETURNING id",
            [
              section.id,
              title,
              `Explore ${title.toLowerCase()}.`,
              `Welcome to ${title}.\n\nRead the concepts, experiment with a small example and explain what you learned in your own words.\n\nPractice: create a working example using the topic above, then review and improve it.`,
              position,
            ],
          );
          firstLesson ||= lesson.id;
        }
      }
      await client.query(
        "INSERT INTO enrolments(user_id,course_id,last_lesson_id,last_accessed_at) VALUES($1,$2,$3,NOW())",
        [ids.LEARNER, course.id, firstLesson],
      );
      await client.query(
        "INSERT INTO lesson_progress(user_id,lesson_id) VALUES($1,$2)",
        [ids.LEARNER, firstLesson],
      );
    }
    await client.query("COMMIT");
    console.log(
      "Demo seed ready. Accounts: admin/educator/learner@example.com; password DemoPass123!",
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.end());
