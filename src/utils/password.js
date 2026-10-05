import { api } from "../services/api";
export async function changePassword(currentPassword, newPassword) {
  await api("/auth/password", {
    method: "PUT",
    body: { currentPassword, newPassword },
  });
  return true;
}
