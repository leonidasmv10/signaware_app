import { useState, useRef, useEffect } from "react";
import { X, LogOut, Moon, Sun, Ear, EarOff, Sparkles, Brain, Zap, GripVertical } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAudio } from "../context/AudioContext";

export default function Sidebar({ 
  sidebarOpen, 
  setSidebarOpen, 
  darkMode, 
  setDarkMode, 
  onNewChat,
  selectedModel,
  setSelectedModel
}) {
  const { logout } = useAuth();
  const { isListeningEnabled, toggleListeningMode } = useAudio();
  const [sidebarWidth, setSidebarWidth] = useState(320); // 320px = w-80
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);

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

  const handleModelSelect = (model) => {
    setSelectedModel(model);
  };

  // Funciones para redimensionar el sidebar
  const startResizing = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Start resizing');
    setIsResizing(true);
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;
    
    const newWidth = e.clientX;
    const minWidth = 240;
    const maxWidth = 480;
    
    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    console.log('Resizing to:', clampedWidth);
    setSidebarWidth(clampedWidth);
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  // Event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', stopResizing);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopResizing);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing]);

  return (
    <>
      {/* Sidebar - Visible por defecto en desktop, oculto en móvil */}
      <div 
        ref={sidebarRef}
        style={{ width: `${sidebarWidth}px` }}
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:static inset-y-0 left-0 z-50 ${darkMode ? 'bg-gray-900' : 'bg-white'} border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'} transform transition-transform duration-300 ease-in-out ${!sidebarOpen ? 'lg:hidden' : ''}`}
      >
        <div className="flex flex-col h-full">
          {/* Header del sidebar */}
          <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} h-16 flex items-center`}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Signaware</h2>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className={`p-2 rounded-lg transition-colors lg:hidden ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sección principal */}
          <div className="flex-1 overflow-y-auto">
            {/* Modelos IA */}
            <div className="p-4">
              <div className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
                MODELOS IA
              </div>
              
              {/* Gemini */}
              <button
                onClick={() => handleModelSelect('gemini')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors mb-2 ${
                  selectedModel === 'gemini'
                    ? `${darkMode 
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`
                    : `${darkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }`
                }`}
              >
                <Brain className="w-4 h-4" />
                <span className="text-sm">Gemini</span>
              </button>

              {/* OpenAI */}
              <button
                onClick={() => handleModelSelect('openai')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors mb-2 ${
                  selectedModel === 'openai'
                    ? `${darkMode 
                        ? 'bg-green-600/20 text-green-300 border border-green-500/30' 
                        : 'bg-green-50 text-green-700 border border-green-200'
                      }`
                    : `${darkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }`
                }`}
              >
                <Zap className="w-4 h-4" />
                <span className="text-sm">OpenAI</span>
              </button>

              {/* LeonidasMV */}
              <button
                onClick={() => handleModelSelect('leonidasmv')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  selectedModel === 'leonidasmv'
                    ? `${darkMode 
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`
                    : `${darkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }`
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">LeonidasMV</span>
              </button>
            </div>

            {/* Separador */}
            <div className={`border-t mx-4 mb-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>

            {/* Sección de configuraciones */}
            <div className="px-4 space-y-2">
              <div className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                CONFIGURACIÓN
              </div>
              
              {/* Modo escucha */}
              <button
                onClick={toggleListeningMode}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isListeningEnabled
                    ? `${darkMode 
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`
                    : `${darkMode 
                        ? 'text-gray-300 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }`
                }`}
              >
                {isListeningEnabled ? (
                  <Ear className="w-4 h-4" />
                ) : (
                  <EarOff className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {isListeningEnabled ? "Modo Escucha Activo" : "Modo Escucha"}
                </span>
              </button>

              {/* Toggle de tema */}
              <button
                onClick={toggleTheme}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {darkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {darkMode ? "Modo Claro" : "Modo Oscuro"}
                </span>
              </button>
            </div>
          </div>

          {/* Footer - Cerrar sesión */}
          <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                darkMode 
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-red-400' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-red-600'
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Cerrar Sesión</span>
            </button>
          </div>
        </div>
        
        {/* Handle de redimensionamiento */}
        <div
          className={`absolute top-0 right-0 w-2 h-full cursor-col-resize ${darkMode ? 'hover:bg-blue-400/50' : 'hover:bg-blue-500/50'} transition-colors duration-200`}
          onMouseDown={startResizing}
        >
          <div className={`absolute top-1/2 right-0 transform -translate-y-1/2 w-1 h-12 ${darkMode ? 'bg-gray-500' : 'bg-gray-400'} rounded-full`}></div>
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