import { useState, useRef, useEffect } from "react";
import { Send, PanelLeftClose, PanelLeft, Loader2, Ear } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAudio } from "../context/AudioContext";
import { textGeneration } from "../services/api";
import Sidebar from "./Sidebar";
import AudioListener from "./AudioListener";
import AudioPlayer from "./AudioPlayer";

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "¡Hola! Soy tu asistente de Signaware. ¿En qué puedo ayudarte hoy?",
      isBot: true,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedModel, setSelectedModel] = useState("gemini");
  const messagesEndRef = useRef(null);

  const {
    lastAgentResult,
    isListeningEnabled,
  } = useAudio();

  // Efecto para mostrar resultados del agente en el chat
  useEffect(() => {
    if (lastAgentResult) {
      // Solo crear mensaje si no es unknown y tiene una categoría relevante
      const { sound_type } = lastAgentResult;
      
      if (sound_type && 
          sound_type !== "Unknown" && 
          sound_type !== "unknown" && 
          sound_type !== "Silence" && 
          sound_type !== "Quiet" &&
          sound_type !== "Error") {
        
        const agentMessage = createAgentMessage(lastAgentResult);
        setMessages(prev => [...prev, agentMessage]);
      }
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
    "Cat": { icon: "🐱", description: "Gato", type: "info" },
    
    // Sonidos de electrodomésticos
    "Appliances": { icon: "🔌", description: "Electrodomésticos", type: "info" },
    "Refrigerator": { icon: "❄️", description: "Refrigerador", type: "info" },
    "Washing": { icon: "🧺", description: "Lavadora", type: "info" },
    
    // Sonidos de conversación
    "Conversation": { icon: "💬", description: "Conversación", type: "conversation" },
    "Talk": { icon: "💬", description: "Conversación", type: "conversation" },
    "Chat": { icon: "💬", description: "Conversación", type: "conversation" },
    "Discussion": { icon: "💬", description: "Discusión", type: "conversation" },
    
    // Sonidos de alerta
    "Alarm": { icon: "🚨", description: "Alarma", type: "warning" },
    "Alert": { icon: "⚠️", description: "Alerta", type: "warning" },
    "Warning": { icon: "⚠️", description: "Advertencia", type: "warning" },
    
    // Sonidos de tráfico
    "Traffic": { icon: "🚦", description: "Tráfico", type: "warning" },
    "Brake": { icon: "🛑", description: "Freno", type: "warning" },
    "Accident": { icon: "🚨", description: "Accidente", type: "warning" },
    
    // Sonidos de construcción
    "Construction": { icon: "🏗️", description: "Construcción", type: "info" },
    "Drill": { icon: "🔨", description: "Taladro", type: "info" },
    "Hammer": { icon: "🔨", description: "Martillo", type: "info" },
    
    // Sonidos de naturaleza
    "Nature": { icon: "🌿", description: "Naturaleza", type: "info" },
    "Forest": { icon: "🌲", description: "Bosque", type: "info" },
    "Ocean": { icon: "🌊", description: "Océano", type: "info" },
    
    // Sonidos de silencio (ignorar)
    "Silence": { icon: "🔇", description: "Silencio", type: "info" },
    "Quiet": { icon: "🔇", description: "Silencio", type: "info" },
    "Background": { icon: "🔇", description: "Fondo", type: "info" },
  };

  const createAgentMessage = (result) => {
    const { sound_type, confidence, alert_category, transcription, is_conversation_detected, audio_id } = result;
    
    const extractTranscriptionText = (transcription) => {
      if (!transcription) return "";
      
      if (typeof transcription === 'string') {
        return transcription;
      }
      
      if (Array.isArray(transcription)) {
        return transcription.map(t => {
          if (typeof t === 'string') return t;
          if (typeof t === 'object' && t.text) return t.text;
          return String(t);
        }).join(' ');
      }
      
      if (typeof transcription === 'object') {
        if (transcription.text) return transcription.text;
        if (transcription.transcript) return transcription.transcript;
        if (transcription.content) return transcription.content;
        // Si es un objeto con start, end, text, extraer solo el texto
        if (transcription.start !== undefined && transcription.end !== undefined && transcription.text) {
          return transcription.text;
        }
        // Como último recurso, convertir a string
        try {
          return JSON.stringify(transcription);
        } catch {
          return String(transcription);
        }
      }
      
      return String(transcription);
    };

    const soundInfo = soundTypeMapping[sound_type] || {
      icon: "🔊",
      description: sound_type || "Sonido desconocido",
      type: "info"
    };

    let messageText = "";
    let messageType = soundInfo.type;

    if (is_conversation_detected) {
      const transcriptText = extractTranscriptionText(transcription);
      messageText = `🎯 **Conversación detectada**\n\n${soundInfo.icon} **Tipo de sonido:** ${soundInfo.description}\n📊 **Confianza:** ${Math.round(confidence * 100)}%\n\n💬 **Transcripción:**\n${transcriptText || "No se pudo transcribir el audio"}`;
      messageType = "conversation";
    } else if (sound_type === "Speech" || sound_type === "Conversation" || sound_type === "Talk") {
      const transcriptText = extractTranscriptionText(transcription);
      messageText = `🗣️ **Habla detectada**\n\n${soundInfo.icon} **Tipo:** ${soundInfo.description}\n📊 **Confianza:** ${Math.round(confidence * 100)}%\n\n💬 **Transcripción:**\n${transcriptText || "No se pudo transcribir el audio"}`;
      messageType = "speech";
    } else if (alert_category && alert_category !== 'unknown') {
      // Mostrar mensaje según la categoría de alerta
      const alertEmojis = {
        'danger_alert': '🔴',
        'attention_alert': '🟡',
        'social_alert': '🟢',
        'environment_alert': '🔵'
      };
      
      const alertTitles = {
        'danger_alert': '¡ALERTA DE PELIGRO!',
        'attention_alert': '¡ATENCIÓN REQUERIDA!',
        'social_alert': 'ACTIVIDAD SOCIAL DETECTADA',
        'environment_alert': 'CAMBIO EN EL ENTORNO'
      };
      
      const emoji = alertEmojis[alert_category] || '⚠️';
      const title = alertTitles[alert_category] || 'SONIDO RELEVANTE';
      
      // Agregar transcripción si está disponible
      const transcriptText = extractTranscriptionText(transcription);
      const transcriptionSection = transcriptText ? `\n\n💬 **Transcripción:**\n${transcriptText}` : '';
      
      messageText = `${emoji} **${title}**\n\n${soundInfo.icon} **Sonido:** ${soundInfo.description}\n📊 **Confianza:** ${Math.round(confidence * 100)}%\n\n🚨 **Recomendación:** Mantén la atención y verifica tu entorno.${transcriptionSection}`;
      messageType = "warning";
    } else if (soundInfo.type === "warning") {
      messageText = `⚠️ **¡Alerta de seguridad!**\n\n${soundInfo.icon} **Sonido detectado:** ${soundInfo.description}\n📊 **Confianza:** ${Math.round(confidence * 100)}%\n\n🚨 **Recomendación:** Mantén la atención y verifica tu entorno.`;
      messageType = "warning";
    } else {
      messageText = `🔊 **Sonido detectado**\n\n${soundInfo.icon} **Tipo:** ${soundInfo.description}\n📊 **Confianza:** ${Math.round(confidence * 100)}%`;
    }

    return {
      id: Date.now(),
      text: messageText,
      isBot: true,
      timestamp: new Date().toLocaleTimeString(),
      type: messageType,
      audioId: audio_id,
      agentResult: result
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");

    // Mensaje de carga
    const loadingMessage = {
      id: Date.now() + 1,
      text: "",
      isBot: true,
      timestamp: new Date().toLocaleTimeString(),
      isLoading: true,
    };

    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await textGeneration(inputMessage, selectedModel);
      
      const botMessage = {
        id: Date.now() + 2,
        text: response,
        isBot: true,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages(prev => prev.map(msg => 
        msg.isLoading ? botMessage : msg
      ));
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      
      const errorMessage = {
        id: Date.now() + 2,
        text: "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.",
        isBot: true,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages(prev => prev.map(msg => 
        msg.isLoading ? errorMessage : msg
      ));
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
        id: Date.now(),
        text: "¡Hola! Soy tu asistente de Signaware. ¿En qué puedo ayudarte hoy?",
        isBot: true,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
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
      // Estilos especiales para alertas según la categoría
      const alertCategory = message.agentResult?.alert_category;
      if (alertCategory === 'danger_alert') {
        return `${baseStyle} ${darkMode ? 'bg-red-900 border border-red-700 text-red-100' : 'bg-red-50 border border-red-300 text-red-800'}`;
      } else if (alertCategory === 'attention_alert') {
        return `${baseStyle} ${darkMode ? 'bg-yellow-900 border border-yellow-700 text-yellow-100' : 'bg-yellow-50 border border-yellow-300 text-yellow-800'}`;
      } else if (alertCategory === 'social_alert') {
        return `${baseStyle} ${darkMode ? 'bg-green-900 border border-green-700 text-green-100' : 'bg-green-50 border border-green-300 text-green-800'}`;
      } else if (alertCategory === 'environment_alert') {
        return `${baseStyle} ${darkMode ? 'bg-blue-900 border border-blue-700 text-blue-100' : 'bg-blue-50 border border-blue-300 text-blue-800'}`;
      } else {
        return `${baseStyle} ${darkMode ? 'bg-red-800 border border-red-600 text-red-100' : 'bg-red-100 border border-red-300 text-red-800'}`;
      }
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
      {/* Componente de alertas de sonidos */}
      
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onNewChat={handleNewChat}
      />

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
            
            {/* Componente AudioListener */}
            <AudioListener />
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
                      {message.isLoading ? (
                        <span className="flex items-center gap-2 text-blue-500 animate-pulse">
                          <Loader2 className="w-4 h-4 animate-spin" /> Generando respuesta...
                        </span>
                      ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.text}
                        </ReactMarkdown>
                      )}
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
        {!isListeningEnabled && (
          <div className={`border-t p-3 sm:p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="max-w-4xl mx-auto">
              {/* Selector de modelo IA */}
              <div className="mb-2 flex items-center gap-2">
                <label htmlFor="model-select" className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Modelo IA:</label>
                <select
                  id="model-select"
                  value={selectedModel}
                  onChange={e => setSelectedModel(e.target.value)}
                  className={`rounded-lg px-2 py-1 text-xs border ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
                >
                  <option value="gemini">Gemini</option>
                  <option value="openai">OpenAI</option>
                  <option value="leonidasmv">leonidasmv</option>
                </select>
              </div>
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
              <div className={`mt-2 text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Presiona Enter para enviar, Shift+Enter para nueva línea</div>
            </div>
          </div>
        )}

        {/* Modo escucha activo - Mensaje informativo */}
        {isListeningEnabled && (
          <div className={`border-t p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="max-w-4xl mx-auto text-center">
              <div className={`inline-flex items-center space-x-3 px-4 py-3 rounded-xl ${darkMode ? 'bg-blue-900/20 border border-blue-700/30' : 'bg-blue-50 border border-blue-200'}`}>
                <Ear className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    Modo Escucha Activo
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    El sistema está monitoreando sonidos del entorno
                  </p>
                </div>
              </div>
              <p className={`mt-3 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Desactiva el modo escucha para usar el chat con IA
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Estilos CSS personalizados para scrollbar y animaciones */}
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
