const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const db = require("../db");
const app = require("../app");
let server, base;
const tag = Date.now();
const accounts = [];
const courses = [];
function client() {
  let cookie = "";
  return async (path, method = "GET", body, status = 200) => {
    const response = await fetch(base + path, {
      method,
      headers: { "Content-Type": "application/json", cookie },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const value = response.headers.get("set-cookie");
    if (value) cookie = value.split(";")[0];
    const data = await response.json();
    assert.equal(response.status, status, JSON.stringify(data));
    return data;
  };
}
async function register(call, role, label) {
  const email = `test-${tag}-${label}@example.com`;
  accounts.push(email);
  return (
    await call(
      "/auth/signup",
      "POST",
      { name: label, email, password: "JourneyPass123!", role },
      201,
    )
  ).user;
}
before(async () => {
  await db.query("SELECT 1");
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(async () => {
  try {
    for (const id of courses)
      await db.query("DELETE FROM courses WHERE id=$1", [id]);
    await db.query("DELETE FROM users WHERE email=ANY($1::text[])", [accounts]);
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    await db.end();
  }
});
test("authentication validation, duplicate email, blocked admin registration and logout", async () => {
  const call = client();
  await call("/auth/me", "GET", undefined, 401);
  await call(
    "/auth/signup",
    "POST",
    { name: "Bad", email: "bad", password: "short" },
    400,
  );
  await call(
    "/auth/signup",
    "POST",
    {
      name: "Bad",
      email: "bad@example.com",
      password: "JourneyPass123!",
      role: "ADMIN",
    },
    400,
  );
  const user = await register(call, "LEARNER", "authentication");
  assert.equal(user.role, "LEARNER");
  await call(
    "/auth/signup",
    "POST",
    {
      name: "Duplicate",
      email: user.email.toUpperCase(),
      password: "JourneyPass123!",
    },
    409,
  );
  assert.equal((await call("/auth/me")).user.id, user.id);
  await call("/auth/logout", "POST");
  await call("/auth/me", "GET", undefined, 401);
  await call(
    "/auth/login",
    "POST",
    { email: user.email, password: "wrong" },
    401,
  );
  await call("/auth/login", "POST", {
    email: user.email,
    password: "JourneyPass123!",
  });
  await call(
    "/auth/password",
    "PUT",
    { currentPassword: "wrong", newPassword: "NewPass123!" },
    400,
  );
  await call("/auth/password", "PUT", {
    currentPassword: "JourneyPass123!",
    newPassword: "NewPass123!",
  });
  await call("/auth/logout", "POST");
  await call("/auth/login", "POST", {
    email: user.email,
    password: "NewPass123!",
  });
});
test("educator CRUD, ownership, publishing, enrolment and persistent progress", async () => {
  const educator = client(),
    other = client(),
    learner = client(),
    guest = client();
  const instructor = await register(educator, "EDUCATOR", "educator");
  await register(other, "EDUCATOR", "other");
  const student = await register(learner, "LEARNER", "learner");
  await guest("/dashboard/details", "GET", undefined, 401);
  await learner("/users", "GET", undefined, 403);
  await educator("/users", "GET", undefined, 403);
  await learner("/courses", "POST", { title: "Forbidden" }, 403);
  await guest("/courses", "POST", {}, 401);
  await educator(
    "/courses",
    "POST",
    { title: " ", description: "x", category: "Test" },
    400,
  );
  const { course } = await educator(
    "/courses",
    "POST",
    {
      title: "Test course",
      description: "Course content",
      category: "Test",
      subtitle: "Learn the complete flow",
      outcomes: "Build a project\nExplain your decisions",
      requirements: "A browser",
      video_url: "https://youtu.be/rfscVS0vtbw?t=60",
    },
    201,
  );
  courses.push(course.id);
  assert.equal(course.educator_id, instructor.id);
  assert.equal(
    course.video_url,
    "https://www.youtube.com/watch?v=rfscVS0vtbw&t=60",
  );
  assert.equal(course.outcomes, "Build a project\nExplain your decisions");
  await educator(
    "/courses/" + course.id,
    "PUT",
    { video_url: "https://youtube.com/watch?v=invalid" },
    400,
  );
  await guest("/courses/" + course.id, "GET", undefined, 404);
  await learner("/enrolments", "POST", { course_id: course.id }, 404);
  await other("/courses/" + course.id, "PUT", { title: "Stolen" }, 403);
  await other("/courses/" + course.id, "DELETE", undefined, 403);
  await educator("/courses/" + course.id, "PUT", { status: "PUBLISHED" }, 400);
  const section = await educator(
    "/courses/" + course.id + "/sections",
    "POST",
    {
      title: "Module one",
      video_url: "https://www.youtube.com/playlist?list=PLC77007E23FF423C6",
    },
    201,
  );
  assert.equal(
    section.video_url,
    "https://www.youtube.com/playlist?list=PLC77007E23FF423C6",
  );
  await other(
    "/courses/sections/" + section.id,
    "PUT",
    { title: "Stolen" },
    403,
  );
  const first = await educator(
    "/courses/sections/" + section.id + "/lessons",
    "POST",
    {
      title: "First",
      content: "Lesson text",
      duration_minutes: 35,
      video_url: "https://www.youtube.com/watch?v=rfscVS0vtbw",
    },
    201,
  );
  assert.equal(first.duration_minutes, 35);
  await educator(
    "/courses/sections/" + section.id + "/lessons",
    "POST",
    { title: "Bad duration", duration_minutes: -1 },
    400,
  );
  const second = await educator(
    "/courses/sections/" + section.id + "/lessons",
    "POST",
    { title: "Second", position: 1, video_url: "https://example.com/video" },
    201,
  );
  await educator("/courses/lessons/" + first.id, "PUT", {
    ...first,
    title: "Updated first",
  });
  await educator("/courses/" + course.id, "PUT", {
    status: "PUBLISHED",
    title: "Published course",
  });
  assert.equal(
    (await guest("/courses/" + course.id)).sections[0].lessons.length,
    2,
  );
  await learner("/lessons/" + first.id, "GET", undefined, 403);
  await learner(
    "/enrolments",
    "POST",
    { course_id: course.id, user_id: instructor.id },
    201,
  );
  await learner("/enrolments", "POST", { course_id: course.id }, 409);
  await educator("/enrolments", "POST", { course_id: course.id }, 403);
  assert.equal((await learner("/lessons/" + first.id)).content, "Lesson text");
  await learner("/lessons/" + first.id + "/progress", "PUT", {
    completed: true,
  });
  await learner("/lessons/" + first.id + "/progress", "PUT", {
    completed: true,
  });
  let enrolled = await learner("/enrolments");
  assert.equal(enrolled[0].progress, 50);
  assert.equal(enrolled[0].user_id, student.id);
  assert.equal(enrolled[0].last_lesson_id, first.id);
  const insight = await learner("/dashboard/details");
  assert.equal(insight.recent.length, 1);
  assert.equal(insight.recent[0].title, "Updated first");
  assert.equal(
    insight.weekly.reduce((sum, day) => sum + day.lessons, 0),
    1,
  );
  assert.match(insight.weekly[0].day, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal((await other("/dashboard/details")).recent.length, 0);
  const recommendations = await learner("/courses/recommended");
  assert.ok(
    recommendations.every(
      (c) => c.id !== course.id && c.status === "PUBLISHED",
    ),
  );
  assert.ok(
    recommendations.every((c) => typeof c.recommendation_reason === "string"),
  );
  const suggested = (
    await other(
      "/courses",
      "POST",
      {
        title: "Suggested next step",
        description: "Another course in the enrolled category",
        category: "Test",
      },
      201,
    )
  ).course;
  courses.push(suggested.id);
  const suggestedModule = await other(
    "/courses/" + suggested.id + "/sections",
    "POST",
    { title: "Next step" },
    201,
  );
  await other(
    "/courses/sections/" + suggestedModule.id + "/lessons",
    "POST",
    { title: "Try it" },
    201,
  );
  await other("/courses/" + suggested.id, "PUT", { status: "PUBLISHED" });
  const ranked = await learner("/courses/recommended");
  assert.equal(ranked[0].id, suggested.id);
  assert.equal(ranked[0].category_match, true);
  assert.equal(ranked[0].recommendation_reason, "Because you're learning Test");
  await learner("/auth/logout", "POST");
  await learner("/auth/login", "POST", {
    email: student.email,
    password: "JourneyPass123!",
  });
  assert.equal((await learner("/enrolments"))[0].progress, 50);
  assert.deepEqual(await learner("/courses/" + course.id + "/progress"), [
    first.id,
  ]);
  assert.equal(
    (await educator("/courses/" + course.id + "/learners"))[0].progress,
    50,
  );
  const educatorStats = await educator("/dashboard");
  assert.equal(educatorStats.courses, 1);
  assert.equal(educatorStats.learners, 1);
  await learner("/lessons/" + second.id + "/progress", "PUT", {
    completed: true,
  });
  assert.equal((await learner("/enrolments"))[0].progress, 100);
  await learner("/lessons/" + second.id + "/progress", "PUT", {
    completed: false,
  });
  assert.equal((await learner("/enrolments"))[0].progress, 50);
  await educator("/courses/" + course.id, "PUT", { status: "DRAFT" });
  await learner("/lessons/" + first.id, "GET", undefined, 404);
  await educator("/courses/" + course.id, "PUT", { status: "PUBLISHED" });
  await educator("/courses/lessons/" + second.id, "DELETE");
  assert.equal((await learner("/enrolments"))[0].progress, 100);
  const otherStudent = client();
  await register(otherStudent, "LEARNER", "other-student");
  await otherStudent("/enrolments/" + enrolled[0].id, "DELETE", undefined, 403);
  await learner("/enrolments/" + enrolled[0].id, "DELETE");
  await learner("/enrolments", "POST", { course_id: course.id }, 201);
  assert.equal((await learner("/enrolments"))[0].progress, 0);
  await educator("/courses/sections/" + section.id, "PUT", {
    title: "Renamed",
    position: 1,
  });
  await educator("/courses/sections/" + section.id, "DELETE");
  await educator("/courses/" + course.id, "DELETE");
  await educator("/courses/" + course.id, "GET", undefined, 404);
  assert.equal((await learner("/enrolments")).length, 0);
});
test("admin users, statistics, status and session revocation", async () => {
  const admin = client(),
    student = client();
  await register(admin, "LEARNER", "admin");
  const email = accounts[accounts.length - 1];
  await db.query("UPDATE users SET role='ADMIN' WHERE email=$1", [email]);
  const user = await register(student, "LEARNER", "deactivated");
  const users = await admin("/users");
  assert.ok(users.some((u) => u.id === user.id));
  assert.ok(!users.some((u) => u.password));
  const stats = await admin("/dashboard");
  for (const key of ["users", "learners", "educators", "courses", "enrolments"])
    assert.equal(typeof stats[key], "number");
  await admin("/users/" + user.id, "PUT", {
    name: "Updated learner",
    email: user.email,
    role: "LEARNER",
  });
  await admin("/users/" + user.id + "/status", "PUT", {
    status: "deactivated",
  });
  await student("/auth/me", "GET", undefined, 401);
  await student(
    "/auth/login",
    "POST",
    { email: user.email, password: "JourneyPass123!" },
    403,
  );
  await admin("/users/" + user.id + "/status", "PUT", { status: "active" });
  await student("/auth/login", "POST", {
    email: user.email,
    password: "JourneyPass123!",
  });
  const self = (await admin("/auth/me")).user;
  await admin(
    "/users/" + self.id + "/status",
    "PUT",
    { status: "deactivated" },
    400,
  );
  await admin(
    "/users/" + self.id,
    "PUT",
    { name: self.name, email: self.email, role: "LEARNER" },
    400,
  );
  await admin("/activity");
  await admin("/learner-growth");
});
