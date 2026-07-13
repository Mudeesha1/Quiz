import { getAuthSession, saveAuthSession, clearAuthSession } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

const originalFetch = window.fetch;

window.fetch = async function (resource, config) {
  const url = typeof resource === 'string' ? resource : resource.url;
  
  // Only intercept requests destined to the backend API
  if (!url || !url.startsWith(API_BASE_URL)) {
    return originalFetch(resource, config);
  }

  // Avoid intercepting login, registration, and refresh requests
  if (
    url.endsWith('/users/login') ||
    url.endsWith('/admin/login') ||
    url.endsWith('/users/register') ||
    url.endsWith('/users/refresh')
  ) {
    return originalFetch(resource, config);
  }

  const response = await originalFetch(resource, config);

  // If unauthorized (401), initiate silent token refresh
  if (response.status === 401) {
    const session = getAuthSession();
    const refreshToken = session?.tokens?.refreshToken;

    if (!refreshToken) {
      handleUnauthorizedRedirect();
      return response;
    }

    if (!isRefreshing) {
      isRefreshing = true;
      originalFetch(`${API_BASE_URL}/users/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })
        .then(async (refreshResponse) => {
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            if (refreshData.status === 'success' && refreshData.tokens) {
              const newSession = {
                tokens: refreshData.tokens,
                user: refreshData.data || session.user,
              };
              saveAuthSession(newSession);
              isRefreshing = false;
              onRefreshed(refreshData.tokens.accessToken);
              return;
            }
          }
          throw new Error('Refresh failed');
        })
        .catch(() => {
          isRefreshing = false;
          refreshSubscribers = [];
          handleUnauthorizedRedirect();
        });
    }

    // Return a promise that resolves once the token is refreshed
    return new Promise((resolve) => {
      subscribeTokenRefresh((newToken) => {
        if (typeof resource === 'string') {
          const updatedConfig = { ...config };
          updatedConfig.headers = {
            ...updatedConfig.headers,
            'Authorization': `Bearer ${newToken}`,
          };
          resolve(originalFetch(resource, updatedConfig));
        } else {
          const newRequest = resource.clone();
          newRequest.headers.set('Authorization', `Bearer ${newToken}`);
          resolve(originalFetch(newRequest, config));
        }
      });
    });
  }

  // Handle Forbidden (403) errors by redirecting to custom /403 page
  if (response.status === 403) {
    window.location.href = '/403';
  }

  return response;
};

function handleUnauthorizedRedirect() {
  clearAuthSession();
  const isAdminPath = window.location.pathname.startsWith('/admin');
  window.location.href = isAdminPath ? '/admin/login' : '/401';
}
