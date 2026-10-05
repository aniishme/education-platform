import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
import backendDb from "../Backend/db.js";
const { Pool } = createRequire(
  new URL("../Backend/package.json", import.meta.url),
)("pg");
// Each browser test file owns its cleanup connection; another file can finish
// and close its pool while Playwright reuses the same worker process.
const db = new Pool(backendDb.options);
test.beforeAll(async () => {
  await db.query(
    "DELETE FROM users WHERE email LIKE 'test-ui-added-%@example.com'",
  );
});
test.afterAll(() => db.end());
async function login(page, email) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill("DemoPass123!");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Welcome,/ })).toBeVisible();
}
async function mobileCheck(page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
test("admin adds users, duplicate feedback, editing and role-specific login", async ({
  page,
  browser,
}) => {
  const emails = [];
  const context = await browser.newContext();
  try {
    await login(page, "admin@example.com");
    await page.goto("/admin/users");
    await page.screenshot({
      path: "test-results/user-directory-desktop.png",
      fullPage: true,
    });
    for (const role of ["LEARNER", "EDUCATOR", "ADMIN"]) {
      const email = `test-ui-added-${Date.now()}-${role.toLowerCase()}@example.com`;
      emails.push(email);
      await page.getByRole("button", { name: /Add user/ }).click();
      const dialog = page.getByRole("dialog", {
        name: "Add user",
        exact: true,
      });
      await dialog
        .getByLabel("Full name", { exact: true })
        .fill("Added " + role);
      await dialog.getByLabel("Email address", { exact: true }).fill(email);
      await dialog
        .getByRole("combobox", { name: "User role", exact: true })
        .selectOption(role);
      await dialog
        .getByLabel("Initial password", { exact: true })
        .fill("DemoPass123!");
      if (role === "LEARNER")
        await page.screenshot({ path: "test-results/add-user-dialog.png" });
      await dialog
        .getByRole("button", { name: "Create user", exact: true })
        .click();
      await expect(dialog).not.toBeVisible();
      await expect(
        page.getByRole("cell", { name: email, exact: true }),
      ).toBeVisible();
      const member = await context.newPage();
      await login(member, email);
      await expect(
        member.getByRole("link", {
          name:
            role === "ADMIN"
              ? "Manage Users"
              : role === "EDUCATOR"
                ? "My Courses"
                : "My Learning",
          exact: true,
        }),
      ).toBeVisible();
      await member.getByRole("button", { name: "Account menu" }).click();
      await member.getByRole("button", { name: "Logout", exact: true }).click();
      await member.close();
    }
    await page.getByRole("button", { name: /Add user/ }).click();
    const duplicate = page.getByRole("dialog");
    await duplicate.getByLabel("Full name").fill("Duplicate");
    await duplicate.getByLabel("Email address").fill(emails[0]);
    await duplicate.getByLabel("Initial password").fill("DemoPass123!");
    await duplicate.getByRole("button", { name: "Create user" }).click();
    await expect(duplicate.getByRole("alert")).toContainText("already exists");
    await duplicate
      .getByRole("button", { name: "Cancel", exact: true })
      .click();
    await page.getByRole("button", { name: "Edit", exact: true }).click();
    const edit = page.getByRole("dialog", { name: "Edit user", exact: true });
    await edit.getByLabel("Full name").fill("Updated administrator");
    await edit.getByRole("button", { name: "Save user" }).click();
    await expect(
      page.getByRole("cell", { name: "Updated administrator" }),
    ).toBeVisible();
    await mobileCheck(page);
    await page.screenshot({
      path: "test-results/user-directory-mobile.png",
      fullPage: true,
    });
  } finally {
    await context.close();
    await db.query("DELETE FROM users WHERE email=ANY($1::text[])", [emails]);
  }
});
test("course studio design and distinct learner library and analytics pages", async ({
  page,
  browser,
}) => {
  await login(page, "educator@example.com");
  await page.goto("/educator/courses");
  await expect(
    page.getByRole("heading", { name: "Manage courses" }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/course-studio-desktop.png",
    fullPage: true,
  });
  const courses = await (
    await page.request.get("/api/courses?mine=true")
  ).json();
  expect(courses.length).toBeGreaterThan(0);
  await page.goto("/educator/courses/" + courses[0].id + "/edit");
  await expect(
    page.getByRole("heading", { name: "Course essentials" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Course preview", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/course-editor-desktop.png",
    fullPage: true,
  });
  await mobileCheck(page);
  await page.screenshot({
    path: "test-results/course-editor-mobile.png",
    fullPage: true,
  });
  const context = await browser.newContext();
  try {
    const learner = await context.newPage();
    await login(learner, "learner@example.com");
    await learner.goto("/my-learning");
    await expect(
      learner.getByRole("heading", { name: "My Learning", exact: true }),
    ).toBeVisible();
    await expect(
      learner.getByRole("heading", { name: "28-day learning activity" }),
    ).toHaveCount(0);
    await learner.getByRole("button", { name: /Completed/ }).click();
    const enrolments = await (
      await learner.request.get("/api/enrolments")
    ).json();
    const finished = enrolments.filter(
      (c) => c.total_lessons > 0 && c.progress === 100,
    ).length;
    await expect(learner.locator(".library-course-card")).toHaveCount(finished);
    await learner.getByRole("button", { name: /All courses/ }).click();
    await learner.screenshot({
      path: "test-results/my-learning-desktop.png",
      fullPage: true,
    });
    await mobileCheck(learner);
    await learner.screenshot({
      path: "test-results/my-learning-mobile.png",
      fullPage: true,
    });
    await learner.setViewportSize({ width: 1280, height: 900 });
    await learner.goto("/progress");
    await expect(
      learner.getByRole("heading", { name: "My Progress", exact: true }),
    ).toBeVisible();
    await expect(
      learner.getByRole("heading", { name: "28-day learning activity" }),
    ).toBeVisible();
    await expect(
      learner.getByRole("heading", { name: "Completion history" }),
    ).toBeVisible();
    await expect(
      learner.getByRole("button", { name: "Leave course" }),
    ).toHaveCount(0);
    await expect(learner.locator(".library-course-card")).toHaveCount(0);
    const done = enrolments.reduce((n, c) => n + c.completed_lessons, 0);
    await expect(
      learner.getByRole("heading", {
        name: `${done} lessons completed`,
        exact: true,
      }),
    ).toBeVisible();
    await learner.locator(".progress-course-detail summary").first().click();
    await expect(
      learner.locator(".module-progress-list").first(),
    ).toBeVisible();
    await learner.evaluate(() => window.scrollTo(0, 0));
    await learner.screenshot({
      path: "test-results/my-progress-desktop.png",
      fullPage: true,
    });
    await mobileCheck(learner);
    await learner.screenshot({
      path: "test-results/my-progress-mobile.png",
      fullPage: true,
    });
  } finally {
    await context.close();
  }
});
