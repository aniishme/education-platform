const AUTH_KEY = "studyflowAuth";

export function getAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return Boolean(getAuth()?.isLoggedIn);
}

export function getRole() {
  return getAuth()?.role ?? "student";
}

export function isAdmin() {
  return isLoggedIn() && getRole() === "admin";
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}
