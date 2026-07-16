const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:80';

const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('token');
  return {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

async function logoutUser() {
  try {
    await fetch(`${BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
  } finally {
    localStorage.removeItem('token');
    // window.location.href = '/';
  }
}

export const apiClient = {
  async request(endpoint, options = {}) {
    const isFormData = options.body instanceof FormData;

    options.headers = {
      ...getHeaders(isFormData),
      ...options.headers
    };

    let res = await fetch(`${BASE_URL}${endpoint}`, options);

    const isAuthRoute = endpoint.includes('/auth/login') || endpoint.includes('/auth/register');

    if (res.status === 401 && !isAuthRoute) {
      try {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include'
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          localStorage.setItem('token', data.access_token);
          options.headers['Authorization'] = `Bearer ${data.access_token}`;
          res = await fetch(`${BASE_URL}${endpoint}`, options);
        } else {
          logoutUser();
        }
      } catch {
        logoutUser();
      }
    }

    if (!res.ok) {
      const contentType = res.headers.get('content-type');
      let errorData = {};
      if (contentType && contentType.includes('application/json')) {
        errorData = await res.json().catch(() => ({}));
      }
      throw new Error(errorData.detail || `Server error: ${res.status}`);
    }

    return res;
  }
};