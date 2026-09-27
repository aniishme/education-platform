import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAuth, getRole } from "../utils/auth";
import { PROFILE_UPDATED_EVENT, getInitials, getSavedProfile } from "../utils/profile";
import useDismiss from "../utils/useDismiss";

function UserMenu({ onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState(getSavedProfile);
  const location = useLocation();
  const menuRef = useRef(null);
  const close = useCallback(() => setIsOpen(false), []);
  useDismiss(menuRef, isOpen, close);

  // keep the avatar in step when the profile is edited
  useEffect(() => {
    const refresh = () => setProfile(getSavedProfile());
    window.addEventListener(PROFILE_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, refresh);
  }, []);

  const isAdmin = getRole() === "admin";
  const displayName = isAdmin ? "Admin" : profile.name;
  const displayEmail = isAdmin ? getAuth()?.email ?? "admin@gmail.com" : profile.email;
  const initials = isAdmin ? "AD" : getInitials(profile.name);
  // the security tab changes the student demo password, which has nothing to do with
  // the admin's fixed login credential, so admins skip straight to their other settings
  const settingsPath = isAdmin ? "/settings/notifications" : "/settings/security";

  return (
    <div className="nav-menu" ref={menuRef}>
      <button
        type="button"
        className="avatar-button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="user-panel"
        aria-label="Account menu"
        title={displayName}
      >
        {initials}
      </button>

      {isOpen && (
        <div className="nav-panel user-panel" id="user-panel">
          <div className="user-panel-identity">
            <strong>{displayName}</strong>
            <span>{displayEmail}</span>
          </div>

          {!isAdmin && (
            <Link to="/profile" className="panel-item" onClick={close}>
              Profile
            </Link>
          )}
          <Link
            to={settingsPath}
            state={{ backgroundLocation: location }}
            className="panel-item"
            onClick={close}
          >
            {isAdmin ? "Admin Settings" : "Settings"}
          </Link>
          <button type="button" className="panel-item" onClick={onLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
