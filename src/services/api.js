const API_URL = import.meta.env.VITE_API_URL;

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Error en la petición');
  }
  return data;
};

export const authService = {
  login: async (username, password) => {
    const response = await fetch(`${API_URL}/user/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(response);
  },

  register: async (userData) => {
    const response = await fetch(`${API_URL}/user/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  recoverPassword: async (email) => {
    const response = await fetch(`${API_URL}/user/recover-password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  resetPassword: async (uidb64, token, password) => {
    const response = await fetch(`${API_URL}/user/reset-password/${uidb64}/${token}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    return handleResponse(response);
  },
};

export const textGeneration = async (message, model = 'gemini') => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/agent/text_generation/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ message, model }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error en la petición a Gemini');
  }
  return data.response;
};

