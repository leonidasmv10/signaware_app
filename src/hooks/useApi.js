import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

export const useApi = () => {
  const { handleTokenExpired } = useAuth();

  const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      
      // Si es un error 401, manejar token caducado
      if (response.status === 401) {
        handleTokenExpired();
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Error en la petición');
      }
      
      return data;
    } catch (error) {
      if (error.message.includes('Sesión expirada')) {
        throw error;
      }
      throw new Error(error.message || 'Error de conexión');
    }
  };

  const apiRequestWithFormData = async (endpoint, formData) => {
    const token = localStorage.getItem('token');
    
    const config = {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      
      // Si es un error 401, manejar token caducado
      if (response.status === 401) {
        handleTokenExpired();
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error en la petición');
      }
      
      return await response.json();
    } catch (error) {
      if (error.message.includes('Sesión expirada')) {
        throw error;
      }
      throw new Error(error.message || 'Error de conexión');
    }
  };

  return {
    apiRequest,
    apiRequestWithFormData,
  };
}; 