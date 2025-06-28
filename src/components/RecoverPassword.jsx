import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../config/routes";

export default function RecoverPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRecoverPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/recover-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(
          result.message || "Se ha enviado un enlace a tu correo electrónico"
        );
      } else {
        setError(result.error || "Hubo un problema al procesar tu solicitud");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-800">Signaware</h1>
          <p className="text-blue-600 font-medium">Recuperar Contraseña</p>
        </div>

        {/* Formulario */}
        <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          {/* Mensaje de éxito */}
          {message && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-600 text-sm">{message}</p>
            </div>
          )}

          {/* Mensaje de error */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Texto explicativo */}
          <p className="text-gray-600 text-center mb-6">
            Ingresa tu correo electrónico y te enviaremos un enlace para
            restablecer tu contraseña.
          </p>

          {/* Formulario */}
          <form onSubmit={handleRecoverPassword} className="space-y-6">
            {/* Campo de correo/email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  className="w-full py-3 pl-12 pr-3 rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-500 transition-all duration-150 hover:shadow-md"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl flex items-center justify-center transition-all duration-150 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <span>Enviar enlace</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(ROUTES.LOGIN)}
                className="w-full py-2.5 px-4 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium rounded-xl transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Volver al login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
