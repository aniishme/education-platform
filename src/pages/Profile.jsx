import { useState } from "react";
import "../Profile.css";

const defaultProfile = {
  name: "Sameera",
  email: "cihe251109@student.cihe.edu.au",
  studentId: "CIHE251109",
  course: "Advanced Web Application Development",
  memberSince: "September 2024",
};

const getSavedProfile = () => {
  try {
    const savedProfile = localStorage.getItem("studyflowProfile");
    return savedProfile ? { ...defaultProfile, ...JSON.parse(savedProfile) } : defaultProfile;
  } catch {
    return defaultProfile;
  }
};

const getInitials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function Profile() {
  const [profile, setProfile] = useState(getSavedProfile);
  const [draftProfile, setDraftProfile] = useState(profile);
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setDraftProfile(profile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraftProfile(profile);
    setIsEditing(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDraftProfile((currentProfile) => ({ ...currentProfile, [name]: value }));
  };

  const handleSave = (event) => {
    event.preventDefault();
    const updatedProfile = {
      ...draftProfile,
      name: draftProfile.name.trim(),
      email: draftProfile.email.trim(),
      studentId: draftProfile.studentId.trim(),
      course: draftProfile.course.trim(),
    };

    localStorage.setItem("studyflowProfile", JSON.stringify(updatedProfile));
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  return (
    <section className="profile-page" aria-labelledby="profile-title">
      <div className="profile-heading">
        <p className="eyebrow">Student account</p>
        <h1 id="profile-title">My profile</h1>
        <p>Keep your learning identity and course details up to date.</p>
      </div>

      <div className="profile-layout">
        <article className="profile-card profile-summary">
          <div className="profile-avatar" aria-hidden="true">{getInitials(profile.name)}</div>
          <h2>{profile.name}</h2>
          <p className="profile-email">{profile.email}</p>
          <p className="profile-status">Active learner</p>
          <button type="button" className="profile-edit-button" onClick={handleEdit}>
            Edit Profile
          </button>
        </article>

        <div className="profile-details">
          <article className="profile-card">
            <div className="profile-card-heading">
              <div>
                <p className="profile-card-kicker">Personal details</p>
                <h2>Student information</h2>
              </div>
            </div>

            <dl className="profile-info-grid">
              <div>
                <dt>Full name</dt>
                <dd>{profile.name}</dd>
              </div>
              <div>
                <dt>Email address</dt>
                <dd>{profile.email}</dd>
              </div>
              <div>
                <dt>Student ID</dt>
                <dd>{profile.studentId}</dd>
              </div>
              <div>
                <dt>Member since</dt>
                <dd>{profile.memberSince}</dd>
              </div>
            </dl>
          </article>

          <article className="profile-card course-overview">
            <div className="profile-card-heading">
              <div>
                <p className="profile-card-kicker">Learning journey</p>
                <h2>Course information</h2>
              </div>
              <span className="course-badge">In progress</span>
            </div>

            <div className="course-overview-content">
              <div>
                <p className="course-label">Current course</p>
                <h3>{profile.course}</h3>
                <p>Continue building practical skills through your StudyFlow learning journey.</p>
              </div>
              <div className="course-progress" aria-label="Course progress: 68 percent">
                <div className="course-progress-label">
                  <span>Progress</span>
                  <strong>68%</strong>
                </div>
                <div className="progress-track">
                  <span style={{ width: "68%" }} />
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>

      {isEditing && (
        <div className="profile-modal-backdrop" role="presentation" onMouseDown={handleCancel}>
          <div
            className="profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="profile-modal-heading">
              <div>
                <p className="profile-card-kicker">Student account</p>
                <h2 id="edit-profile-title">Edit profile</h2>
              </div>
              <button type="button" className="profile-modal-close" onClick={handleCancel} aria-label="Close edit profile form">
                &times;
              </button>
            </div>

            <form className="profile-form" onSubmit={handleSave}>
              <label>
                Full name
                <input name="name" value={draftProfile.name} onChange={handleChange} required />
              </label>
              <label>
                Email address
                <input name="email" type="email" value={draftProfile.email} onChange={handleChange} required />
              </label>
              <label>
                Student ID
                <input name="studentId" value={draftProfile.studentId} onChange={handleChange} required />
              </label>
              <label>
                Course
                <input name="course" value={draftProfile.course} onChange={handleChange} required />
              </label>
              <label>
                Member since
                <input name="memberSince" value={draftProfile.memberSince} onChange={handleChange} required />
              </label>

              <div className="profile-form-actions">
                <button type="button" className="profile-cancel-button" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="profile-save-button">
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Profile;
