const bcrypt = require("bcrypt");
const db = require("../db");
const catalogue = require("./catalogue");

async function seed() {
  if (process.env.NODE_ENV === "production")
    throw new Error("Demo seeding is only allowed in development.");
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const password = await bcrypt.hash("DemoPass123!", 12);
    const accounts = [
      ["ADMIN", "StudyFlow Admin", "admin@example.com"],
      ["EDUCATOR", "Alex Educator", "educator@example.com"],
      ["EDUCATOR", "Priya Sharma", "priya@example.com"],
      ["EDUCATOR", "Jordan Lee", "jordan@example.com"],
      ["LEARNER", "Sam Learner", "learner@example.com"],
      ["LEARNER", "Maya Chen", "maya@example.com"],
      ["LEARNER", "Oliver James", "oliver@example.com"],
      ["LEARNER", "Aisha Khan", "aisha@example.com"],
      ["LEARNER", "Lucas Nguyen", "lucas@example.com"],
      ["LEARNER", "Emma Wilson", "emma@example.com"],
    ];
    const users = {};
    for (const [role, name, email] of accounts) {
      const { rows } = await client.query(
        "INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4) ON CONFLICT(email) DO UPDATE SET email=EXCLUDED.email RETURNING id,role",
        [name, email, password, role],
      );
      // Never turn an existing account into a demo role or reset its password.
      if (rows[0].role !== role)
        throw new Error(
          `Demo email ${email} belongs to a different role; seed cancelled.`,
        );
      users[email] = rows[0].id;
    }
    const courses = [];
    for (const [index, item] of catalogue.entries()) {
      let existing = (
        await client.query("SELECT * FROM courses WHERE demo_key=$1", [
          item.key,
        ])
      ).rows[0];
      if (!existing && index < 3)
        existing = (
          await client.query(
            "SELECT * FROM courses WHERE title=$1 AND educator_id=$2 AND demo_key IS NULL ORDER BY id LIMIT 1",
            [item.title, users["educator@example.com"]],
          )
        ).rows[0];
      const minutes = item.modules
        .flatMap((m) => m.lessons)
        .reduce((sum, l) => sum + l.minutes, 0);
      const duration = `${Math.floor(minutes / 60)}h ${minutes % 60}m guided study`;
      let id = existing?.id;
      if (!existing) {
        const owner =
          index < 6
            ? "educator@example.com"
            : index < 9
              ? "priya@example.com"
              : "jordan@example.com";
        const { rows } = await client.query(
          `INSERT INTO courses(title,subtitle,description,category,level,duration,educator_id,status,outcomes,requirements,video_url,resource_credit,demo_key) VALUES($1,$2,$3,$4,$5,$6,$7,'PUBLISHED',$8,$9,$10,$11,$12) RETURNING id`,
          [
            item.title,
            item.subtitle,
            item.description,
            item.category,
            item.level,
            duration,
            users[owner],
            item.outcomes,
            item.requirements,
            item.video_url,
            item.resource_credit,
            item.key,
          ],
        );
        id = rows[0].id;
      } else if (!existing.demo_key) {
        // Upgrade only the original generic fixture; preserve educator changes.
        await client.query(
          `UPDATE courses SET demo_key=$1,subtitle=CASE WHEN subtitle='' THEN $2 ELSE subtitle END,outcomes=CASE WHEN outcomes='' THEN $3 ELSE outcomes END,requirements=CASE WHEN requirements='' THEN $4 ELSE requirements END,video_url=CASE WHEN video_url='' THEN $5 ELSE video_url END,resource_credit=CASE WHEN resource_credit='' THEN $6 ELSE resource_credit END,description=CASE WHEN description=$7 THEN $8 ELSE description END,duration=CASE WHEN duration='Self-paced' THEN $9 ELSE duration END WHERE id=$10`,
          [
            item.key,
            item.subtitle,
            item.outcomes,
            item.requirements,
            item.video_url,
            item.resource_credit,
            `Learn ${item.title.toLowerCase()} with explanations and practical exercises.`,
            item.description,
            duration,
            id,
          ],
        );
      }
      const lessonIds = [];
      if (existing?.demo_key) {
        const { rows } = await client.query(
          "SELECT l.id FROM lessons l JOIN sections s ON s.id=l.section_id WHERE s.course_id=$1 ORDER BY s.position,s.id,l.position,l.id",
          [id],
        );
        courses.push({
          id,
          lessonIds: rows.map((l) => l.id),
          title: existing.title,
        });
        continue;
      }
      for (const [position, module] of item.modules.entries()) {
        let section = (
          await client.query(
            "SELECT id FROM sections WHERE course_id=$1 AND title=$2 ORDER BY id LIMIT 1",
            [id, module.title],
          )
        ).rows[0];
        if (!section)
          section = (
            await client.query(
              "INSERT INTO sections(course_id,title,position) VALUES($1,$2,$3) RETURNING id",
              [id, module.title, position],
            )
          ).rows[0];
        for (const [order, lesson] of module.lessons.entries()) {
          let old = (
            await client.query(
              "SELECT id,content FROM lessons WHERE section_id=$1 AND title=$2 ORDER BY id LIMIT 1",
              [section.id, lesson.title],
            )
          ).rows[0];
          if (!old)
            old = (
              await client.query(
                "INSERT INTO lessons(section_id,title,description,content,video_url,position,duration_minutes) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id",
                [
                  section.id,
                  lesson.title,
                  lesson.description,
                  lesson.content,
                  item.video_url,
                  order,
                  lesson.minutes,
                ],
              )
            ).rows[0];
          else if (
            old.content?.startsWith(
              `Welcome to ${lesson.title}.\n\nRead the concepts`,
            )
          )
            await client.query(
              "UPDATE lessons SET description=$1,content=$2,video_url=$3,duration_minutes=$4 WHERE id=$5",
              [
                lesson.description,
                lesson.content,
                item.video_url,
                lesson.minutes,
                old.id,
              ],
            );
          lessonIds.push(old.id);
        }
      }
      courses.push({ id, lessonIds, title: item.title });
    }
    // Demonstration activity is inserted only with a new enrolment. Reseeding
    // neither resets real progress nor brings completed lessons back.
    const learners = accounts.filter((a) => a[0] === "LEARNER");
    for (const [learnerIndex, [, name, email]] of learners.entries()) {
      for (const [courseIndex, course] of courses.entries()) {
        if (!course.lessonIds.length) continue;
        if (
          learnerIndex === 0
            ? ![0, 1, 2, 3, 6, 9].includes(courseIndex)
            : (courseIndex + learnerIndex) % 3 === 0
        )
          continue;
        const completed =
          learnerIndex === 0 && courseIndex === 6
            ? course.lessonIds.length
            : Math.min(
                course.lessonIds.length,
                1 + ((learnerIndex + courseIndex) % 5),
              );
        const { rowCount } = await client.query(
          `INSERT INTO enrolments(user_id,course_id,enrolled_at,last_lesson_id,last_accessed_at) VALUES($1,$2,NOW()-INTERVAL '1 day'*$3,$4,NOW()-INTERVAL '1 hour'*$5) ON CONFLICT(user_id,course_id) DO NOTHING`,
          [
            users[email],
            course.id,
            8 + courseIndex,
            course.lessonIds[Math.min(completed, course.lessonIds.length - 1)],
            learnerIndex * 8 + courseIndex,
          ],
        );
        if (!rowCount) continue;
        for (let n = 0; n < completed; n++)
          await client.query(
            `INSERT INTO lesson_progress(user_id,lesson_id,completed_at) VALUES($1,$2,NOW()-INTERVAL '1 day'*$3) ON CONFLICT DO NOTHING`,
            [users[email], course.lessonIds[n], (completed - n - 1) % 7],
          );
        await client.query(
          "INSERT INTO activity(message,created_at) VALUES($1,NOW()-INTERVAL '1 day'*$2)",
          [`${name} enrolled in ${course.title}`.slice(0, 255), learnerIndex],
        );
      }
    }
    await client.query("COMMIT");
    console.log(
      `Demo catalogue ready: ${courses.length} courses. All demo accounts use DemoPass123! (development only).`,
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
