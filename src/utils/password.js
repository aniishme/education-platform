// The app has no server yet, so the account password lives in the browser.
// Only a SHA-256 hash of a changed password is stored, never the password itself.

const PASSWORD_KEY = "studyflowPasswordHash";
const DEFAULT_PASSWORD = "student 123"; // the demo account's starting password

async function hashPassword(password) {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Secure hashing isn't available in this browser.");
  }

  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

const getStoredHash = () => {
  try {
    return localStorage.getItem(PASSWORD_KEY);
  } catch {
    return null;
  }
};

export async function verifyPassword(password) {
  const storedHash = getStoredHash();
  if (!storedHash) return password === DEFAULT_PASSWORD;

  try {
    return (await hashPassword(password)) === storedHash;
  } catch {
    return false;
  }
}

// resolves true when changed, false when the current password was wrong
export async function changePassword(currentPassword, newPassword) {
  if (!(await verifyPassword(currentPassword))) return false;

  localStorage.setItem(PASSWORD_KEY, await hashPassword(newPassword));
  return true;
}
