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
    return savedProfile ? { ...defaultProfile, ...JSON.parse(savedProfile) } : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

export function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
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
