const BASE = import.meta.env.VITE_API_URL || '';

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

  // Exclude auth check (/api/auth/me) and login attempts from auto-redirecting visitors
  const isAuthCheck = path.includes('/api/auth/me') || path.startsWith('/api/auth/login');
  if (res.status === 401 && !isAuthCheck) {
    localStorage.removeItem('user');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Session expired');
  }

  let data;
  try {
    data = await res.json();
  } catch {
    data = { message: res.statusText || 'Request failed' };
  }

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
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
