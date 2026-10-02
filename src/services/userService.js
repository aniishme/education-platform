const API_URL = "http://localhost:5000/api/users";

export async function getUsers() {
  const response = await fetch(API_URL);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to fetch users");
  }

  return data;
}

export async function updateUser(id, { name, email, role }) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name.trim(),
      email: email.trim(),
      role,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to update user");
  }

  return data.user;
}

export async function updateUserStatus(id, status) {
  const response = await fetch(`${API_URL}/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to update user status");
  }

  return data.user;
}