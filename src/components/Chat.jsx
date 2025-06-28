import { useState, useRef, useEffect } from "react";
import { Volume2, Send, Mic, MicOff, Menu, X, Plus, LogOut, User, Moon, Sun, Settings, MessageSquare, PanelLeftClose, PanelLeft, Play, Pause } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAudio } from "../context/AudioContext";
import { useAuth } from "../context/AuthContext";

// Componente para el reproductor de audio
const AudioPlayer = ({ audioId, soundType }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const loadAudio = async () => {
    if (!audioId || audioUrl) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/agent/audio/${audioId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      } else {
        console.error("Error al cargar audio:", response.status);
      }
    } catch (error) {
      console.error("Error al cargar audio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = () => {
    if (!audioUrl) {
      loadAudio();
      return;
    }

    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioPlay = () => {
    setIsPlaying(true);
  };

  const handleAudioPause = () => {
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-full transition-colors"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isLoading ? "Cargando audio..." : "Reproducir audio detectado"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tipo: {soundType}
            </p>
          </div>
        </div>
        <Volume2 className="w-5 h-5 text-gray-400" />
      </div>
      
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={handleAudioEnded}
          onPlay={handleAudioPlay}
          onPause={handleAudioPause}
          className="hidden"
        />
      )}
    </div>
  );
};

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "¡Hola! Soy tu asistente de Signaware. Estoy aquí para ayudarte con cualquier consulta sobre seguridad vial, tecnología de conducción o asistencia auditiva. ¿En qué puedo ayudarte hoy?",
      isBot: true,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [chatHistory] = useState([
    { id: 1, title: "Consulta sobre seguridad vial", date: "Hoy", preview: "¿Cuáles son las mejores prácticas..." },
    { id: 2, title: "Configuración de audio", date: "Ayer", preview: "¿Cómo ajustar la sensibilidad..." },
    { id: 3, title: "Primera conversación", date: "15/12/2024", preview: "¡Hola! Soy tu asistente..." },
  ]);
  const messagesEndRef = useRef(null);

  const { logout } = useAuth();

  const {
    isRecording,
    isProcessing,
    autoMode,
    volume,
    detectionStatus: audioDetectionStatus,
    lastAgentResult,
  } = useAudio();

  // Efecto para mostrar resultados del agente en el chat
  useEffect(() => {
    if (lastAgentResult) {
      const agentMessage = createAgentMessage(lastAgentResult);
      setMessages(prev => [...prev, agentMessage]);
    }
  }, [lastAgentResult]);

  // Mapeo de tipos de sonido a iconos y descripciones
  const soundTypeMapping = {
    // Sonidos de vehículos
    "Siren": { icon: "🚨", description: "Sirena de Emergencia", type: "warning" },
    "Horn": { icon: "🚗", description: "Bocina de Vehículo", type: "warning" },
    "Vehicle": { icon: "🚙", description: "Sonido de Vehículo", type: "info" },
    "Car": { icon: "🚙", description: "Sonido de Vehículo", type: "info" },
    "Engine": { icon: "🚙", description: "Motor de Vehículo", type: "info" },
    "Truck": { icon: "🚛", description: "Camión", type: "info" },
    "Motorcycle": { icon: "🏍️", description: "Motocicleta", type: "info" },
    
    // Sonidos de comunicación
    "Speech": { icon: "🗣️", description: "Habla", type: "speech" },
    "Phone": { icon: "📱", description: "Teléfono", type: "info" },
    "Ring": { icon: "📱", description: "Timbre", type: "info" },
    
    // Sonidos musicales
    "Music": { icon: "🎵", description: "Música", type: "info" },
    "Song": { icon: "🎵", description: "Canción", type: "info" },
    "Singing": { icon: "🎤", description: "Canto", type: "info" },
    
    // Sonidos de puertas y objetos
    "Door": { icon: "🚪", description: "Puerta", type: "info" },
    "Knock": { icon: "🚪", description: "Golpe", type: "info" },
    "Clock": { icon: "⏰", description: "Reloj", type: "info" },
    "Tick": { icon: "⏰", description: "Tic-tac", type: "info" },
    
    // Sonidos de movimiento
    "Footsteps": { icon: "👣", description: "Pasos", type: "info" },
    "Walking": { icon: "👣", description: "Caminar", type: "info" },
    "Running": { icon: "🏃", description: "Correr", type: "info" },
    
    // Sonidos de agua y clima
    "Water": { icon: "💧", description: "Agua", type: "info" },
    "Rain": { icon: "🌧️", description: "Lluvia", type: "info" },
    "Wind": { icon: "💨", description: "Viento", type: "info" },
    "Air": { icon: "💨", description: "Aire", type: "info" },
    
    // Sonidos de animales
    "Birds": { icon: "🐦", description: "Aves", type: "info" },
    "Bird": { icon: "🐦", description: "Ave", type: "info" },
    "Dog": { icon: "🐕", description: "Perro", type: "info" },
    "Bark": { icon: "🐕", description: "Ladrido", type: "info" },
    "Cat": { icon: "🐱", description: "Gato", type: "info" },
    "Meow": { icon: "🐱", description: "Maullido", type: "info" },
    
    // Sonidos ambientales
    "Noise": { icon: "🔊", description: "Ruido de Fondo", type: "info" },
    "Background": { icon: "🔊", description: "Ruido Ambiental", type: "info" },
    
    // Sonidos de herramientas y máquinas
    "Drill": { icon: "🔧", description: "Taladro", type: "info" },
    "Hammer": { icon: "🔨", description: "Martillo", type: "info" },
    "Saw": { icon: "🪚", description: "Sierra", type: "info" },
    
    // Sonidos de electrodomésticos
    "Microwave": { icon: "📟", description: "Microondas", type: "info" },
    "Refrigerator": { icon: "❄️", description: "Refrigerador", type: "info" },
    "Washing machine": { icon: "🧺", description: "Lavadora", type: "info" },
    
    // Sonidos de cocina
    "Cooking": { icon: "👨‍🍳", description: "Cocinar", type: "info" },
    "Frying": { icon: "🍳", description: "Freír", type: "info" },
    "Boiling": { icon: "♨️", description: "Hervir", type: "info" },
    
    // Sonidos de transporte público
    "Bus": { icon: "🚌", description: "Autobús", type: "info" },
    "Train": { icon: "🚆", description: "Tren", type: "info" },
    "Subway": { icon: "🚇", description: "Metro", type: "info" },
    
    // Sonidos de construcción
    "Construction": { icon: "🏗️", description: "Construcción", type: "info" },
    "Jackhammer": { icon: "🔨", description: "Martillo Neumático", type: "info" },
    
    // Sonidos de emergencia
    "Alarm": { icon: "🚨", description: "Alarma", type: "warning" },
    "Fire alarm": { icon: "🔥", description: "Alarma de Incendio", type: "warning" },
    "Smoke detector": { icon: "💨", description: "Detector de Humo", type: "warning" },
  };

  const createAgentMessage = (result) => {
    const { sound_type, confidence, transcription, is_conversation_detected, sound_detections, audio_id } = result;
    
    let messageText = "";
    let messageType = "info";

    // Helper function to extract text from transcription
    const extractTranscriptionText = (transcription) => {
      if (!transcription) return "";
      
      // If transcription is an array of objects (from Whisper)
      if (Array.isArray(transcription)) {
        return transcription.map(segment => segment.text).join(" ");
      }
      
      // If transcription is already a string
      if (typeof transcription === "string") {
        return transcription;
      }
      
      // If transcription is an object with text property
      if (transcription && typeof transcription === "object" && transcription.text) {
        return transcription.text;
      }
      
      return "";
    };

    const transcriptionText = extractTranscriptionText(transcription);

    if (is_conversation_detected && transcriptionText) {
      // Es una conversación con transcripción
      messageText = `## 🎤 Conversación Detectada\n\n> "${transcriptionText}"\n\n*Confianza: ${(confidence * 100).toFixed(1)}%*`;
      messageType = "conversation";
    } else if (sound_type === "Speech") {
      // Es habla pero sin transcripción
      messageText = `## 🗣️ Habla Detectada\n\nSe detectó conversación pero no se pudo transcribir completamente.\n\n*Confianza: ${(confidence * 100).toFixed(1)}%*`;
      messageType = "speech";
    } else if (sound_detections && sound_detections.length > 0) {
      // Mostrar múltiples sonidos detectados
      const primarySound = sound_detections[0];
      const primaryMapping = soundTypeMapping[primarySound[0]] || { 
        icon: "🔊", 
        description: primarySound[0], 
        type: "info" 
      };
      
      messageText = `## ${primaryMapping.icon} ${primaryMapping.description} Detectado\n\n`;
      
      // Agregar información sobre otros sonidos detectados
      if (sound_detections.length > 1) {
        messageText += "### Otros sonidos detectados:\n\n";
        for (let i = 1; i < sound_detections.length; i++) {
          const [soundName, soundConfidence] = sound_detections[i];
          const mapping = soundTypeMapping[soundName] || { 
            icon: "🔊", 
            description: soundName 
          };
          messageText += `- **${mapping.icon} ${mapping.description}**: ${(soundConfidence * 100).toFixed(1)}%\n`;
        }
        messageText += "\n";
      }
      
      messageText += `*Confianza principal: ${(confidence * 100).toFixed(1)}%*`;
      messageType = primaryMapping.type;
    } else {
      // Fallback para sonidos no mapeados
      const mapping = soundTypeMapping[sound_type] || { 
        icon: "🔊", 
        description: sound_type, 
        type: "info" 
      };
      
      messageText = `## ${mapping.icon} ${mapping.description} Detectado\n\nSe detectó **${sound_type.toLowerCase()}** en el entorno.\n\n*Confianza: ${(confidence * 100).toFixed(1)}%*`;
      messageType = mapping.type;
    }

    return {
      id: Date.now(),
      text: messageText,
      isBot: true,
      timestamp: new Date().toLocaleTimeString(),
      type: messageType,
      agentResult: result,
      audioId: audio_id
    };
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: inputMessage,
        isBot: false,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages([...messages, newMessage]);
      setInputMessage("");
      
      // Simular respuesta del bot (aquí puedes integrar con tu IA)
      setTimeout(() => {
        const botResponse = {
          id: messages.length + 2,
          text: "Gracias por tu mensaje. Como asistente de Signaware, estoy aquí para ayudarte con información sobre seguridad vial y asistencia auditiva. ¿Hay algo específico en lo que pueda ayudarte?",
          isBot: true,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: 1,
        text: "¡Hola! Soy tu asistente de Signaware. Estoy aquí para ayudarte con cualquier consulta sobre seguridad vial, tecnología de conducción o asistencia auditiva. ¿En qué puedo ayudarte hoy?",
        isBot: true,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    setInputMessage("");
  };

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getMessageStyle = (message) => {
    const baseStyle = `max-w-[85%] sm:max-w-3xl px-3 sm:px-4 py-2 sm:py-3 rounded-2xl`;
    
    if (!message.isBot) {
      return `${baseStyle} bg-blue-600 text-white`;
    }

    // Estilos específicos para mensajes del agente
    if (message.type === "conversation") {
      return `${baseStyle} ${darkMode ? 'bg-green-800 border border-green-600 text-green-100' : 'bg-green-100 border border-green-300 text-green-800'}`;
    } else if (message.type === "warning") {
      return `${baseStyle} ${darkMode ? 'bg-red-800 border border-red-600 text-red-100' : 'bg-red-100 border border-red-300 text-red-800'}`;
    } else if (message.type === "speech") {
      return `${baseStyle} ${darkMode ? 'bg-blue-800 border border-blue-600 text-blue-100' : 'bg-blue-100 border border-blue-300 text-blue-800'}`;
    } else {
      return `${baseStyle} ${darkMode ? 'bg-gray-700 border border-gray-600 text-gray-100' : 'bg-white border border-gray-200 text-gray-800'}`;
    }
  };

  // Estilos CSS para Markdown
  const markdownStyles = `
    .markdown-content {
      font-size: 0.875rem;
      line-height: 1.5;
      word-break: break-words;
    }
    
    .markdown-content h1, .markdown-content h2, .markdown-content h3, 
    .markdown-content h4, .markdown-content h5, .markdown-content h6 {
      font-weight: 600;
      margin: 0.5rem 0 0.25rem 0;
      line-height: 1.25;
    }
    
    .markdown-content h1 { font-size: 1.25rem; }
    .markdown-content h2 { font-size: 1.125rem; }
    .markdown-content h3 { font-size: 1rem; }
    
    .markdown-content p {
      margin: 0.25rem 0;
    }
    
    .markdown-content ul, .markdown-content ol {
      margin: 0.25rem 0;
      padding-left: 1.5rem;
    }
    
    .markdown-content li {
      margin: 0.125rem 0;
    }
    
    .markdown-content code {
      background-color: rgba(0, 0, 0, 0.1);
      padding: 0.125rem 0.25rem;
      border-radius: 0.25rem;
      font-family: 'Courier New', monospace;
      font-size: 0.875em;
    }
    
    .markdown-content pre {
      background-color: rgba(0, 0, 0, 0.1);
      padding: 0.5rem;
      border-radius: 0.375rem;
      overflow-x: auto;
      margin: 0.5rem 0;
    }
    
    .markdown-content pre code {
      background: none;
      padding: 0;
    }
    
    .markdown-content blockquote {
      border-left: 3px solid rgba(0, 0, 0, 0.2);
      margin: 0.5rem 0;
      padding-left: 0.75rem;
      font-style: italic;
    }
    
    .markdown-content a {
      color: inherit;
      text-decoration: underline;
      text-decoration-color: rgba(0, 0, 0, 0.3);
    }
    
    .markdown-content a:hover {
      text-decoration-color: rgba(0, 0, 0, 0.6);
    }
    
    .markdown-content strong {
      font-weight: 600;
    }
    
    .markdown-content em {
      font-style: italic;
    }
    
    /* Estilos para modo oscuro */
    .dark .markdown-content code {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .dark .markdown-content pre {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .dark .markdown-content blockquote {
      border-left-color: rgba(255, 255, 255, 0.3);
    }
    
    .dark .markdown-content a {
      text-decoration-color: rgba(255, 255, 255, 0.3);
    }
    
    .dark .markdown-content a:hover {
      text-decoration-color: rgba(255, 255, 255, 0.6);
    }
  `;

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
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
              onClick={handleNewChat}
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

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header con estado de audio */}
        <div className={`border-b px-3 sm:px-4 py-3 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              <button
                onClick={toggleSidebar}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
              </button>
              <h1 className={`text-lg sm:text-xl font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>Signaware</h1>
            </div>
            
            {/* Indicador de audio mejorado */}
            <div className={`flex items-center space-x-3 px-4 py-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} border ${darkMode ? 'border-gray-600' : 'border-blue-200'}`}>
              {/* Estado de grabación */}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isRecording
                      ? "bg-red-500 animate-pulse"
                      : isProcessing
                      ? "bg-yellow-500 animate-pulse"
                      : autoMode
                      ? "bg-green-500"
                      : "bg-gray-400"
                  }`}
                />
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  {audioDetectionStatus}
                </span>
              </div>
              
              {/* Separador */}
              <div className={`w-px h-4 ${darkMode ? 'bg-gray-600' : 'bg-blue-200'}`} />
              
              {/* Nivel de audio */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Volume2 className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span className={`text-sm font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {Math.round(volume)}
                  </span>
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>dB</span>
                </div>
                
                {/* Barra de nivel visual */}
                <div className={`w-16 h-2 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} overflow-hidden`}>
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      volume > 80 ? 'bg-red-500' : 
                      volume > 60 ? 'bg-yellow-500' : 
                      volume > 40 ? 'bg-orange-400' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((volume / 100) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Área de mensajes */}
        <div className={`flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 ${darkMode ? 'scrollbar-dark' : 'scrollbar-light'}`}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
            >
              <div className={getMessageStyle(message)}>
                <div className="flex items-start space-x-2 sm:space-x-3">
                  {message.isBot && (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-xs sm:text-sm">S</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="markdown-content">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.text}
                      </ReactMarkdown>
                    </div>
                    
                    {/* Reproductor de audio si está disponible */}
                    {message.audioId && (
                      <AudioPlayer 
                        audioId={message.audioId} 
                        soundType={message.agentResult?.sound_type || "Unknown"} 
                      />
                    )}
                    
                    <p
                      className={`text-xs mt-1 sm:mt-2 ${
                        message.isBot ? (darkMode ? "text-gray-300" : "text-gray-500") : "text-blue-200"
                      }`}
                    >
                      {message.timestamp}
                    </p>
                  </div>
                  {!message.isBot && (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-xs sm:text-sm">T</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input del chat */}
        <div className={`border-t p-3 sm:p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="max-w-4xl mx-auto">
            <div className={`flex items-end space-x-2 sm:space-x-3 border rounded-2xl p-2 sm:p-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all duration-200 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
              <div className="flex-1 min-w-0">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje..."
                  className={`w-full resize-none border-none outline-none bg-transparent placeholder-gray-500 text-sm leading-relaxed max-h-24 sm:max-h-32 ${darkMode ? 'text-white placeholder-gray-400' : 'text-gray-800'}`}
                  rows={1}
                  style={{ minHeight: '20px' }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className={`mt-2 text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Presiona Enter para enviar, Shift+Enter para nueva línea
            </div>
          </div>
        </div>
      </div>

      {/* Estilos CSS personalizados para scrollbar */}
      <style jsx>{`
        .scrollbar-light::-webkit-scrollbar {
          width: 8px;
        }
        
        .scrollbar-light::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-light::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
          transition: background 0.2s ease;
        }
        
        .scrollbar-light::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        
        .scrollbar-dark::-webkit-scrollbar {
          width: 8px;
        }
        
        .scrollbar-dark::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-dark::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 4px;
          transition: background 0.2s ease;
        }
        
        .scrollbar-dark::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
        
        /* Firefox scrollbar */
        .scrollbar-light {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db transparent;
        }
        
        .scrollbar-dark {
          scrollbar-width: thin;
          scrollbar-color: #4b5563 transparent;
        }
      `}</style>

      {/* Estilos CSS para Markdown */}
      <style jsx global>{markdownStyles}</style>
    </div>
  );
}
