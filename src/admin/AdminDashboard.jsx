import LearnerGrowthChart from "./LearnerGrowthChart";
import { getRecentActivity, timeAgo } from "../services/activityService";
import { getAllCourses } from "../services/courseService";
import { getUsers } from "../services/userService";
import "../Dashboard.css";
import "../Admin.css";

function AdminDashboard() {
  const courses = getAllCourses();
  const users = getUsers();
  const learners = users.filter((user) => user.role === "Student");
  const totalEnrollments = users.reduce((sum, user) => sum + (user.enrolledCourseIds?.length ?? 0), 0);
  const activity = getRecentActivity();

  const stats = [
    { label: "Total Courses", value: courses.length },
    { label: "Total Enrollments", value: totalEnrollments },
    { label: "Total Learners", value: learners.length },
  ];

  return (
    <div className="dashboard admin-dashboard">
      <header className="dashboard-heading">
        <p className="eyebrow">Admin dashboard</p>
        <h1>Welcome back, Admin</h1>
        <p>Here's what's happening across StudyFlow right now.</p>
      </header>

      <div className="admin-stats-grid">
        {stats.map((stat) => (
          <div className="dash-card admin-stat-card" key={stat.label}>
            <p className="dash-kicker">{stat.label}</p>
            <p className="admin-stat-value">{stat.value}</p>
          </div>
        ))}
      </div>

      <LearnerGrowthChart />

      <section className="dash-card" aria-labelledby="activity-heading">
        <p className="dash-kicker">Recent activity</p>
        <h2 className="dash-title" id="activity-heading">
          What's happening
        </h2>

        {activity.length > 0 ? (
          <ul className="admin-activity-list">
            {activity.map((item) => (
              <li key={item.id}>
                <span>{item.message}</span>
                <time dateTime={item.timestamp}>{timeAgo(item.timestamp)}</time>
              </li>
            ))}
          </ul>
        ) : (
          <p className="dash-copy">No recent activity yet.</p>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
