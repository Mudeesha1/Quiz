import { getAuthSession, clearProfileCache } from "./authService";

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

export async function getPapersAndFilters() {
  const session = getAuthSession();
  const headers = { "Content-Type": "application/json" };
  if (session?.tokens?.accessToken) {
    headers["Authorization"] = `Bearer ${session.tokens.accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/app/papers`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    return parseErrorResponse(response);
  }

  return response.json();
}

export async function downloadPaper(paperId) {
  const session = getAuthSession();
  const headers = { "Content-Type": "application/json" };
  if (session?.tokens?.accessToken) {
    headers["Authorization"] = `Bearer ${session.tokens.accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/app/papers/${paperId}/download`, {
    method: "POST",
    headers,
  });

  if (!response.ok) {
    return parseErrorResponse(response);
  }

  const resData = await response.json();
  const badges = resData.newlyEarnedBadges || resData.data?.newlyEarnedBadges;
  if (resData.status === "success" && badges && badges.length > 0) {
    badges.forEach(badge => {
      window.dispatchEvent(new CustomEvent('badgeEarned', { detail: badge }));
    });
    window.dispatchEvent(new Event('profileUpdated'));
  }

  return resData;
}

export async function bookmarkPaper(paperId) {
  const session = getAuthSession();
  const headers = { "Content-Type": "application/json" };
  if (session?.tokens?.accessToken) {
    headers["Authorization"] = `Bearer ${session.tokens.accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/app/papers/${paperId}/bookmark`, {
    method: "POST",
    headers,
  });

  if (!response.ok) {
    return parseErrorResponse(response);
  }

  const resData = await response.json();
  const badges = resData.newlyEarnedBadges || resData.data?.newlyEarnedBadges;
  if (resData.status === "success" && badges && badges.length > 0) {
    badges.forEach(badge => {
      window.dispatchEvent(new CustomEvent('badgeEarned', { detail: badge }));
    });
    window.dispatchEvent(new Event('profileUpdated'));
  }

  return resData;
}

export async function completePaper(paperId) {
  const session = getAuthSession();
  const headers = { "Content-Type": "application/json" };
  if (session?.tokens?.accessToken) {
    headers["Authorization"] = `Bearer ${session.tokens.accessToken}`;
  }

  // Clear cache since marking a paper as completed could affect profile achievements
  clearProfileCache();

  const response = await fetch(`${API_BASE_URL}/app/papers/${paperId}/complete`, {
    method: "POST",
    headers,
  });

  if (!response.ok) {
    return parseErrorResponse(response);
  }

  const resData = await response.json();
  const badges = resData.newlyEarnedBadges || resData.data?.newlyEarnedBadges;
  if (resData.status === "success" && badges && badges.length > 0) {
    badges.forEach(badge => {
      window.dispatchEvent(new CustomEvent('badgeEarned', { detail: badge }));
    });
    window.dispatchEvent(new Event('profileUpdated'));
  }

  return resData;
}

export async function getQuizzes() {
  const session = getAuthSession();
  const headers = { "Content-Type": "application/json" };
  if (session?.tokens?.accessToken) {
    headers["Authorization"] = `Bearer ${session.tokens.accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/app/quizzes`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    return parseErrorResponse(response);
  }

  return response.json();
}

export async function getQuizById(quizId) {
  const session = getAuthSession();
  const headers = { "Content-Type": "application/json" };
  if (session?.tokens?.accessToken) {
    headers["Authorization"] = `Bearer ${session.tokens.accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/app/quizzes/${quizId}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    return parseErrorResponse(response);
  }

  return response.json();
}

export async function submitQuiz(quizId, payload) {
  const session = getAuthSession();
  const headers = { "Content-Type": "application/json" };
  if (session?.tokens?.accessToken) {
    headers["Authorization"] = `Bearer ${session.tokens.accessToken}`;
  }

  // Clear cache since we are submitting a quiz and updating XP/Level
  clearProfileCache();

  const response = await fetch(`${API_BASE_URL}/app/quizzes/${quizId}/submit`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return parseErrorResponse(response);
  }

  const resData = await response.json();
  const badges = resData.newlyEarnedBadges || resData.data?.newlyEarnedBadges;
  if (resData.status === "success" && badges && badges.length > 0) {
    badges.forEach(badge => {
      window.dispatchEvent(new CustomEvent('badgeEarned', { detail: badge }));
    });
    window.dispatchEvent(new Event('profileUpdated'));
  }

  return resData;
}
export async function getLeaderboard(subject) {
  const session = getAuthSession();
  const headers = { "Content-Type": "application/json" };
  if (session?.tokens?.accessToken) {
    headers["Authorization"] = `Bearer ${session.tokens.accessToken}`;
  }

  const queryParam = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  const response = await fetch(`${API_BASE_URL}/app/leaderboard${queryParam}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    return parseErrorResponse(response);
  }

  return response.json();
}

export async function getSubjects() {
  const session = getAuthSession();
  const headers = { "Content-Type": "application/json" };
  if (session?.tokens?.accessToken) {
    headers["Authorization"] = `Bearer ${session.tokens.accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/app/subjects`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    return parseErrorResponse(response);
  }

  return response.json();
}
