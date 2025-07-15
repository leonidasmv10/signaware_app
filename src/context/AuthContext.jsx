import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para validar si el token está caducado
  const validateToken = async (token) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/validate-token/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Error validando token:', error);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        // Validar el token antes de establecer el usuario
        const isValid = await validateToken(token);
        if (isValid) {
          setUser({ token });
        } else {
          // Token inválido, limpiar localStorage
          localStorage.removeItem("token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem('sound_detections');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    localStorage.setItem("token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    setUser({ token: data.access });
    return data;
  };

  const logout = async () => {
    try {
      // Intentar hacer logout en el servidor
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refresh_token");
      
      if (token && refreshToken) {
        await fetch(`${import.meta.env.VITE_API_URL}/user/logout/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });
      }
    } catch (error) {
      console.error("Error en logout del servidor:", error);
    } finally {
      // Limpiar siempre el estado local
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      setUser(null);
      
      // Limpiar otros datos de la aplicación
      localStorage.removeItem('sound_detections');
      
      // Forzar recarga de la página para limpiar todos los estados
      window.location.href = '/';
    }
  };

  // Función para manejar tokens caducados
  const handleTokenExpired = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem('sound_detections');
    setUser(null);
    
    // Disparar evento personalizado para notificación
    window.dispatchEvent(new CustomEvent('tokenExpired'));
    
    // Redirigir al login después de un breve delay para mostrar la notificación
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    handleTokenExpired,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
