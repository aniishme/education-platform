import LearnerGrowthChart from "./LearnerGrowthChart";
import { useEffect, useState } from "react";
import { getRecentActivity, timeAgo } from "../services/activityService";
import { getCourses } from "../services/courseService";
import { getUsers } from "../services/userService";
import { getEnrolments } from "../services/enrolmentService";
import "../Dashboard.css";
import "../Admin.css";

function AdminDashboard() {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [enrolments, setEnrolments] = useState([]);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
  async function loadCourses() {
    try {
      const courseData = await getCourses();
      setCourses(courseData);
    } catch (error) {
      console.error("Unable to load courses:", error);
    }
  }

  loadCourses();
}, []);

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

useEffect(() => {
  async function loadActivity() {
    try {
      const activityData = await getRecentActivity();
      setActivity(activityData);
    } catch (error) {
      console.error("Unable to load activity:", error);
    }
  }

  loadActivity();
}, []);
const learners = users.filter(
  (user) => user.role?.toLowerCase() === "student"
);

  const totalEnrollments = enrolments.length;
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
                <time dateTime={item.timestamp}>{timeAgo(item.created_at)}</time>
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
