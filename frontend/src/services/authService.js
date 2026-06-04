const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const AUTH_STORAGE_KEY = "quiz-master-auth";

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

async function registerUser(data) {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    return parseErrorResponse(response);
  }

  return response.json();
}

async function loginUser(data) {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    return parseErrorResponse(response);
  }

  return response.json();
}

function saveAuthSession(payload) {
  if (!payload) return;

  const session = {
    tokens: payload.tokens || null,
    user: payload.data || null,
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

function getAuthSession() {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export { registerUser, loginUser, saveAuthSession, clearAuthSession, getAuthSession };
