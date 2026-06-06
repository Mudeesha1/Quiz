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

let profileCachePromise = null;

function clearProfileCache() {
  profileCachePromise = null;
}

function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  profileCachePromise = null;
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

async function getUserProfile() {
  const session = getAuthSession();
  
  if (!session?.tokens?.accessToken) {
    throw new Error("No valid session found");
  }

  if (profileCachePromise) {
    return profileCachePromise;
  }

  profileCachePromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.tokens.accessToken}`,
        },
      });

      if (!response.ok) {
        profileCachePromise = null; // Reset cache on error
        return parseErrorResponse(response);
      }

      return await response.json();
    } catch (err) {
      profileCachePromise = null; // Reset cache on error
      throw err;
    }
  })();

  return profileCachePromise;
}

async function requestPasswordReset(email) {
  const response = await fetch(`${API_BASE_URL}/users/forget-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    return parseErrorResponse(response);
  }

  return response.json();
}

async function resetPassword(data) {
  const response = await fetch(`${API_BASE_URL}/users/reset-password`, {
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

async function updateUserProfile(data) {
  const session = getAuthSession();
  
  if (!session?.tokens?.accessToken) {
    throw new Error("No valid session found");
  }

  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.tokens.accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    return parseErrorResponse(response);
  }

  return response.json();
}

function updateAuthUser(updatedUser) {
  const session = getAuthSession();
  if (session) {
    session.user = { ...session.user, ...updatedUser };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  }
}

export {
  registerUser,
  loginUser,
  saveAuthSession,
  clearAuthSession,
  getAuthSession,
  getUserProfile,
  clearProfileCache,
  requestPasswordReset,
  resetPassword,
  updateUserProfile,
  updateAuthUser,
};
