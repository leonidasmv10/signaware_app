import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../config/routes";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(username, password);
      navigate(ROUTES.HOME);
    } catch (err) {
      setError(err.message || "Usuario o contraseña incorrectos");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo animado con elementos de audición y IA */}
      <div className="fixed bottom-0 left-0 right-0 h-1/3 overflow-hidden bg-gradient-to-t from-blue-100 to-transparent z-0">
        <svg
          viewBox="0 0 400 200"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          {/* Definiciones */}
          <defs>
            {/* Gradiente para ondas de sonido */}
            <linearGradient
              id="soundGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.2)" />
              <stop offset="100%" stopColor="rgba(37, 99, 235, 0.4)" />
            </linearGradient>

            {/* Patrón de red neuronal */}
            <pattern
              id="neuralGrid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="30" cy="30" r="1" fill="rgba(59, 130, 246, 0.1)" />
              <path
                d="M 30 30 L 60 30 M 30 30 L 30 60 M 30 30 L 0 30 M 30 30 L 30 0"
                stroke="rgba(59, 130, 246, 0.05)"
                strokeWidth="0.5"
              />
            </pattern>

            {/* Icono de oído */}
            <symbol id="ear" viewBox="0 0 20 20">
              <path
                d="M10,2 C6,2 3,5 3,9 C3,13 6,16 10,16 C14,16 17,13 17,9 C17,5 14,2 10,2 Z"
                fill="rgba(59, 130, 246, 0.8)"
                stroke="rgba(37, 99, 235, 0.9)"
                strokeWidth="0.5"
              />
              <path
                d="M10,4 C7,4 5,6 5,9 C5,12 7,14 10,14 C13,14 15,12 15,9 C15,6 13,4 10,4 Z"
                fill="rgba(147, 197, 253, 0.6)"
              />
              <circle cx="10" cy="9" r="2" fill="rgba(37, 99, 235, 0.9)" />
            </symbol>

            {/* Icono de micrófono */}
            <symbol id="mic" viewBox="0 0 16 20">
              <rect
                x="6"
                y="2"
                width="4"
                height="12"
                rx="2"
                fill="rgba(59, 130, 246, 0.8)"
              />
              <rect
                x="4"
                y="14"
                width="8"
                height="2"
                rx="1"
                fill="rgba(37, 99, 235, 0.9)"
              />
              <circle cx="8" cy="8" r="1" fill="rgba(255, 255, 255, 0.8)" />
            </symbol>

            {/* Icono de IA/Cerebro */}
            <symbol id="brain" viewBox="0 0 24 20">
              <path
                d="M12,2 C8,2 5,5 5,9 C5,13 8,16 12,16 C16,16 19,13 19,9 C19,5 16,2 12,2 Z"
                fill="rgba(59, 130, 246, 0.7)"
                stroke="rgba(37, 99, 235, 0.8)"
                strokeWidth="0.5"
              />
              <circle cx="9" cy="7" r="1" fill="rgba(37, 99, 235, 1)" />
              <circle cx="15" cy="7" r="1" fill="rgba(37, 99, 235, 1)" />
              <circle cx="12" cy="12" r="1" fill="rgba(37, 99, 235, 1)" />
              <path
                d="M9,7 L15,7 M9,7 L12,12 M15,7 L12,12"
                stroke="rgba(37, 99, 235, 0.6)"
                strokeWidth="0.5"
              />
            </symbol>
          </defs>

          {/* Fondo con patrón de red neuronal */}
          <rect width="100%" height="100%" fill="url(#neuralGrid)" />

          {/* Ondas de sonido animadas */}
          <path
            d="M0,100 Q50,90 100,100 T200,100 T300,100 T400,100"
            stroke="rgba(59, 130, 246, 0.6)"
            strokeWidth="3"
            fill="none"
          >
            <animate
              attributeName="d"
              values="M0,100 Q50,90 100,100 T200,100 T300,100 T400,100;M0,100 Q50,110 100,100 T200,100 T300,100 T400,100;M0,100 Q50,90 100,100 T200,100 T300,100 T400,100"
              dur="2s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M0,120 Q50,110 100,120 T200,120 T300,120 T400,120"
            stroke="rgba(37, 99, 235, 0.5)"
            strokeWidth="2"
            fill="none"
          >
            <animate
              attributeName="d"
              values="M0,120 Q50,110 100,120 T200,120 T300,120 T400,120;M0,120 Q50,130 100,120 T200,120 T300,120 T400,120;M0,120 Q50,110 100,120 T200,120 T300,120 T400,120"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M0,80 Q50,70 100,80 T200,80 T300,80 T400,80"
            stroke="rgba(147, 197, 253, 0.7)"
            strokeWidth="2.5"
            fill="none"
          >
            <animate
              attributeName="d"
              values="M0,80 Q50,70 100,80 T200,80 T300,80 T400,80;M0,80 Q50,90 100,80 T200,80 T300,80 T400,80;M0,80 Q50,70 100,80 T200,80 T300,80 T400,80"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </path>

          {/* Iconos flotantes animados */}
          <use href="#ear" x="50" y="30" width="12" height="12">
            <animate
              attributeName="y"
              values="30;25;30"
              dur="3s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.8;1;0.8"
              dur="3s"
              repeatCount="indefinite"
            />
          </use>
          <use href="#mic" x="150" y="40" width="10" height="12">
            <animate
              attributeName="y"
              values="40;35;40"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.7;1;0.7"
              dur="2s"
              repeatCount="indefinite"
            />
          </use>
          <use href="#brain" x="250" y="35" width="14" height="12">
            <animate
              attributeName="y"
              values="35;30;35"
              dur="4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;1;0.6"
              dur="4s"
              repeatCount="indefinite"
            />
          </use>
          <use href="#ear" x="320" y="45" width="10" height="10">
            <animate
              attributeName="y"
              values="45;40;45"
              dur="2.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.7;1;0.7"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </use>

          {/* Puntos de conexión pulsantes */}
          <circle cx="100" cy="100" r="3" fill="rgba(37, 99, 235, 0.8)">
            <animate
              attributeName="r"
              values="3;6;3"
              dur="1.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="1;0.5;1"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="200" cy="100" r="3" fill="rgba(37, 99, 235, 0.8)">
            <animate
              attributeName="r"
              values="3;6;3"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="1;0.5;1"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="300" cy="100" r="3" fill="rgba(37, 99, 235, 0.8)">
            <animate
              attributeName="r"
              values="3;6;3"
              dur="2.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="1;0.5;1"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Líneas de conexión animadas */}
          <path
            d="M100,100 L200,100"
            stroke="rgba(147, 197, 253, 0.8)"
            strokeWidth="1"
            strokeDasharray="5,3"
            fill="none"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="8;0"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M200,100 L300,100"
            stroke="rgba(147, 197, 253, 0.8)"
            strokeWidth="1"
            strokeDasharray="5,3"
            fill="none"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="8;0"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </path>

          {/* Efecto de radar central */}
          <circle
            cx="200"
            cy="100"
            r="0"
            fill="none"
            stroke="rgba(37, 99, 235, 0.6)"
            strokeWidth="1"
          >
            <animate
              attributeName="r"
              values="0;60"
              dur="3s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Partículas de sonido */}
          <circle cx="50" cy="80" r="1" fill="rgba(59, 130, 246, 0.6)">
            <animate
              attributeName="cx"
              values="50;450"
              dur="6s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0"
              dur="6s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="100" cy="120" r="1" fill="rgba(37, 99, 235, 0.6)">
            <animate
              attributeName="cx"
              values="100;450"
              dur="4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0"
              dur="4s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="150" cy="90" r="1" fill="rgba(147, 197, 253, 0.6)">
            <animate
              attributeName="cx"
              values="150;450"
              dur="5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0"
              dur="5s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>

      <div className="w-full max-w-md px-6 flex flex-col items-center z-10 relative">
        {/* Logo y título */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Signaware</h1>
          <p className="text-blue-600 font-medium">Agente Inteligente de Asistencia Auditiva</p>
        </div>

        {/* Formulario */}
        <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800 placeholder-gray-500 transition-all duration-150 hover:shadow-md"
                placeholder="Ingresa tu usuario"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800 placeholder-gray-500 transition-all duration-150 hover:shadow-md"
                  placeholder="Ingresa tu contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors duration-150"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-150 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Iniciando sesión...
                </div>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>

          {/* Enlaces adicionales */}
          <div className="mt-6 space-y-3">
            <button
              onClick={() => navigate(ROUTES.RECOVER_PASSWORD)}
              className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-150"
            >
              ¿Olvidaste tu contraseña?
            </button>
            <div className="text-center">
              <span className="text-gray-600 text-sm">¿No tienes cuenta? </span>
              <button
                onClick={() => navigate(ROUTES.REGISTER)}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-150"
              >
                Regístrate aquí
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
