import { useState, useRef, useEffect } from "react";
import { Send, PanelLeftClose, PanelLeft, Loader2, Ear, Brain, MessageSquare, Sparkles, Volume2, AlertTriangle, Users, Car, Music, Phone } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAudio } from "../context/AudioContext";
import { textGeneration } from "../services/api";
import Sidebar from "./Sidebar";
import AudioListener from "./AudioListener";
import AudioPlayer from "./AudioPlayer";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini");
  const messagesEndRef = useRef(null);

  const { lastAgentResult, isListeningEnabled } = useAudio();

  // Función para convertir intents a nombres amigables
  const getIntentDisplayName = (intent) => {
    const intentNames = {
      "HEARING_AIDS": "Audífonos",
      "MEDICAL_CENTER": "Centro Médico",
      "MEDICAL_NEWS": "Noticias Médicas",
      "GENERATE_IMAGE": "Generar Imagen",
      "SOUND_REPORT": "Reporte de Sonidos",
      "GENERAL_QUERY": "Consulta General",
      "SOUND_DETECTION": "Detección de Sonido"
    };
    return intentNames[intent] || intent;
  };

  // Función para traducir categorías de alerta al español
  const translateAlertCategory = (category) => {
    const categoryTranslations = {
      "danger_alert": "Alerta de Peligro",
      "attention_alert": "Alerta de Atención", 
      "social_alert": "Alerta Social",
      "environment_alert": "Alerta Ambiental",
      "warning_alert": "Alerta de Advertencia",
      "emergency_alert": "Alerta de Emergencia"
    };
    return categoryTranslations[category] || category;
  };

  // Efecto para mostrar resultados del agente en el chat
  useEffect(() => {
    if (lastAgentResult) {
      // Solo crear mensaje si no es unknown y tiene una categoría relevante
      const { sound_type } = lastAgentResult;

      if (
        sound_type &&
        sound_type !== "Unknown" &&
        sound_type !== "unknown" &&
        sound_type !== "Silence" &&
        sound_type !== "Quiet" &&
        sound_type !== "Error"
      ) {
        const agentMessage = createAgentMessage(lastAgentResult);
        setMessages((prev) => [...prev, agentMessage]);
      }
    }
  }, [lastAgentResult]);

  // Mapeo de tipos de sonido a iconos y descripciones
  const soundTypeMapping = {
    // Sonidos de vehículos
    Siren: { icon: "🚨", description: "Sirena de Emergencia", type: "warning", lucideIcon: AlertTriangle },
    Horn: { icon: "🚗", description: "Bocina de Vehículo", type: "warning", lucideIcon: Car },
    Vehicle: { icon: "🚙", description: "Sonido de Vehículo", type: "info", lucideIcon: Car },
    Car: { icon: "🚙", description: "Sonido de Vehículo", type: "info", lucideIcon: Car },
    Engine: { icon: "🚙", description: "Motor de Vehículo", type: "info", lucideIcon: Car },
    Truck: { icon: "🚛", description: "Camión", type: "info", lucideIcon: Car },
    Motorcycle: { icon: "🏍️", description: "Motocicleta", type: "info", lucideIcon: Car },

    // Sonidos de comunicación
    Speech: { icon: "🗣️", description: "Habla", type: "speech", lucideIcon: MessageSquare },
    Phone: { icon: "📱", description: "Teléfono", type: "info", lucideIcon: Phone },
    Ring: { icon: "📱", description: "Timbre", type: "info", lucideIcon: Phone },

    // Sonidos musicales
    Music: { icon: "🎵", description: "Música", type: "info", lucideIcon: Music },
    Song: { icon: "🎵", description: "Canción", type: "info", lucideIcon: Music },
    Singing: { icon: "🎤", description: "Canto", type: "info", lucideIcon: Music },

    // Sonidos de puertas y objetos
    Door: { icon: "🚪", description: "Puerta", type: "info", lucideIcon: Volume2 },
    Knock: { icon: "🚪", description: "Golpe", type: "info", lucideIcon: Volume2 },
    Clock: { icon: "⏰", description: "Reloj", type: "info", lucideIcon: Volume2 },
    Tick: { icon: "⏰", description: "Tic-tac", type: "info", lucideIcon: Volume2 },

    // Sonidos de movimiento
    Footsteps: { icon: "👣", description: "Pasos", type: "info", lucideIcon: Volume2 },
    Walking: { icon: "👣", description: "Caminar", type: "info", lucideIcon: Volume2 },
    Running: { icon: "🏃", description: "Correr", type: "info", lucideIcon: Volume2 },

    // Sonidos de agua y clima
    Water: { icon: "💧", description: "Agua", type: "info", lucideIcon: Volume2 },
    Rain: { icon: "🌧️", description: "Lluvia", type: "info", lucideIcon: Volume2 },
    Wind: { icon: "💨", description: "Viento", type: "info", lucideIcon: Volume2 },
    Air: { icon: "💨", description: "Aire", type: "info", lucideIcon: Volume2 },

    // Sonidos de animales
    Birds: { icon: "🐦", description: "Aves", type: "info", lucideIcon: Volume2 },
    Bird: { icon: "🐦", description: "Ave", type: "info", lucideIcon: Volume2 },
    Dog: { icon: "🐕", description: "Perro", type: "info", lucideIcon: Volume2 },
    Cat: { icon: "🐱", description: "Gato", type: "info", lucideIcon: Volume2 },

    // Sonidos de electrodomésticos
    Appliances: { icon: "🔌", description: "Electrodomésticos", type: "info", lucideIcon: Volume2 },
    Refrigerator: { icon: "❄️", description: "Refrigerador", type: "info", lucideIcon: Volume2 },
    Washing: { icon: "🧺", description: "Lavadora", type: "info", lucideIcon: Volume2 },

    // Sonidos de conversación
    Conversation: {
      icon: "💬",
      description: "Conversación",
      type: "conversation",
      lucideIcon: Users,
    },
    Talk: { icon: "💬", description: "Conversación", type: "conversation", lucideIcon: Users },
    Chat: { icon: "💬", description: "Conversación", type: "conversation", lucideIcon: Users },
    Discussion: { icon: "💬", description: "Discusión", type: "conversation", lucideIcon: Users },

    // Sonidos de alerta
    Alarm: { icon: "🚨", description: "Alarma", type: "warning", lucideIcon: AlertTriangle },
    Alert: { icon: "⚠️", description: "Alerta", type: "warning", lucideIcon: AlertTriangle },
    Warning: { icon: "⚠️", description: "Advertencia", type: "warning", lucideIcon: AlertTriangle },

    // Sonidos de tráfico
    Traffic: { icon: "🚦", description: "Tráfico", type: "warning", lucideIcon: Car },
    Brake: { icon: "🛑", description: "Freno", type: "warning", lucideIcon: Car },
    Accident: { icon: "🚨", description: "Accidente", type: "warning", lucideIcon: AlertTriangle },

    // Sonidos de construcción
    Construction: { icon: "🏗️", description: "Construcción", type: "info", lucideIcon: Volume2 },
    Drill: { icon: "🔨", description: "Taladro", type: "info", lucideIcon: Volume2 },
    Hammer: { icon: "🔨", description: "Martillo", type: "info", lucideIcon: Volume2 },

    // Sonidos de naturaleza
    Nature: { icon: "🌿", description: "Naturaleza", type: "info", lucideIcon: Volume2 },
    Forest: { icon: "🌲", description: "Bosque", type: "info", lucideIcon: Volume2 },
    Ocean: { icon: "🌊", description: "Océano", type: "info", lucideIcon: Volume2 },

    // Sonidos de silencio (ignorar)
    Silence: { icon: "🔇", description: "Silencio", type: "info", lucideIcon: Volume2 },
    Quiet: { icon: "🔇", description: "Silencio", type: "info", lucideIcon: Volume2 },
    Background: { icon: "🔇", description: "Fondo", type: "info", lucideIcon: Volume2 },
  };

  const createAgentMessage = (result) => {
    const {
      sound_type,
      sound_type_label,
      confidence,
      alert_category,
      transcription,
      is_conversation_detected,
      audio_id,
    } = result;

    const extractTranscriptionText = (transcription) => {
      if (!transcription) return "";

      if (typeof transcription === "string") {
        return transcription;
      }

      if (Array.isArray(transcription)) {
        return transcription
          .map((t) => {
            if (typeof t === "string") return t;
            if (typeof t === "object" && t.text) return t.text;
            return String(t);
          })
          .join(" ");
      }

      if (typeof transcription === "object") {
        if (transcription.text) return transcription.text;
        if (transcription.transcript) return transcription.transcript;
        if (transcription.content) return transcription.content;
        // Si es un objeto con start, end, text, extraer solo el texto
        if (
          transcription.start !== undefined &&
          transcription.end !== undefined &&
          transcription.text
        ) {
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
      type: "info",
      lucideIcon: Volume2,
    };

    let messageText = "";
    let messageType = soundInfo.type;

    // Usar el label en español si está disponible
    const displayName = sound_type_label || soundInfo.description;
    const confidencePercent = Math.round(confidence * 100);

    // Construir el mensaje según el tipo de sonido
    if (sound_type === "Conversation" || is_conversation_detected) {
      const transcriptText = extractTranscriptionText(transcription);
      const transcriptionDisplay = transcriptText.trim() ? transcriptText : "No se pudo transcribir";
      messageText = `🎙️ **Conversación Detectada**\n\n**Transcripción:** ${transcriptionDisplay}\n\n**Confianza:** ${confidencePercent}%`;
      messageType = "conversation";
    } else {
      messageText = `🔊 **${displayName}**\n\n**Tipo:** ${sound_type}\n**Confianza:** ${confidencePercent}%`;
      
      if (transcription) {
        const transcriptText = extractTranscriptionText(transcription);
        if (transcriptText.trim()) {
          messageText += `\n\n**Transcripción:** ${transcriptText}`;
        } else {
          messageText += `\n\n**Transcripción:** No se pudo transcribir`;
        }
      }
    }

    // Agregar información de alerta si está disponible
    if (alert_category) {
      messageText += `\n\n⚠️ **Tipo de Alerta:** ${translateAlertCategory(alert_category)}`;
      messageType = "warning";
    }

    // Agregar reproductor de audio si está disponible
    if (audio_id) {
      messageText += `\n\n🎵 **Audio disponible**`;
    }

    return {
      id: Date.now(),
      text: messageText,
      isBot: true,
      timestamp: new Date().toLocaleTimeString(),
      type: messageType,
      audioId: audio_id,
      agentResult: result,
      detectedIntent: "SOUND_DETECTION",
      soundInfo: soundInfo,
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

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    // Mensaje de carga
    const loadingMessage = {
      id: Date.now() + 1,
      text: "",
      isBot: true,
      timestamp: new Date().toLocaleTimeString(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const data = await textGeneration(inputMessage, selectedModel);

      // Intentar parsear la respuesta como JSON si es una imagen generada
      let responseText = data.response;
      let responseData = null;
      
      try {
        // Si la respuesta es un JSON string, parsearlo
        if (typeof data.response === 'string' && data.response.startsWith('{')) {
          responseData = JSON.parse(data.response);
          if (responseData.image_base64) {
            responseText = responseData;
          }
        }
      } catch {
        // Si no es JSON válido, usar como texto normal
        responseText = data.response;
      }

      const botMessage = {
        id: Date.now() + 2,
        text: responseText,
        isBot: true,
        timestamp: new Date().toLocaleTimeString(),
        detectedIntent: data.detected_intent || "GENERAL_QUERY",
      };

      setMessages((prev) =>
        prev.map((msg) => (msg.isLoading ? botMessage : msg))
      );
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      
      // Si el error es de sesión expirada, no mostrar mensaje de error
      if (error.message.includes('Sesión expirada')) {
        return;
      }

      const errorMessage = {
        id: Date.now() + 2,
        text: "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.",
        isBot: true,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) =>
        prev.map((msg) => (msg.isLoading ? errorMessage : msg))
      );
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
    const baseStyle = `max-w-[90%] sm:max-w-2xl px-4 py-3 rounded-2xl shadow-sm border`;

    if (!message.isBot) {
      return `${baseStyle} bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600`;
    }

    // Estilos específicos para mensajes del agente
    if (message.type === "conversation") {
      return `${baseStyle} ${
        darkMode
          ? "bg-gradient-to-r from-green-900/80 to-green-800/80 border-green-600/50 text-green-100"
          : "bg-gradient-to-r from-green-50 to-green-100 border-green-300 text-green-800"
      }`;
    } else if (message.type === "warning") {
      // Estilos especiales para alertas según la categoría
      const alertCategory = message.agentResult?.alert_category;
      if (alertCategory === "danger_alert") {
        return `${baseStyle} ${
          darkMode
            ? "bg-gradient-to-r from-red-900/80 to-red-800/80 border-red-600/50 text-red-100"
            : "bg-gradient-to-r from-red-50 to-red-100 border-red-300 text-red-800"
        }`;
      } else if (alertCategory === "attention_alert") {
        return `${baseStyle} ${
          darkMode
            ? "bg-gradient-to-r from-yellow-900/80 to-yellow-800/80 border-yellow-600/50 text-yellow-100"
            : "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300 text-yellow-800"
        }`;
      } else if (alertCategory === "social_alert") {
        return `${baseStyle} ${
          darkMode
            ? "bg-gradient-to-r from-green-900/80 to-green-800/80 border-green-600/50 text-green-100"
            : "bg-gradient-to-r from-green-50 to-green-100 border-green-300 text-green-800"
        }`;
      } else if (alertCategory === "environment_alert") {
        return `${baseStyle} ${
          darkMode
            ? "bg-gradient-to-r from-blue-900/80 to-blue-800/80 border-blue-600/50 text-blue-100"
            : "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300 text-blue-800"
        }`;
      } else {
        return `${baseStyle} ${
          darkMode
            ? "bg-gradient-to-r from-red-900/80 to-red-800/80 border-red-600/50 text-red-100"
            : "bg-gradient-to-r from-red-50 to-red-100 border-red-300 text-red-800"
        }`;
      }
    } else if (message.type === "speech") {
      return `${baseStyle} ${
        darkMode
          ? "bg-gradient-to-r from-blue-900/80 to-blue-800/80 border-blue-600/50 text-blue-100"
          : "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300 text-blue-800"
      }`;
    } else {
      return `${baseStyle} ${
        darkMode
          ? "bg-gradient-to-r from-gray-800/80 to-gray-700/80 border-gray-600/50 text-gray-100"
          : "bg-gradient-to-r from-white to-gray-50 border-gray-200 text-gray-800"
      }`;
    }
  };

  // Estilos CSS para Markdown
  const markdownStyles = `
    .markdown-content {
      font-size: 0.875rem;
      line-height: 1.6;
      word-break: break-words;
    }
    
    .markdown-content h1, .markdown-content h2, .markdown-content h3, 
    .markdown-content h4, .markdown-content h5, .markdown-content h6 {
      font-weight: 600;
      margin: 0.75rem 0 0.5rem 0;
      line-height: 1.25;
    }
    
    .markdown-content h1 { font-size: 1.25rem; }
    .markdown-content h2 { font-size: 1.125rem; }
    .markdown-content h3 { font-size: 1rem; }
    
    .markdown-content p {
      margin: 0.5rem 0;
    }
    
    .markdown-content ul, .markdown-content ol {
      margin: 0.5rem 0;
      padding-left: 1.5rem;
    }
    
    .markdown-content li {
      margin: 0.25rem 0;
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
      padding: 0.75rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin: 0.75rem 0;
    }
    
    .markdown-content pre code {
      background: none;
      padding: 0;
    }
    
    .markdown-content blockquote {
      border-left: 3px solid rgba(0, 0, 0, 0.2);
      margin: 0.75rem 0;
      padding-left: 1rem;
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
  `;

  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onNewChat={handleNewChat}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />

      {/* Chat principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div
          className={`border-b px-4 py-3 flex items-center justify-between h-16 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleSidebar}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                darkMode
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="w-5 h-5" />
              ) : (
                <PanelLeft className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Audio Listener y indicador de modo escucha */}
          <div className="flex items-center space-x-3">
            {isListeningEnabled && (
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-600/20 border border-emerald-500/30">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className={`text-xs font-medium ${
                  darkMode ? 'text-emerald-300' : 'text-emerald-700'
                }`}>
                  Escuchando
                </span>
              </div>
            )}
            <AudioListener />
          </div>
        </div>

        {/* Mensajes */}
        <div
          className={`flex-1 overflow-y-auto p-4 space-y-4 scrollbar-${
            darkMode ? "dark" : "light"
          }`}
        >
          {/* Contenedor centrado para las conversaciones */}
          <div className="max-w-4xl mx-auto space-y-4">
                      {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-300px)] space-y-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center">
                <Brain className="w-12 h-12 text-white" />
              </div>
              <div className="text-center space-y-4 max-w-lg">
                <h3
                  className={`text-2xl font-semibold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  ¡Bienvenido a Signaware!
                </h3>
                <p
                  className={`text-base leading-relaxed ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Soy tu agente que escucha por ti. Puedo detectar sonidos del entorno en tiempo real, buscar centros médicos cercanos, encontrar audífonos actualizados en el mercado, generar reportes de sonidos detectados y crear imágenes de audífonos médicos.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                <div
                  className={`px-4 py-3 rounded-lg text-sm ${
                    darkMode
                      ? "bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  } transition-colors`}
                >
                  🎧 Audífonos Phonak
                </div>
                <div
                  className={`px-4 py-3 rounded-lg text-sm ${
                    darkMode
                      ? "bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  } transition-colors`}
                >
                  🔊 Detección de Sonidos
                </div>
                <div
                  className={`px-4 py-3 rounded-lg text-sm ${
                    darkMode
                      ? "bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  } transition-colors`}
                >
                  🏥 Información Médica
                </div>
                <div
                  className={`px-4 py-3 rounded-lg text-sm ${
                    darkMode
                      ? "bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  } transition-colors`}
                >
                  📊 Reportes de Sonidos
                </div>
                <div
                  className={`px-4 py-3 rounded-lg text-sm ${
                    darkMode
                      ? "bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  } transition-colors`}
                >
                  🎨 Imágenes de Audífonos
                </div>
              </div>
            </div>
          )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.isBot ? "justify-start" : "justify-end"
                }`}
              >
                <div className={`flex items-end space-x-3`}>
                  {message.isBot && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0">
                      {message.soundInfo?.lucideIcon ? (
                        <message.soundInfo.lucideIcon className="w-4 h-4 text-white" />
                      ) : (
                        <Brain className="w-4 h-4 text-white" />
                      )}
                    </div>
                  )}
                  
                  <div className={`${getMessageStyle(message)}`}>
                    {message.isLoading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Procesando...</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* Contenido del mensaje */}
                        <div className="markdown-content">
                          {typeof message.text === "object" && message.text.image_base64 ? (
                            <div className="space-y-2">
                              <p>{message.text.description || "Imagen generada:"}</p>
                              <img
                                src={`data:image/png;base64,${message.text.image_base64}`}
                                alt="Imagen generada"
                                className="rounded-lg max-w-full"
                              />
                            </div>
                          ) : (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.text}
                            </ReactMarkdown>
                          )}
                        </div>

                        {/* Reproductor de audio si está disponible */}
                        {message.audioId && (
                          <div className="mt-3">
                            <AudioPlayer
                              audioId={message.audioId}
                              soundType={message.agentResult?.sound_type}
                            />
                          </div>
                        )}

                        {/* Información adicional */}
                        <div className="flex items-center justify-between pt-2 border-t border-current/10">
                          <p
                            className={`text-xs opacity-70`}
                          >
                            {message.timestamp}
                          </p>
                          
                          {/* Mostrar intent detectado si está disponible */}
                          {message.isBot && message.detectedIntent && (
                            <div className="flex items-center space-x-1">
                              <Sparkles className="w-3 h-3" />
                              <span className="text-xs opacity-70">
                                {getIntentDisplayName(message.detectedIntent)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {!message.isBot && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        T
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* Input del chat */}
        {!isListeningEnabled && (
          <div
            className={`border-t p-4 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="max-w-4xl mx-auto space-y-3 px-4">
              <div
                className={`flex items-end space-x-3 border-2 rounded-2xl p-3 transition-all duration-200 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
                    : "bg-white border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe tu mensaje o pregunta..."
                    className={`w-full resize-none border-none outline-none bg-transparent placeholder-gray-500 text-sm leading-relaxed max-h-32 ${
                      darkMode
                        ? "text-white placeholder-gray-400"
                        : "text-gray-800"
                    }`}
                    rows={1}
                    style={{ minHeight: "20px" }}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center flex-shrink-0 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              <div
                className={`text-xs text-center ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Presiona Enter para enviar, Shift+Enter para nueva línea
              </div>
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
      <style jsx global>
        {markdownStyles}
      </style>
    </div>
  );
}
