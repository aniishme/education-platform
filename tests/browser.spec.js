import { test, expect } from "@playwright/test";
import db from "../Backend/db.js";
test.afterAll(async () => {
  await db.end();
});
async function login(page, email) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill("DemoPass123!");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Welcome,/ })).toBeVisible();
}
test("public registration for educator and learner survives refresh and login", async ({
  browser,
}) => {
  const emails = [];
  try {
    for (const role of ["EDUCATOR", "LEARNER"]) {
      const context = await browser.newContext();
      try {
        const page = await context.newPage();
        const email = `test-browser-${Date.now()}-${role.toLowerCase()}@example.com`;
        emails.push(email);
        await page.goto("/signup");
        await page
          .getByLabel("Full name", { exact: true })
          .fill("Browser " + role);
        await page.getByLabel("Email", { exact: true }).fill(email);
        await page.getByLabel("Password", { exact: true }).fill("DemoPass123!");
        await page
          .getByLabel("Confirm password", { exact: true })
          .fill("DemoPass123!");
        await page
          .getByRole("combobox", { name: "Account type", exact: true })
          .selectOption(role);
        await page
          .getByRole("button", { name: "Create account", exact: true })
          .click();
        await expect(
          page.getByRole("heading", { name: /Welcome,/ }),
        ).toBeVisible();
        await expect(
          page.getByRole("link", {
            name: role === "EDUCATOR" ? "My Courses" : "My Learning",
            exact: true,
          }),
        ).toBeVisible();
        await page.reload();
        await expect(
          page.getByRole("heading", { name: /Welcome,/ }),
        ).toBeVisible();
        await page.getByRole("button", { name: "Account menu" }).click();
        await page.getByRole("button", { name: "Logout", exact: true }).click();
        await expect(page).toHaveURL(/login/);
        await login(page, email);
      } finally {
        await context.close();
      }
    }
  } finally {
    await db.query("DELETE FROM users WHERE email=ANY($1::text[])", [emails]);
  }
});
test("admin dashboard, user roles, course management and refresh", async ({
  page,
}) => {
  await login(page, "admin@example.com");
  await expect(page.getByText("educators", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: /Welcome,/ })).toBeVisible();
  await page.getByRole("link", { name: "Manage Users", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Role", exact: true })
    .selectOption("EDUCATOR");
  await expect(
    page.getByRole("cell", { name: "educator@example.com" }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Role", exact: true })
    .selectOption("LEARNER");
  await expect(
    page.getByRole("cell", { name: "learner@example.com" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Manage Courses", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Web Development Fundamentals" }),
  ).toBeVisible();
});
test("educator creates modules and lessons, publishes, learner enrols and persists progress", async ({
  page,
  browser,
}) => {
  const title = "Browser course " + Date.now();
  let courseId;
  const learnerContext = await browser.newContext();
  const student = await learnerContext.newPage();
  try {
    await login(page, "educator@example.com");
    await page.getByRole("link", { name: "My Courses", exact: true }).click();
    await page
      .getByRole("link", { name: "Create course", exact: true })
      .click();
    await page.getByLabel("Title", { exact: true }).fill(title);
    await page
      .getByLabel("Description", { exact: true })
      .fill("A browser tested course");
    await page.getByLabel("Category", { exact: true }).fill("Testing");
    await page
      .getByRole("button", { name: "Save course", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Edit course" }),
    ).toBeVisible();
    courseId = page.url().match(/courses\/(\d+)/)[1];
    await page.getByLabel("New module title").fill("Browser module");
    await page.getByRole("button", { name: "Add module", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Browser module" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Add lesson", exact: true }).click();
    await page
      .getByLabel("Title", { exact: true })
      .last()
      .fill("Browser lesson");
    await page
      .getByLabel("Lesson text")
      .fill("This text is stored in PostgreSQL.");
    await page
      .getByRole("button", { name: "Save lesson", exact: true })
      .click();
    await expect(
      page.getByText("Browser lesson", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("combobox", { name: "Status", exact: true })
      .selectOption("PUBLISHED");
    await page
      .getByRole("button", { name: "Save course", exact: true })
      .click();
    await expect(
      page.getByText("Course saved.", { exact: true }),
    ).toBeVisible();
    await login(student, "learner@example.com");
    await student.goto("/courses");
    await student
      .getByLabel("Search by course title", { exact: true })
      .fill(title);
    await student.getByRole("link", { name: /View course/ }).click();
    await student.getByRole("button", { name: "Enrol for free" }).click();
    await expect(student.getByText("You are enrolled")).toBeVisible();
    await student
      .getByRole("button", { name: "Browser lesson", exact: true })
      .click();
    await expect(
      student.getByText("This text is stored in PostgreSQL."),
    ).toBeVisible();
    await student
      .getByRole("button", { name: "Mark lesson complete", exact: true })
      .click();
    await expect(
      student.getByText("1 of 1 lessons complete · 100%"),
    ).toBeVisible();
    await student.reload();
    await expect(
      student.getByRole("button", { name: "Mark incomplete", exact: true }),
    ).toBeVisible();
    await student.getByRole("button", { name: "Account menu" }).click();
    await student.getByRole("button", { name: "Logout", exact: true }).click();
    await expect(student).toHaveURL(/login/);
    await login(student, "learner@example.com");
    await student
      .getByRole("link", { name: "My Learning", exact: true })
      .click();
    const card = student.locator("article").filter({
      has: student.getByRole("heading", { name: title, exact: true }),
    });
    await expect(card.getByText("100%", { exact: true })).toBeVisible();
    await page.goto("/educator/courses/" + courseId + "/learners");
    await expect(
      page.getByRole("cell", { name: "learner@example.com" }),
    ).toBeVisible();
    await expect(page.getByRole("cell", { name: "100%" })).toBeVisible();
    await student.goto("/admin/users");
    await expect(student).toHaveURL("http://localhost:5173/");
    await student.goto("/educator/courses");
    await expect(student).toHaveURL("http://localhost:5173/");
    await student.setViewportSize({ width: 390, height: 844 });
    await student.goto("/my-learning");
    await expect(
      student.getByRole("heading", { name: "My Learning", exact: true }),
    ).toBeVisible();
    expect(
      await student.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  } finally {
    if (courseId) await page.request.delete("/api/courses/" + courseId);
    await learnerContext.close();
  }
});
