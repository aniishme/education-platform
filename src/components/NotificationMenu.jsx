import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import bellIcon from "../assets/notification.png";
import { useSettings } from "../utils/settings";
import useDismiss from "../utils/useDismiss";

const READ_KEY = "studyflowReadNotifications";

// sample notifications until there is a real notifications service
// `type` ties an item to a switch in Settings → Notifications; items without one always show
const allNotifications = [
  {
    id: "react-deadline",
    type: "deadlines",
    title: "Lesson due soon",
    text: "Events and Forms in React Fundamentals is due on Friday.",
    time: "2 hours ago",
    to: "/my-learning",
  },
  {
    id: "cyber-lesson",
    type: "newLessons",
    title: "New lesson available",
    text: "A new lesson was added to Cybersecurity Essentials.",
    time: "Yesterday",
    to: "/courses/cybersecurity-essentials",
  },
  {
    id: "uiux-complete",
    title: "Course completed",
    text: "Congratulations! You completed UI/UX Design Basics.",
    time: "3 days ago",
    to: "/progress",
  },
];

const getReadIds = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(READ_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

const saveReadIds = (ids) => {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(ids));
  } catch {
    // read state just won't persist if storage is unavailable
  }
};

function NotificationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState(getReadIds);
  const [settings] = useSettings();
  const menuRef = useRef(null);
  const close = useCallback(() => setIsOpen(false), []);
  useDismiss(menuRef, isOpen, close);

  const notifications = allNotifications.filter((item) => !item.type || settings.notifications[item.type]);
  const unreadCount = notifications.filter((item) => !readIds.includes(item.id)).length;

  const updateReadIds = (ids) => {
    setReadIds(ids);
    saveReadIds(ids);
  };

  const markRead = (id) => {
    if (!readIds.includes(id)) updateReadIds([...readIds, id]);
  };

  const markAllRead = () => updateReadIds([...new Set([...readIds, ...notifications.map((item) => item.id)])]);

  return (
    <div className="nav-menu" ref={menuRef}>
      <button
        type="button"
        className="icon-button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="notification-panel"
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
        title="Notifications"
      >
        <img src={bellIcon} alt="" />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="nav-panel notification-panel" id="notification-panel">
          <div className="nav-panel-header">
            <h2>Notifications</h2>
            <button
              type="button"
              className="panel-text-button"
              onClick={markAllRead}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </button>
          </div>

          {notifications.length === 0 && (
            <p className="notification-empty">
              No notifications. You can turn them back on in Settings.
            </p>
          )}

          <ul className="notification-list">
            {notifications.map((item) => {
              const isUnread = !readIds.includes(item.id);

              return (
                <li key={item.id}>
                  <Link
                    to={item.to}
                    className={`notification-item${isUnread ? " unread" : ""}`}
                    onClick={() => {
                      markRead(item.id);
                      close();
                    }}
                  >
                    <span className="notification-dot" aria-hidden="true" />
                    <span>
                      <strong>{item.title}</strong>
                      <span className="notification-text">{item.text}</span>
                      <span className="notification-time">{item.time}</span>
                    </span>
                    {isUnread && <span className="visually-hidden">Unread</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default NotificationMenu;
