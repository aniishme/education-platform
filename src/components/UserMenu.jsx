import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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

  return (
    <div className="nav-menu" ref={menuRef}>
      <button
        type="button"
        className="avatar-button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="user-panel"
        aria-label="Account menu"
        title={profile.name}
      >
        {getInitials(profile.name)}
      </button>

      {isOpen && (
        <div className="nav-panel user-panel" id="user-panel">
          <div className="user-panel-identity">
            <strong>{profile.name}</strong>
            <span>{profile.email}</span>
          </div>

          <Link to="/profile" className="panel-item" onClick={close}>
            Profile
          </Link>
          <Link
            to="/settings/security"
            state={{ backgroundLocation: location }}
            className="panel-item"
            onClick={close}
          >
            Settings
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
