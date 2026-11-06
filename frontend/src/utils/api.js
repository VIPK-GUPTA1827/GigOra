const BASE = import.meta.env.VITE_API_URL || '';

const NO_REFRESH_PATHS = [
  '/api/auth/refresh',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/google',
  '/api/auth/logout'
];

let refreshPromise = null;

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include'
    }).finally(() => {
      refreshPromise = null;
    });
  }
  const res = await refreshPromise;
  return res.ok;
}

async function request(path, options = {}) {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {})
  };

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include'
  });

  // Handle 401: try silent token refresh before redirecting to login
  const isAuthPath = NO_REFRESH_PATHS.some((p) => path.startsWith(p));
  if (res.status === 401 && !options._retry && !isAuthPath) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return request(path, { ...options, _retry: true });
    }
    if (!path.includes('/api/auth/me')) {
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    const err = new Error('Session expired');
    err.status = 401;
    throw err;
  }

  let data;
  try {
    data = await res.json();
  } catch {
    data = { message: res.statusText || 'Request failed' };
  }

  // Redirect unverified users to verification prompt
  if (res.status === 403 && data?.requiresVerification) {
    if (window.location.pathname !== '/check-email') {
      window.location.assign('/check-email');
    }
  }

  if (!res.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = res.status;
    error.data = data;
    error.response = { status: res.status, data };
    throw error;
  }
  return data;
}

export const api = {
  get: (p, options = {}) => request(p, { ...options, method: 'GET' }),
  post: (p, body, options = {}) => request(p, { 
    ...options, 
    method: 'POST', 
    body: (typeof FormData !== 'undefined' && body instanceof FormData) ? body : JSON.stringify(body) 
  }),
  put: (p, body, options = {}) => request(p, { 
    ...options, 
    method: 'PUT', 
    body: (typeof FormData !== 'undefined' && body instanceof FormData) ? body : JSON.stringify(body) 
  }),
  patch: (p, body, options = {}) => request(p, { 
    ...options, 
    method: 'PATCH', 
    body: (typeof FormData !== 'undefined' && body instanceof FormData) ? body : JSON.stringify(body) 
  }),
  delete: (p, options = {}) => request(p, { ...options, method: 'DELETE' })
};

export default api;
