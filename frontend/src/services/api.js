import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Request interceptor: attach Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const requestUrl = error.config?.url || '';

      // If 401 is from login or signup, let the calling component handle it
      if (requestUrl.includes('/auth/login') || requestUrl.includes('/auth/signup')) {
        return Promise.reject(error);
      }

      // For any other 401, clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export function loginUser(email, password) {
  return api.post('/auth/login', { email, password });
}

export function signupUser(full_name, company_name, email, password) {
  return api.post('/auth/signup', { full_name, company_name, email, password });
}

export function getMe() {
  return api.get('/auth/me');
}

export default api;
