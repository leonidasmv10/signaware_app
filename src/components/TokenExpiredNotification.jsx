import React, { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function TokenExpiredNotification() {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Escuchar eventos de token expirado
    const handleTokenExpired = () => {
      setShowNotification(true);
    };

    // Agregar listener para eventos personalizados
    window.addEventListener('tokenExpired', handleTokenExpired);

    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, []);

  const handleClose = () => {
    setShowNotification(false);
  };

  if (!showNotification) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Sesión expirada
            </h3>
            <p className="mt-1 text-sm text-red-700">
              Tu sesión ha expirado. Serás redirigido al login.
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className="inline-flex text-red-400 hover:text-red-600 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 