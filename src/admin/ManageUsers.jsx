import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { getAuth } from "../utils/auth";
import useResource from "../utils/useResource";
import ResourceState from "../components/ResourceState";
import WorkspaceHeader from "../components/WorkspaceHeader";
import StatusBadge from "../components/StatusBadge";
const roles = ["ADMIN", "EDUCATOR", "LEARNER"];
export default function ManageUsers() {
  const resource = useResource("/users"),
    [params, setParams] = useSearchParams();
  const [editing, setEditing] = useState(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  const role = params.get("role") || "",
    status = params.get("status") || "",
    search = params.get("q") || "";
  const all = resource.data || [],
    users = all.filter(
      (u) =>
        (!role || u.role === role) &&
        (!status || u.status === status) &&
        `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase()),
    );
  function filter(key, value) {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next, { replace: true });
  }
  async function toggle(user) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api("/users/" + user.id + "/status", {
        method: "PUT",
        body: { status: user.status === "active" ? "deactivated" : "active" },
      });
      setNotice(
        `${user.name}'s account ${user.status === "active" ? "deactivated" : "activated"}.`,
      );
      resource.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="workspace-page user-workspace">
      <WorkspaceHeader
        eyebrow="Administration / People"
        title="Manage users"
        description="Build your learning community. Add accounts, assign roles, and manage access in one place."
        action={
          <button
            className="primary-button"
            onClick={() =>
              setEditing({ name: "", email: "", role: "LEARNER", password: "" })
            }
          >
            ＋ Add user
          </button>
        }
      />
      <div className="workspace-metrics">
        {[
          ["All accounts", all.length, "◎"],
          ["Learners", all.filter((u) => u.role === "LEARNER").length, "◉"],
          ["Educators", all.filter((u) => u.role === "EDUCATOR").length, "▣"],
          [
            "Active accounts",
            all.filter((u) => u.status === "active").length,
            "✓",
          ],
        ].map(([label, value, icon]) => (
          <article key={label}>
            <span className="metric-icon">{icon}</span>
            <div>
              <p>{label}</p>
              <strong>{value}</strong>
            </div>
          </article>
        ))}
      </div>
      <div className="workspace-panel directory-panel">
        <div className="panel-heading">
          <div>
            <h2>User directory</h2>
            <p>
              {users.length} of {all.length} accounts
            </p>
          </div>
          <span className="panel-label">Role-based access</span>
        </div>
        <div className="workspace-toolbar">
          <label className="toolbar-search">
            Search users
            <input
              type="search"
              placeholder="Search name or email…"
              value={search}
              onChange={(e) => filter("q", e.target.value)}
            />
          </label>
          <label>
            Role
            <select
              value={role}
              onChange={(e) => filter("role", e.target.value)}
            >
              <option value="">All roles</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r[0] + r.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </label>
          <label>
            Account status
            <select
              value={status}
              onChange={(e) => filter("status", e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="deactivated">Inactive</option>
            </select>
          </label>
        </div>
        <ResourceState resource={resource} />
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
        {resource.data &&
          (!users.length ? (
            <div className="workspace-empty">
              <span>◎</span>
              <h3>No matching users</h3>
              <p>Try another name, role, or account status.</p>
              <button
                className="secondary-button"
                onClick={() => setParams({})}
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="lms-table-wrap">
              <table className="directory-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="directory-person">
                          <span
                            className={
                              "person-avatar avatar-" + user.role.toLowerCase()
                            }
                          >
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </span>
                          <strong>
                            {user.name}
                            {user.id === getAuth()?.id && <small>You</small>}
                          </strong>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <StatusBadge value={user.role} />
                      </td>
                      <td>
                        <StatusBadge value={user.status} />
                      </td>
                      <td className="muted-cell">
                        {new Date(user.created_at).toLocaleDateString(
                          undefined,
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="compact-button"
                            disabled={busy}
                            onClick={() => setEditing(user)}
                          >
                            Edit
                          </button>
                          <button
                            className={
                              "compact-button " +
                              (user.status === "active" ? "action-danger" : "")
                            }
                            disabled={
                              busy ||
                              (user.id === getAuth()?.id &&
                                user.status === "active")
                            }
                            onClick={() => toggle(user)}
                          >
                            {user.status === "active"
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </div>
      {editing && (
        <UserDialog
          key={editing.id || "new"}
          initial={editing}
          close={() => setEditing(null)}
          saved={(user) => {
            setEditing(null);
            setNotice(`${user.name} ${editing.id ? "updated" : "created"}.`);
            setParams({ q: user.email });
            resource.reload();
          }}
        />
      )}
    </section>
  );
}
function UserDialog({ initial, close, saved }) {
  const ref = useRef(null),
    [form, setForm] = useState(initial),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await api(
        "/users" + (initial.id ? "/" + initial.id : ""),
        { method: initial.id ? "PUT" : "POST", body: form },
      );
      saved(result.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={ref}
      className="workspace-dialog"
      aria-labelledby="user-dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) close();
      }}
    >
      <div className="dialog-heading">
        <div>
          <p className="eyebrow">Community management</p>
          <h2 id="user-dialog-title">
            {initial.id ? "Edit user" : "Add user"}
          </h2>
        </div>
        <button
          aria-label="Close user form"
          className="dialog-close"
          disabled={busy}
          onClick={close}
        >
          ×
        </button>
      </div>
      <p className="dialog-description">
        {initial.id
          ? "Update profile details and access permissions."
          : "Create an account and choose what this person can access."}
      </p>
      <form onSubmit={save} className="lms-form">
        <label className="lms-field">
          Full name
          <input
            autoFocus
            required
            maxLength={100}
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label className="lms-field">
          Email address
          <input
            type="email"
            required
            maxLength={150}
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label className="lms-field">
          User role
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r[0] + r.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </label>
        <p className="role-explanation">
          {form.role === "ADMIN"
            ? "Admins manage people, courses, and platform access."
            : form.role === "EDUCATOR"
              ? "Educators create courses and follow their learners’ progress."
              : "Learners enrol in courses and save their learning progress."}
        </p>
        {!initial.id && (
          <>
            <label className="lms-field">
              Initial password
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>
            <p className="helper-text">
              At least 8 characters. Share this password with the user; they can
              change it in account settings.
            </p>
          </>
        )}
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <button
            className="secondary-button"
            type="button"
            disabled={busy}
            onClick={close}
          >
            Cancel
          </button>
          <button className="primary-button" disabled={busy}>
            {busy ? "Saving…" : initial.id ? "Save user" : "Create user"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
