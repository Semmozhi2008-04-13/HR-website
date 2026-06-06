const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5002';



export async function apiGet(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return response.json();
}

export async function apiDelete(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(`API delete failed: ${response.status}`);
  }
  return response.json();
}

export async function apiPatch(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`API update failed: ${response.status}`);
  }
  return response.json();
}

export async function apiPost(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`API create failed: ${response.status}`);
  }
  return response.json();
}

export async function apiPut(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`API update failed: ${response.status}`);
  }
  return response.json();
}

