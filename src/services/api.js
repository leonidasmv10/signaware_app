const API_URL = import.meta.env.VITE_API_URL;

// Función para manejar tokens caducados
const handleTokenExpired = () => {
  // Limpiar tokens del localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem('sound_detections');
  
  // Redirigir al login
  window.location.href = '/login';
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    // Si es un error 401 (Unauthorized), el token ha expirado
    if (response.status === 401) {
      handleTokenExpired();
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }
    throw new Error(data.detail || 'Error en la petición');
  }
  return data;
};

// Función para hacer peticiones con manejo automático de tokens caducados
const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  
  // Si es un error 401, manejar token caducado
  if (response.status === 401) {
    handleTokenExpired();
    throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
  }
  
  return response;
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
  const response = await apiRequest(`${API_URL}/agent/text_generation/`, {
    method: 'POST',
    body: JSON.stringify({ message, model }),
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error en la petición a Gemini');
  }
  return data;
};

// Función para hacer peticiones a la API de audio con manejo de tokens caducados
export const processAudio = async (formData) => {
  const response = await apiRequest(`${API_URL}/agent/process-audio/`, {
    method: 'POST',
    body: formData,
  });
  
  return response;
};

// Función para hacer peticiones a la API de audio
export const audioApiRequest = async (url, options = {}) => {
  return apiRequest(url, options);
};



