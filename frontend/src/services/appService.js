const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

async function parseErrorResponse(response) {
  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  const error = new Error(payload?.message || "Request failed");
  error.status = response.status;
  error.fieldErrors = payload?.fieldErrors || {};
  error.payload = payload;

  throw error;
}

export async function getGrades() {
  const response = await fetch(`${API_BASE_URL}/app/grades`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return parseErrorResponse(response);
  }

  return response.json();
}

export async function getSubjectsByGrade(gradeId) {
  const response = await fetch(`${API_BASE_URL}/app/grades/${gradeId}/subjects`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return parseErrorResponse(response);
  }

  return response.json();
}

export async function getTopRankedUsers() {
  const response = await fetch(`${API_BASE_URL}/app/leaderboard/top-3`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return parseErrorResponse(response);
  }

  return response.json();
}
