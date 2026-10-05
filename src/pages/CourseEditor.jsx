import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import useResource from "../utils/useResource";
import ResourceState from "../components/ResourceState";
import { getAuth } from "../utils/auth";
import YouTubePlayer from "../components/YouTubePlayer";
import { parseYouTubeUrl } from "../../shared/youtube.mjs";
import WorkspaceHeader from "../components/WorkspaceHeader";
import CourseCover from "../components/CourseCover";
import StatusBadge from "../components/StatusBadge";
const emptyCourse = {
  title: "",
  description: "",
  category: "",
  level: "Beginner",
  duration: "",
  image: "",
  status: "DRAFT",
  subtitle: "",
  outcomes: "",
  requirements: "",
  video_url: "",
};
export default function CourseEditor() {
  const { id } = useParams();
  return id ? (
    <ExistingCourse key={id} id={id} />
  ) : (
    <Editor initial={emptyCourse} />
  );
}
function ExistingCourse({ id }) {
  const resource = useResource("/courses/" + id);
  if (resource.loading || resource.error)
    return <ResourceState resource={resource} />;
  const user = getAuth();
  if (user.role !== "ADMIN" && resource.data.educator_id !== user.id)
    return <p role="alert">You can only edit your own courses.</p>;
  return <Editor initial={resource.data} reload={resource.reload} />;
}
function Editor({ initial, reload }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const lessonCount =
    initial.sections?.reduce((n, s) => n + s.lessons.length, 0) || 0;
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const data = await api(
        "/courses" + (initial.id ? "/" + initial.id : ""),
        { method: initial.id ? "PUT" : "POST", body: form },
      );
      if (!initial.id)
        navigate("/educator/courses/" + data.course.id + "/edit");
      else {
        setForm(data.course);
        setNotice("Course saved.");
        reload();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  async function addSection(event) {
    event.preventDefault();
    const element = event.currentTarget;
    setBusy(true);
    setError("");
    try {
      await api("/courses/" + initial.id + "/sections", {
        method: "POST",
        body: {
          title: new FormData(element).get("title"),
          position: initial.sections.length,
          video_url: new FormData(element).get("video_url"),
        },
      });
      element.reset();
      reload();
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="workspace-page editor-workspace">
      <nav className="workspace-breadcrumb" aria-label="Breadcrumb">
        <Link to="/educator/courses">My courses</Link>
        <span>/</span>
        <span>{initial.id ? "Course studio" : "New course"}</span>
      </nav>
      <WorkspaceHeader
        eyebrow="Educator studio / Course builder"
        title={initial.id ? "Edit course" : "Create course"}
        description="Make your knowledge worth exploring. Build a clear course page, then bring your curriculum to life."
        action={
          <div className="editor-header-actions">
            {initial.id && (
              <Link className="secondary-button" to={"/courses/" + initial.id}>
                Preview course ↗
              </Link>
            )}
            <button
              form="course-settings"
              className="primary-button"
              disabled={busy}
            >
              {busy ? "Saving…" : "Save course"}
            </button>
          </div>
        }
      />
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="lms-notice">
          {notice}
        </p>
      )}
      <div className="editor-layout">
        <div className="editor-main">
          <form
            id="course-settings"
            className="course-settings-form"
            onSubmit={save}
          >
            <section
              className="workspace-panel editor-panel"
              id="course-basics"
            >
              <div className="editor-panel-heading">
                <span>01</span>
                <div>
                  <h2>Course essentials</h2>
                  <p>
                    A clear title and story help learners know what to expect.
                  </p>
                </div>
              </div>
              <Fields
                values={form}
                setValues={setForm}
                fields={["title", "subtitle", "description"]}
              />
            </section>
            <section
              className="workspace-panel editor-panel"
              id="course-outcomes"
            >
              <div className="editor-panel-heading">
                <span>02</span>
                <div>
                  <h2>Learning goals</h2>
                  <p>
                    Describe the skills learners will build and what they need
                    to begin.
                  </p>
                </div>
              </div>
              <div className="editor-field-grid">
                <Fields
                  values={form}
                  setValues={setForm}
                  fields={["outcomes", "requirements"]}
                />
              </div>
            </section>
            <section
              className="workspace-panel editor-panel"
              id="course-details"
            >
              <div className="editor-panel-heading">
                <span>03</span>
                <div>
                  <h2>Details & discovery</h2>
                  <p>Help the right learners find your course.</p>
                </div>
              </div>
              <div className="editor-field-grid">
                <Fields
                  values={form}
                  setValues={setForm}
                  fields={["category", "level", "duration"]}
                />
              </div>
            </section>
            <section className="workspace-panel editor-panel" id="course-media">
              <div className="editor-panel-heading">
                <span>04</span>
                <div>
                  <h2>Cover & video</h2>
                  <p>
                    Add a thumbnail and an optional video or playlist for your
                    course.
                  </p>
                </div>
              </div>
              <Fields
                values={form}
                setValues={setForm}
                fields={["image", "video_url"]}
              />
              <VideoHelp url={form.video_url} />
            </section>
            <section
              className="workspace-panel editor-panel publish-panel"
              id="course-publish"
            >
              <div className="editor-panel-heading">
                <span>05</span>
                <div>
                  <h2>Save & publish</h2>
                  <p>
                    {initial.id
                      ? "Save your course details. Publish when your curriculum is ready."
                      : "Save a draft to start adding modules and lessons."}
                  </p>
                </div>
              </div>
              {initial.id && (
                <label className="lms-field">
                  Status
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    <option>DRAFT</option>
                    <option>PUBLISHED</option>
                  </select>
                </label>
              )}
              <button className="primary-button" disabled={busy}>
                {busy ? "Saving…" : initial.id ? "Save changes" : "Save draft"}
              </button>
            </section>
          </form>
          {initial.id && (
            <section className="curriculum-builder" id="course-curriculum">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Build the learning journey</p>
                  <h2>Modules & lessons</h2>
                  <p>
                    {initial.sections.length} modules · {lessonCount} lessons.
                    Each module and lesson saves separately.
                  </p>
                </div>
              </div>
              <form
                className="workspace-panel new-module-form"
                onSubmit={addSection}
              >
                <label className="lms-field">
                  New module title
                  <input name="title" required maxLength={150} />
                </label>
                <label className="lms-field">
                  New module video or playlist URL
                  <input
                    name="video_url"
                    type="url"
                    placeholder="https://www.youtube.com/playlist?list=…"
                  />
                </label>
                <button className="primary-button" disabled={busy}>
                  Add module
                </button>
              </form>
              {initial.sections.map((section, index) => (
                <Module
                  key={section.id}
                  section={section}
                  number={index + 1}
                  reload={reload}
                />
              ))}
              {!initial.sections.length && (
                <div className="workspace-empty">
                  <span>▣</span>
                  <h3>Give your course a structure</h3>
                  <p>
                    Add your first module above, then fill it with lessons and
                    practice.
                  </p>
                </div>
              )}
              <Link
                className="secondary-button"
                to={"/educator/courses/" + initial.id + "/learners"}
              >
                View enrolled learners
              </Link>
            </section>
          )}
        </div>
        <aside className="editor-sidebar">
          <div className="workspace-panel course-preview-card">
            <div className="panel-heading">
              <h2>Course preview</h2>
              <span className="panel-label">Live preview</span>
            </div>
            <CourseCover
              course={{ ...form, title: form.title || "Your next course" }}
            />
            <div className="preview-card-copy">
              <StatusBadge value={initial.status} />
              <h3>{form.title || "Your course title"}</h3>
              <p>{form.subtitle || "Your course subtitle will appear here."}</p>
              <small>
                {form.category || "Choose a category"} ·{" "}
                {form.level || "Beginner"}
              </small>
            </div>
          </div>
          <nav
            className="workspace-panel editor-outline"
            aria-label="Course editor sections"
          >
            <h3>In this workspace</h3>
            {[
              ["course-basics", "Course essentials"],
              ["course-outcomes", "Learning goals"],
              ["course-details", "Details & discovery"],
              ["course-media", "Cover & video"],
              ["course-publish", "Save & publish"],
              ...(initial.id ? [["course-curriculum", "Curriculum"]] : []),
            ].map(([anchor, label], i) => (
              <a href={"#" + anchor} key={anchor}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {label}
                <b>↗</b>
              </a>
            ))}
          </nav>
          <div className="editor-readiness">
            <span className="eyebrow">Before you publish</span>
            <h3>A little checklist</h3>
            <p>{form.title.trim() ? "✓" : "○"} A clear course title</p>
            <p>
              {form.description.trim() ? "✓" : "○"} A useful course description
            </p>
            <p>{lessonCount ? "✓" : "○"} At least one lesson</p>
            <small>
              {lessonCount
                ? `${lessonCount} lessons ready for learners.`
                : "Save a draft, then add your first lesson."}
            </small>
          </div>
        </aside>
      </div>
    </section>
  );
}
function Fields({ values, setValues, fields }) {
  return fields.map((name) => (
    <label className="lms-field" key={name}>
      {{
        video_url: "Video URL",
        image: "Thumbnail URL",
        position: "Order",
        content: "Lesson text",
        outcomes: "Learning outcomes",
        requirements: "Prerequisites",
        duration_minutes: "Estimated study time (minutes)",
      }[name] || name[0].toUpperCase() + name.slice(1)}
      {["content", "description", "outcomes", "requirements"].includes(name) ? (
        <textarea
          value={values[name] ?? ""}
          placeholder={
            ["outcomes", "requirements"].includes(name)
              ? "One item per line"
              : undefined
          }
          required={name === "description" && !fields.includes("content")}
          onChange={(e) => setValues({ ...values, [name]: e.target.value })}
        />
      ) : (
        <input
          type={
            ["position", "duration_minutes"].includes(name)
              ? "number"
              : ["image", "video_url"].includes(name)
                ? "url"
                : "text"
          }
          min={0}
          max={
            name === "position"
              ? 100000
              : name === "duration_minutes"
                ? 1440
                : undefined
          }
          maxLength={name === "title" ? 150 : undefined}
          required={["title", "category"].includes(name)}
          value={values[name] ?? ""}
          onChange={(e) =>
            setValues({
              ...values,
              [name]: ["position", "duration_minutes"].includes(name)
                ? Number(e.target.value)
                : e.target.value,
            })
          }
        />
      )}
    </label>
  ));
}
function Module({ section, number, reload }) {
  const [form, setForm] = useState({
    title: section.title,
    position: section.position,
    video_url: section.video_url || "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null);
  async function mutate(path, method, body) {
    setBusy(true);
    setError("");
    try {
      await api(path, { method, body });
      reload();
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="editor-module" open>
      <summary>
        <span className="module-number">{String(number).padStart(2, "0")}</span>
        <div>
          <h3>{section.title}</h3>
          <p>
            {section.lessons.length} lessons ·{" "}
            {section.lessons.reduce((n, l) => n + l.duration_minutes, 0)}{" "}
            minutes guided study
          </p>
        </div>
        <span className="module-chevron" aria-hidden="true">
          ⌄
        </span>
      </summary>
      <div className="editor-module-body">
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
        <details className="module-settings">
          <summary>Module settings</summary>
          <form
            className="lms-form"
            onSubmit={(e) => {
              e.preventDefault();
              mutate("/courses/sections/" + section.id, "PUT", form);
            }}
          >
            <Fields
              values={form}
              setValues={setForm}
              fields={["title", "position", "video_url"]}
            />
            <VideoHelp url={form.video_url} />
            <div className="lms-actions">
              <button className="secondary-button" disabled={busy}>
                Save module
              </button>
              <button
                type="button"
                className="secondary-button"
                disabled={busy}
                onClick={() => {
                  if (window.confirm("Delete module and its lessons?"))
                    mutate("/courses/sections/" + section.id, "DELETE");
                }}
              >
                Delete module
              </button>
            </div>
          </form>
        </details>
        <ol className="editor-lesson-list">
          {section.lessons.map((lesson) => (
            <li key={lesson.id}>
              <div className="editor-lesson-row">
                <span className="lesson-row-icon" aria-hidden="true">
                  {lesson.has_video ? "▷" : "≡"}
                </span>
                <div className="lesson-row-title">
                  <span>{lesson.title}</span>
                  <small>
                    {lesson.duration_minutes} min ·{" "}
                    {lesson.has_video ? "Video lesson" : "Text lesson"}
                  </small>
                </div>
                <button
                  className="compact-button"
                  disabled={busy}
                  onClick={() => setEditing(lesson.id)}
                >
                  Edit lesson
                </button>
                <button
                  className="compact-button action-danger"
                  disabled={busy}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Delete lesson and its completion records?",
                      )
                    )
                      mutate("/courses/lessons/" + lesson.id, "DELETE");
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ol>
        <button
          className="secondary-button add-lesson-button"
          onClick={() => setEditing("new")}
        >
          Add lesson
        </button>
        {editing &&
          (editing === "new" ? (
            <LessonForm
              key="new"
              sectionId={section.id}
              initial={{
                title: "",
                description: "",
                content: "",
                video_url: "",
                position: section.lessons.length,
                duration_minutes: 25,
              }}
              saved={() => {
                setEditing(null);
                reload();
              }}
              cancel={() => setEditing(null)}
            />
          ) : (
            <LessonEdit
              key={editing}
              id={editing}
              saved={() => {
                setEditing(null);
                reload();
              }}
              cancel={() => setEditing(null)}
            />
          ))}
      </div>
    </details>
  );
}
function LessonEdit({ id, ...props }) {
  const resource = useResource("/lessons/" + id);
  if (resource.loading || resource.error)
    return <ResourceState resource={resource} />;
  return <LessonForm initial={resource.data} {...props} />;
}
function LessonForm({ initial, sectionId, saved, cancel }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(
        initial.id
          ? "/courses/lessons/" + initial.id
          : "/courses/sections/" + sectionId + "/lessons",
        { method: initial.id ? "PUT" : "POST", body: form },
      );
      saved();
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="lms-form lesson-editor-form" onSubmit={save}>
      <h4>{initial.id ? "Edit lesson" : "New lesson"}</h4>
      <Fields
        values={form}
        setValues={setForm}
        fields={[
          "title",
          "description",
          "content",
          "video_url",
          "position",
          "duration_minutes",
        ]}
      />
      <VideoHelp url={form.video_url} />
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      <div className="lms-actions">
        <button className="primary-button" disabled={busy}>
          Save lesson
        </button>
        <button type="button" className="secondary-button" onClick={cancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
function VideoHelp({ url }) {
  return (
    <div className="video-help">
      <details className="video-link-tips">
        <summary>YouTube video & playlist tips</summary>
        <p className="helper-text">
          Paste an existing YouTube video or playlist URL. Short links, Shorts,
          and links with a start time are supported. Playlists stay in the
          player; add individual lessons to track progress. No video upload or
          YouTube API key is needed. A lesson with no video uses its module
          resource, then the course resource.
        </p>
      </details>
      {parseYouTubeUrl(url) && (
        <details>
          <summary>Preview video resource</summary>
          <YouTubePlayer url={url} title="Educator video preview" />
        </details>
      )}
    </div>
  );
}
