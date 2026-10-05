
import { getAuth } from "./auth";

const PROFILE_KEY = "studyflowProfile";

export const PROFILE_UPDATED_EVENT = "studyflow-profile-updated";

export const defaultProfile = {
  name: "Student 1",
  email: "student@gmail.com",
  studentId: "CIHE251109",
  course: "Advanced Web Application Development",
  memberSince: "September 2024",
};

export function getSavedProfile() {
  try {
    const savedProfile = localStorage.getItem(PROFILE_KEY);
    const storedProfile = savedProfile
      ? JSON.parse(savedProfile)
      : {};

    const auth = getAuth();

    return {
      ...defaultProfile,
      ...storedProfile,

      // Use the currently logged-in account
      // when authentication information is available.
      ...(auth
        ? {
            name: auth.name || storedProfile.name || defaultProfile.name,
            email:
              auth.email || storedProfile.email || defaultProfile.email,
          }
        : {}),
    };
  } catch {
    const auth = getAuth();

    return {
      ...defaultProfile,
      ...(auth
        ? {
            name: auth.name || defaultProfile.name,
            email: auth.email || defaultProfile.email,
          }
        : {}),
    };
  }
}

export function saveProfile(profile) {
  const auth = getAuth();

  const updatedProfile = {
    ...profile,
  };

  // Keep the authentication account information in sync
  // when the user edits their name or email.
  if (auth) {
    localStorage.setItem(
      "studyflowAuth",
      JSON.stringify({
        ...auth,
        name: updatedProfile.name,
        email: updatedProfile.email,
      })
    );
  }

  localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));

  window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
}

export function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
