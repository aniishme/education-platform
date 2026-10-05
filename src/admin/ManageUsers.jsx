import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import FormField from "../components/FormField";
import SortIcon from "./SortIcon";
import { logActivity } from "../services/activityService";
import { getUsers, updateUser, updateUserStatus } from "../services/userService";
import { getEnrolments } from "../services/enrolmentService";
import { getInitials } from "../utils/profile";
import useFocusTrap from "../utils/useFocusTrap";
import "../Dashboard.css";
import "../Admin.css";

const roles = ["student", "admin"];

const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "enrolled", label: "Enrolled" },
  { key: "status", label: "Status" },
];

function ManageUsers() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    async function loadUsers() {
      try {
        const userData = await getUsers();
        setUsers(userData);
      } catch (error) {
        console.error("Unable to load users:", error);
      }
    }

    loadUsers();
  }, []);
  useEffect(() => {
    async function loadEnrolments() {
      try {
        const enrolmentData = await getEnrolments();
        setEnrolments(enrolmentData);
      } catch (error) {
        console.error("Unable to load enrolments:", error);
      }
    }

    loadEnrolments();
  }, []);
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [sort, setSort] = useState({ key: "name", direction: "asc" });
  const [enrolments, setEnrolments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", role: roles[0] });
  const [errors, setErrors] = useState({});
  const dialogRef = useRef(null);

  // admins manage their own account from Settings, not this table, so admin
  // accounts never show up here (nothing to accidentally deactivate/edit)
  const manageableUsers = users.filter((user) => user.role !== "admin");

  const filteredUsers = manageableUsers.filter((user) => {
    const term = query.trim().toLowerCase();
    if (!term) return true;
    return (
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    );
  });

  const sortFactor = sort.direction === "asc" ? 1 : -1;
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sort.key) {
      case "enrolled":
        return ((a.enrolledCourseIds?.length ?? 0) - (b.enrolledCourseIds?.length ?? 0)) * sortFactor;
      default:
        return a[sort.key].localeCompare(b[sort.key]) * sortFactor;
    }
  });

  const toggleSort = (key) => {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
  };

  const toggleStatus = async (user) => {
    const nextStatus =
      user.status === "active" ? "deactivated" : "active";

    try {
      const updatedUser = await updateUserStatus(user.id, nextStatus);

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === updatedUser.id ? updatedUser : currentUser
        )
      );

      logActivity(
        `${updatedUser.name}'s account was ${nextStatus === "active" ? "reactivated" : "deactivated"
        }`
      );
    } catch (error) {
      console.error("Unable to update user status:", error);
    }
  };

  const closeForm = () => {
    setEditingId(null);
    setErrors({});
  };

  useFocusTrap(dialogRef, Boolean(editingId), closeForm);

  const openEditForm = (user) => {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, role: user.role });
    setErrors({});
  };

  const updateField = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Name is required";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    }

    if (!form.role) {
      nextErrors.role = "Role is required";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      const user = await updateUser(editingId, form);

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === user.id ? user : currentUser
        )
      );

      logActivity(`${user.name}'s account details were updated`);

      closeForm();
    } catch (error) {
      console.error("Unable to update user:", error);
    }
  };

  return (
    <div className="dashboard admin-dashboard">
      <header className="dashboard-heading">
        <p className="eyebrow">Accounts</p>
        <h1>Manage Users</h1>
        <p>View everyone with a StudyFlow account, and deactivate one if needed.</p>
      </header>

      <p className="result-count" aria-live="polite">
        {query
          ? `${filteredUsers.length} ${filteredUsers.length === 1 ? "user" : "users"} match "${query}"`
          : `${sortedUsers.length} ${sortedUsers.length === 1 ? "user" : "users"} total`}
        {query && (
          <button type="button" className="text-link admin-link-button" onClick={() => setSearchParams({})}>
            Clear
          </button>
        )}
      </p>

      {sortedUsers.length > 0 ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={sort.key === column.key ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
                  >
                    <button type="button" className="admin-th-sort" onClick={() => toggleSort(column.key)}>
                      {column.label}
                      <SortIcon direction={sort.key === column.key ? sort.direction : null} />
                    </button>
                  </th>
                ))}
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user) => (
                <tr key={user.id}>
                  <th scope="row">
                    <span className="admin-user-name">
                      <span className={`admin-avatar admin-avatar-${user.role.toLowerCase()}`} aria-hidden="true">
                        {getInitials(user.name)}
                      </span>
                      {user.name}
                    </span>
                  </th>
                  <td>{user.email}</td>
                  <td>
                    <span className={`admin-role admin-role-${user.role}`}>
                      {user.role === "admin" ? "Admin" : "Student"}
                    </span>
                  </td>
                  <td>
                    {enrolments.filter(
                      (enrolment) => Number(enrolment.user_id) === Number(user.id)
                    ).length}
                  </td>
                  <td>
                    <span className={`admin-status admin-status-${user.status}`}>
                      {user.status === "active" ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="admin-table-actions">
                    <button type="button" className="secondary-button admin-status-button" onClick={() => openEditForm(user)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="secondary-button admin-status-button"
                      onClick={() => toggleStatus(user)}
                    >
                      {user.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : query ? (
        <EmptyState title="No users found" message="No accounts match your search." />
      ) : (
        <EmptyState title="No users yet" message="Accounts will appear here once people sign up." />
      )}

      {editingId && (
        <div className="admin-overlay" onMouseDown={closeForm}>
          <div
            ref={dialogRef}
            className="admin-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-user-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="admin-dialog-header">
              <h2 id="edit-user-title">Edit User</h2>
              <button type="button" className="settings-close" onClick={closeForm} aria-label="Close">
                &times;
              </button>
            </header>

            <form onSubmit={handleSubmit} noValidate>
              <FormField
                label="Name"
                id="user-name"
                type="text"
                value={form.name}
                onChange={updateField("name")}
                error={errors.name}
              />

              <FormField
                label="Email"
                id="user-email"
                type="email"
                value={form.email}
                onChange={updateField("email")}
                error={errors.email}
              />

              <div className="form-group">
                <label htmlFor="user-role">Role</label>
                <select id="user-role" value={form.role} onChange={updateField("role")}>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role === "admin" ? "Admin" : "Student"}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="login-button">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
