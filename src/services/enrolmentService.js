const API_URL = "http://localhost:5000/api/enrolments";

export async function getEnrolments() {
  const response = await fetch(API_URL);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to fetch enrolments");
  }

  return data;
}
export async function createEnrolment(userId, courseId) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
      course_id: courseId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to enrol in course");
  }

  return data.enrolment;
}

export async function deleteEnrolment(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to leave course");
  }

  return data;
}