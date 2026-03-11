const API_BASE = 'https://attendance-system-p71q.onrender.com/api';

const getToken = () => localStorage.getItem('token');

export async function api(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(API_BASE + path, opts);
  const data = await res.json();

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Token 已過期，請重新登入');
  }

  return { ...data, _status: res.status };
}