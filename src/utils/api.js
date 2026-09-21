const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Custom HTTP Client for API communication
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  // Convert body to JSON string if it's an object
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  try {
    const response = await fetch(url, config);
    let data;

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Auto-handle 401 Unauthorized (except on login/register endpoints)
    if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      localStorage.removeItem('token');
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }

    if (!response.ok) {
      // Build a descriptive error message
      let errorMessage = 'An error occurred';
      if (data && typeof data === 'object') {
        if (data.message) {
          errorMessage = data.message;
        } else if (Array.isArray(data.errors) && data.errors.length > 0) {
          errorMessage = data.errors.map((e) => e.message).join(', ');
        }
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      const offlineError = new Error('Cannot connect to server. Please check if the backend API is running.');
      offlineError.status = 503;
      throw offlineError;
    }
    throw err;
  }
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
