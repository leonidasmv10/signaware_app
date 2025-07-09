import { useState } from "react";
import { X, Plus, LogOut, User, Moon, Sun, Settings, MessageSquare, Ear, EarOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAudio } from "../context/AudioContext";

export default function Sidebar({ 
  sidebarOpen, 
  setSidebarOpen, 
  darkMode, 
  setDarkMode, 
  onNewChat 
}) {
  const { logout } = useAuth();
  const { isListeningEnabled, toggleListeningMode } = useAudio();
  
  const [chatHistory] = useState([
    { id: 1, title: "Consulta sobre seguridad vial", date: "Hoy", preview: "¿Cuáles son las mejores prácticas..." },
    { id: 2, title: "Configuración de audio", date: "Ayer", preview: "¿Cómo ajustar la sensibilidad..." },
    { id: 3, title: "Primera conversación", date: "15/12/2024", preview: "¡Hola! Soy tu asistente..." },
  ]);

  const handleLogout = async () => {
    try {
      await logout();
      // El logout ya maneja la redirección automáticamente
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <>
      {/* Sidebar - Visible por defecto en desktop, oculto en móvil */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:static inset-y-0 left-0 z-50 w-80 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r transform transition-transform duration-300 ease-in-out ${!sidebarOpen ? 'lg:hidden' : ''}`}>
        <div className="flex flex-col h-full">
          {/* Header del sidebar */}
          <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
            <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Signaware</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className={`p-2 rounded-lg transition-colors lg:hidden ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Botón Nuevo Chat */}
          <div className="p-4">
            <button
              onClick={onNewChat}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Chat</span>
            </button>
          </div>

          {/* Historial de chats */}
          <div className={`flex-1 overflow-y-auto px-4 ${darkMode ? 'scrollbar-dark' : 'scrollbar-light'}`}>
            <div className="space-y-2">
              {chatHistory.map((chat) => (
                <button
                  key={chat.id}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <div className="flex items-center space-x-2">
                    <MessageSquare className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>{chat.title}</p>
                      <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{chat.preview}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{chat.date}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer del sidebar - Perfil y opciones */}
          <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="space-y-2">
              {/* Toggle de tema */}
              <button
                onClick={toggleTheme}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                {darkMode ? (
                  <>
                    <Sun className="w-4 h-4" />
                    <span className="text-sm">Modo Claro</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" />
                    <span className="text-sm">Modo Oscuro</span>
                  </>
                )}
              </button>

              {/* Configuración */}
              <button className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <Settings className="w-4 h-4" />
                <span className="text-sm">Configuración</span>
              </button>

              {/* Modo escucha - Diseño mejorado */}
              <button
                onClick={toggleListeningMode}
                className={`group relative w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                  isListeningEnabled
                    ? `${darkMode 
                        ? 'bg-gradient-to-r from-emerald-600/20 to-green-600/20 border border-emerald-500/30 text-emerald-300 shadow-md' 
                        : 'bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 text-emerald-700 shadow-md'
                      }`
                    : `${darkMode 
                        ? 'hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-gray-700/50 border border-transparent hover:border-slate-600/30' 
                        : 'hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50 border border-transparent hover:border-slate-200'
                      }`
                }`}
              >
                {/* Icono */}
                <div className="relative z-10">
                  {isListeningEnabled ? (
                    <Ear className={`w-4 h-4 transition-all duration-300 group-hover:scale-110 ${
                      darkMode ? 'text-emerald-300' : 'text-emerald-600'
                    }`} />
                  ) : (
                    <EarOff className={`w-4 h-4 transition-all duration-300 group-hover:scale-110 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                  )}
                </div>
                {/* Texto */}
                <span className={`relative z-10 text-sm font-medium transition-all duration-300 group-hover:tracking-wide ${
                  isListeningEnabled
                    ? darkMode ? 'text-emerald-300' : 'text-emerald-700'
                    : darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {isListeningEnabled ? "Modo Escucha: Activo" : "Modo Escucha: Inactivo"}
                </span>
                {/* Indicador de estado simple */}
                <div className={`relative z-10 ml-auto w-2 h-2 rounded-full transition-all duration-300 ${
                  isListeningEnabled 
                    ? `${darkMode ? 'bg-emerald-400' : 'bg-emerald-500'}` 
                    : `${darkMode ? 'bg-gray-500' : 'bg-gray-400'}`
                }`} />
              </button>

              {/* Perfil del usuario */}
              <button className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                <User className="w-4 h-4" />
                <span className="text-sm">Mi Perfil</span>
              </button>

              {/* Cerrar sesión */}
              <button
                onClick={handleLogout}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${darkMode ? 'hover:bg-red-900 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay para cerrar sidebar en móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
} 