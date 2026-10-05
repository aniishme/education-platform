import { useState } from "react";
const themes = {
  "Web Development": [
    "web",
    "</>",
    "Build for the web",
    "const future = build();",
  ],
  Database: [
    "database",
    "SQL",
    "Turn data into answers",
    "SELECT skills FROM future;",
  ],
  Programming: [
    "programming",
    "Py",
    "Ideas into programs",
    "def learn(): return progress",
  ],
  "Developer Tools": [
    "tools",
    ">_",
    "Work like a developer",
    '$ git commit -m "keep learning"',
  ],
  "Data Science": [
    "data",
    "{ }",
    "Discover the story in data",
    "insight = data.explore()",
  ],
  "Computer Science": [
    "science",
    "01",
    "Understand the foundations",
    "think → solve → improve",
  ],
  Design: [
    "design",
    "Aa",
    "Design with purpose",
    "Research · Prototype · Test",
  ],
};
export default function CourseCover({ course, compact = false }) {
  const [failed, setFailed] = useState(false);
  const [theme, defaultSymbol, caption, defaultCode] =
    themes[course.category] || themes["Web Development"];
  const title = course.title.toLowerCase();
  const [symbol, code] = title.includes("react")
    ? ["React", "components → state → interface"]
    : title.includes("javascript")
      ? ["JS", 'document.querySelector(".future")']
      : title.includes("node")
        ? ["node", 'app.get("/api/your-next-skill")']
        : title.includes("git")
          ? ["git", "$ branch → commit → collaborate"]
          : title.includes("linux")
            ? [">_", "$ learn --by-doing"]
            : title.includes("structures")
              ? ["[ ]", "search · sort · solve"]
              : [defaultSymbol, defaultCode];
  return (
    <div
      className={`course-cover cover-${theme}${compact ? " cover-compact" : ""}`}
      aria-hidden="true"
    >
      {course.image && !failed ? (
        <img
          src={course.image}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <>
          <span className="cover-orbit" />
          <span className="cover-caption">{caption}</span>
          <strong className="cover-symbol">{symbol}</strong>
          <span className="cover-code">{code}</span>
        </>
      )}
    </div>
  );
}
