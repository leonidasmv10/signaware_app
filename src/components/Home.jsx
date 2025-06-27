import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Mic,
  Camera,
  Volume2,
  VolumeX,
  Settings,
  Type,
  Zap,
  Eye,
  MessageCircle,
  MicIcon,
  Square,
  Sun,
  Moon,
  Palette,
  Menu,
  X,
  Plus,
  Trash2,
  Save,
  Clock,
  Play,
} from "lucide-react";
import useAudioStream from "../hooks/useAudioStream";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import useVoiceDetection from "../hooks/useVoiceDetection";
import AudioVisualizer from "./AudioVisualizer";
import AudioTestPanel from "./AudioTestPanel";

const AccessibleChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "¡Hola! Soy tu asistente virtual accesible. Puedo ayudarte a través de texto, gestos, lenguaje de señas y transcripción ambiental. ¿En qué puedo ayudarte hoy?",
      isBot: true,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [fontSize, setFontSize] = useState("text-base");
  const [theme, setTheme] = useState("light"); // 'light', 'dark', 'high-contrast'
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [environmentalAudio, setEnvironmentalAudio] = useState(true);
  const [lastTranscription, setLastTranscription] = useState("");
  
  // Chat history states
  const [showSidebar, setShowSidebar] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatTitle, setChatTitle] = useState("Nueva conversación");
  const [showAudioTest, setShowAudioTest] = useState(false);
  const [autoVoiceDetection, setAutoVoiceDetection] = useState(true);
  const [isAutoTranscribing, setIsAutoTranscribing] = useState(false);

  const messagesEndRef = useRef(null);
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);

  // Restaurar triggerVibration aquí
  const triggerVibration = () => {
    if (vibrationEnabled && "vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  // Hook de detección de voz automática
  const voiceDetectionTimeout = useRef(null);
  const lastVoiceState = useRef(false);
  
  const {
    isListening: isVoiceDetectionActive,
    isVoiceActive,
    audioLevel: voiceDetectionLevel,
    startVoiceDetection,
    stopVoiceDetection,
  } = useVoiceDetection(
    // Callback cuando detecta voz
    () => {
      // Debounce: solo activar si no estaba activo y se mantiene 1s
      if (!lastVoiceState.current) {
        if (voiceDetectionTimeout.current) clearTimeout(voiceDetectionTimeout.current);
        voiceDetectionTimeout.current = setTimeout(() => {
          if (autoVoiceDetection && !isAutoTranscribing && isVoiceActive) {
            setIsAutoTranscribing(true);
            startRecognition();
            triggerVibration();
            addSystemMessage("🎤 Voz detectada automáticamente - Iniciando transcripción...");
            lastVoiceState.current = true;
          }
        }, 1000); // 1 segundo
      }
    },
    // Callback cuando termina la voz
    () => {
      // Debounce: solo desactivar si estaba activo y se mantiene 1s
      if (lastVoiceState.current) {
        if (voiceDetectionTimeout.current) clearTimeout(voiceDetectionTimeout.current);
        voiceDetectionTimeout.current = setTimeout(() => {
          if (isAutoTranscribing && !isVoiceActive) {
            setIsAutoTranscribing(false);
            stopRecognition();
            addSystemMessage("🔇 Voz terminada - Transcripción completada");
            lastVoiceState.current = false;
          }
        }, 1000); // 1 segundo
      }
    }
  );

  // Función para manejar transcripciones completas
  const handleTranscriptionComplete = useCallback(({ text, audioBlob, audioUrl, timestamp }) => {
    console.log('Transcription complete received:', { text, audioBlob, audioUrl, timestamp });
    console.log('Audio blob size:', audioBlob?.size);
    console.log('Audio URL:', audioUrl);
    
    const transcriptionMessage = {
      id: Date.now(),
      text: text,
      isBot: false,
      isTranscription: true,
      audioBlob,
      audioUrl,
      timestamp: timestamp,
    };

    setMessages(prev => [...prev, transcriptionMessage]);
    triggerVibration();

    // Actualizar chat history si existe
    if (currentChatId) {
      const updatedChat = {
        id: currentChatId,
        title: chatTitle,
        messages: [...messages, transcriptionMessage],
        updatedAt: new Date().toISOString(),
      };
      setChatHistory(prev => 
        prev.map(chat => 
          chat.id === currentChatId ? updatedChat : chat
        )
      );
    }

    // Simular respuesta del bot
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: `He recibido tu mensaje: "${text}". Estoy procesando tu solicitud y te responderé pronto. ¿Hay algo más específico en lo que pueda ayudarte?`,
        isBot: true,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, botResponse]);
      triggerVibration();
    }, 1000);
  }, [messages, currentChatId, chatTitle, triggerVibration]);

  const {
    transcript,
    isRecognizing,
    startRecognition,
    stopRecognition,
  } = useSpeechRecognition(handleTranscriptionComplete);

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
    
    const savedCurrentChat = localStorage.getItem('currentChatId');
    if (savedCurrentChat) {
      setCurrentChatId(savedCurrentChat);
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Save current chat ID to localStorage
  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem('currentChatId', currentChatId);
    }
  }, [currentChatId]);

  // Theme configurations
  const themes = {
    light: {
      bg: "bg-gradient-to-br from-slate-50 to-blue-50",
      cardBg: "bg-white/80 backdrop-blur-sm",
      headerBg: "bg-white/90 backdrop-blur-md border-slate-200/50",
      text: "text-slate-800",
      textSecondary: "text-slate-600",
      textMuted: "text-slate-500",
      border: "border-slate-200/60",
      inputBg: "bg-slate-50/80",
      inputBorder: "border-slate-300/60",
      botMessage: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white",
      userMessage: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white",
      systemMessage: "bg-gradient-to-r from-amber-400 to-orange-500 text-white",
      environmentalMessage:
        "bg-gradient-to-r from-cyan-400 to-blue-500 text-white",
      accent: "bg-gradient-to-r from-violet-500 to-purple-600",
      accentHover: "hover:from-violet-600 hover:to-purple-700",
      button: "bg-slate-100/80 hover:bg-slate-200/80 text-slate-700",
      buttonActive: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white",
      sidebarBg: "bg-white/95 backdrop-blur-md",
      sidebarBorder: "border-slate-200/60",
    },
    dark: {
      bg: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
      cardBg: "bg-slate-800/60 backdrop-blur-sm",
      headerBg: "bg-slate-900/90 backdrop-blur-md border-slate-700/50",
      text: "text-slate-100",
      textSecondary: "text-slate-300",
      textMuted: "text-slate-400",
      border: "border-slate-700/60",
      inputBg: "bg-slate-800/60",
      inputBorder: "border-slate-600/60",
      botMessage: "bg-gradient-to-r from-indigo-600 to-purple-700 text-white",
      userMessage: "bg-gradient-to-r from-emerald-600 to-teal-700 text-white",
      systemMessage: "bg-gradient-to-r from-amber-500 to-orange-600 text-white",
      environmentalMessage:
        "bg-gradient-to-r from-cyan-500 to-blue-600 text-white",
      accent: "bg-gradient-to-r from-violet-600 to-purple-700",
      accentHover: "hover:from-violet-700 hover:to-purple-800",
      button: "bg-slate-700/80 hover:bg-slate-600/80 text-slate-200",
      buttonActive: "bg-gradient-to-r from-emerald-600 to-teal-700 text-white",
      sidebarBg: "bg-slate-900/95 backdrop-blur-md",
      sidebarBorder: "border-slate-700/60",
    },
    "high-contrast": {
      bg: "bg-black",
      cardBg: "bg-gray-900",
      headerBg: "bg-black border-white",
      text: "text-white",
      textSecondary: "text-gray-100",
      textMuted: "text-gray-300",
      border: "border-white",
      inputBg: "bg-gray-900",
      inputBorder: "border-white",
      botMessage: "bg-white text-black border-2 border-white",
      userMessage: "bg-yellow-400 text-black border-2 border-yellow-400",
      systemMessage: "bg-blue-500 text-white border-2 border-blue-500",
      environmentalMessage: "bg-green-500 text-white border-2 border-green-500",
      accent: "bg-yellow-400 text-black",
      accentHover: "hover:bg-yellow-300",
      button: "bg-gray-800 hover:bg-gray-700 text-white border border-white",
      buttonActive: "bg-yellow-400 text-black border-2 border-yellow-400",
      sidebarBg: "bg-black",
      sidebarBorder: "border-white",
    },
  };

  const currentTheme = themes[theme];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize speech recognition and audio monitoring
  useEffect(() => {
    // Initialize Speech Recognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "es-ES";

      recognitionRef.current.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        if (event.results[event.results.length - 1].isFinal) {
          setLastTranscription(transcript);
          addEnvironmentalMessage(transcript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          addSystemMessage(
            "❌ Acceso al micrófono denegado. Por favor, permite el acceso para la transcripción."
          );
        }
      };

      recognitionRef.current.onend = () => {
        if (environmentalAudio && !isRecognizing) {
          setTimeout(() => {
            try {
              recognitionRef.current?.start();
            } catch (error) {
              console.log("Recognition restart error:", error);
            }
          }, 100);
        }
      };
    }

    initializeAudioMonitoring();

    return () => {
      stopRecognition();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (environmentalAudio && !isRecognizing) {
      startRecognition();
    } else if (!environmentalAudio && isRecognizing) {
      stopRecognition();
    }
  }, [environmentalAudio]);

  const initializeAudioMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current =
        audioContextRef.current.createMediaStreamSource(stream);

      microphoneRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateAudioLevel = () => {
        if (analyserRef.current && isRecognizing) {
          analyserRef.current.getByteFrequencyData(dataArray);
          requestAnimationFrame(updateAudioLevel);
        }
      };

      updateAudioLevel();
    } catch (error) {
      console.error("Error initializing audio monitoring:", error);
    }
  };

  const addEnvironmentalMessage = (transcript) => {
    if (transcript.trim().length > 3) {
      const environmentalMessage = {
        id: Date.now(),
        text: `🌍 Sonido detectado: "${transcript}"`,
        isBot: false,
        isEnvironmental: true,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, environmentalMessage]);
      triggerVibration();
    }
  };

  const addSystemMessage = (text) => {
    const systemMessage = {
      id: Date.now(),
      text: text,
      isBot: true,
      isSystem: true,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, systemMessage]);
  };

  // Chat history functions
  const createNewChat = () => {
    const newChatId = Date.now().toString();
    const newChat = {
      id: newChatId,
      title: "Nueva conversación",
      messages: [
        {
          id: 1,
          text: "¡Hola! Soy tu asistente virtual accesible. Puedo ayudarte a través de texto, gestos, lenguaje de señas y transcripción ambiental. ¿En qué puedo ayudarte hoy?",
          isBot: true,
          timestamp: new Date().toLocaleTimeString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setChatHistory(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    setMessages(newChat.messages);
    setChatTitle("Nueva conversación");
    setShowSidebar(false);
  };

  const loadChat = (chatId) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      setCurrentChatId(chatId);
      setChatTitle(chat.title);
      setShowSidebar(false);
    }
  };

  const saveCurrentChat = () => {
    if (!currentChatId) return;

    const updatedChat = {
      id: currentChatId,
      title: chatTitle,
      messages: messages,
      updatedAt: new Date().toISOString(),
    };

    setChatHistory(prev => 
      prev.map(chat => 
        chat.id === currentChatId ? updatedChat : chat
      )
    );
  };

  const deleteChat = (chatId) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      createNewChat();
    }
  };

  const sendMessage = (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: text,
      isBot: false,
      timestamp: new Date().toLocaleTimeString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText("");
    triggerVibration();

    // Create new chat if none exists
    if (!currentChatId) {
      const newChatId = Date.now().toString();
      const newChat = {
        id: newChatId,
        title: chatTitle,
        messages: updatedMessages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setChatHistory(prev => [newChat, ...prev]);
      setCurrentChatId(newChatId);
    } else {
      // Update existing chat
      const updatedChat = {
        id: currentChatId,
        title: chatTitle,
        messages: updatedMessages,
        updatedAt: new Date().toISOString(),
      };
      setChatHistory(prev => 
        prev.map(chat => 
          chat.id === currentChatId ? updatedChat : chat
        )
      );
    }

    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: "He recibido tu mensaje. Estoy procesando tu solicitud y te responderé pronto. ¿Hay algo más específico en lo que pueda ayudarte?",
        isBot: true,
        timestamp: new Date().toLocaleTimeString(),
      };
      const finalMessages = [...updatedMessages, botResponse];
      setMessages(finalMessages);
      triggerVibration();

      // Update chat with bot response
      if (currentChatId) {
        const finalChat = {
          id: currentChatId,
          title: chatTitle,
          messages: finalMessages,
          updatedAt: new Date().toISOString(),
        };
        setChatHistory(prev => 
          prev.map(chat => 
            chat.id === currentChatId ? finalChat : chat
          )
        );
      }
    }, 1000);
  };

  const handleSubmit = () => {
    sendMessage(inputText);
  };

  const quickResponses = [
    "¿Puedes ayudarme?",
    "Necesito información",
    "Tengo una pregunta",
    "Gracias por tu ayuda",
  ];

  const fontSizes = {
    "text-sm": "Pequeño",
    "text-base": "Normal",
    "text-lg": "Grande",
    "text-xl": "Muy grande",
  };

  const startVideoCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsVideoMode(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const stopVideoCapture = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
    setIsVideoMode(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Hoy";
    if (diffDays === 2) return "Ayer";
    if (diffDays <= 7) return `${diffDays - 1} días`;
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  // Función para reproducir audio de transcripción
  const playTranscriptionAudio = (audioUrl) => {
    console.log('Attempting to play audio:', audioUrl);
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onloadstart = () => console.log('Audio loading started');
      audio.oncanplay = () => console.log('Audio can play');
      audio.onplay = () => console.log('Audio playing');
      audio.onerror = (e) => console.error('Audio error:', e);
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  };

  // Iniciar detección de voz automática al montar el componente
  useEffect(() => {
    if (autoVoiceDetection) {
      startVoiceDetection();
    }
    
    return () => {
      stopVoiceDetection();
    };
  }, [autoVoiceDetection, startVoiceDetection, stopVoiceDetection]);

  const {
    audioLevel,
    isStreaming,
    isRecording,
    recordedAudio,
    audioUrl,
    recordingDuration,
    startStream,
    stopStream,
    startRecording,
    stopRecording,
    playRecordedAudio,
    downloadRecordedAudio,
    clearRecordedAudio,
  } = useAudioStream();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden ${currentTheme.sidebarBg} border-r ${currentTheme.sidebarBorder}`}>
        <div className="p-4 h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className={`font-bold text-lg ${currentTheme.text}`}>
              Historial de Chat
            </h2>
            <button
              onClick={() => setShowSidebar(false)}
              className={`p-2 rounded-lg ${currentTheme.button} transition-all`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={createNewChat}
            className={`flex items-center justify-center space-x-2 w-full p-3 rounded-xl ${currentTheme.accent} ${currentTheme.accentHover} text-white font-medium transition-all hover:scale-105 shadow-sm mb-6`}
          >
            <Plus className="w-5 h-5" />
            <span>Nueva conversación</span>
          </button>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.02] ${
                  currentChatId === chat.id
                    ? `${currentTheme.accent} text-white`
                    : `${currentTheme.button}`
                }`}
                onClick={() => loadChat(chat.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium truncate ${currentTheme.text}`}>
                      {chat.title}
                    </h3>
                    <p className={`text-xs ${currentTheme.textMuted} flex items-center space-x-1 mt-1`}>
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(chat.updatedAt)}</span>
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    className={`p-1 rounded hover:bg-red-500/20 transition-all ml-2`}
                    title="Eliminar chat"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Save Button */}
          {currentChatId && (
            <button
              onClick={saveCurrentChat}
              className={`flex items-center justify-center space-x-2 w-full p-3 rounded-xl ${currentTheme.button} font-medium transition-all hover:scale-105 shadow-sm mt-4`}
            >
              <Save className="w-5 h-5" />
              <span>Guardar chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${currentTheme.bg}`}>
        {/* Header */}
        <div
          className={`${currentTheme.headerBg} border-b ${currentTheme.border} px-6 py-4 shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Sidebar Toggle */}
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className={`p-3 rounded-xl ${currentTheme.button} transition-all hover:scale-105 shadow-sm`}
              >
                <Menu className="w-5 h-5" />
              </button>

              <div
                className={`w-12 h-12 ${currentTheme.accent} rounded-2xl flex items-center justify-center shadow-lg`}
              >
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1
                  className={`font-bold text-xl ${currentTheme.text} ${fontSize}`}
                >
                  {chatTitle}
                </h1>
                <p
                  className={`text-sm ${currentTheme.textMuted} flex items-center space-x-2`}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>En línea • Listo para ayudar</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Auto Voice Detection Indicator */}
              {autoVoiceDetection && (
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all ${
                  isVoiceActive 
                    ? 'bg-red-500/20 border-2 border-red-500' 
                    : isVoiceDetectionActive 
                    ? 'bg-green-500/20 border-2 border-green-500'
                    : 'bg-gray-500/20 border-2 border-gray-500'
                }`}>
                  <div className={`w-3 h-3 rounded-full animate-pulse ${
                    isVoiceActive ? 'bg-red-500' : isVoiceDetectionActive ? 'bg-green-500' : 'bg-gray-500'
                  }`}></div>
                  <span className={`text-xs font-medium ${
                    isVoiceActive ? 'text-red-400' : isVoiceDetectionActive ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {isVoiceActive ? 'Voz detectada' : isVoiceDetectionActive ? 'Escuchando' : 'Inactivo'}
                  </span>
                  {isVoiceDetectionActive && <AudioVisualizer audioLevel={voiceDetectionLevel} isActive={true} />}
                </div>
              )}

              {/* Audio Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={isStreaming ? stopStream : startStream}
                  className={`p-2 rounded-lg ${isStreaming ? 'bg-red-500 text-white' : currentTheme.button} transition-all shadow-sm`}
                  aria-label={isStreaming ? 'Detener micrófono' : 'Iniciar micrófono'}
                  title={isStreaming ? 'Detener micrófono' : 'Iniciar micrófono'}
                >
                  <MicIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={isRecognizing ? stopRecognition : startRecognition}
                  className={`p-2 rounded-lg ${isRecognizing ? 'bg-red-500 text-white' : currentTheme.button} transition-all shadow-sm`}
                  aria-label={isRecognizing ? 'Detener transcripción' : 'Iniciar transcripción'}
                  title={isRecognizing ? 'Detener transcripción' : 'Iniciar transcripción'}
                >
                  <Type className="w-5 h-5" />
                </button>
                {isStreaming && <AudioVisualizer audioLevel={audioLevel} isActive={isStreaming} />}
              </div>

              {/* Auto Voice Detection Toggle */}
              <button
                onClick={() => {
                  setAutoVoiceDetection(!autoVoiceDetection);
                  if (!autoVoiceDetection) {
                    startVoiceDetection();
                  } else {
                    stopVoiceDetection();
                  }
                }}
                className={`p-2 rounded-lg ${autoVoiceDetection ? 'bg-purple-500 text-white' : currentTheme.button} transition-all shadow-sm`}
                aria-label="Activar/desactivar detección automática de voz"
                title="Detección automática de voz"
              >
                <Mic className="w-5 h-5" />
              </button>

              {/* Audio Test Toggle */}
              <button
                onClick={() => setShowAudioTest(!showAudioTest)}
                className={`p-2 rounded-lg ${showAudioTest ? 'bg-purple-500 text-white' : currentTheme.button} transition-all shadow-sm`}
                aria-label="Mostrar/ocultar panel de test de audio"
                title="Test completo de audio"
              >
                <Volume2 className="w-5 h-5" />
              </button>

              {/* Theme selector */}
              <div className="flex items-center space-x-1 bg-white/10 rounded-xl p-1">
                <button
                  onClick={() => setTheme("light")}
                  className={`p-2 rounded-lg transition-all ${
                    theme === "light"
                      ? "bg-white/20 shadow-sm"
                      : "hover:bg-white/10"
                  }`}
                  title="Tema claro"
                >
                  <Sun className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`p-2 rounded-lg transition-all ${
                    theme === "dark"
                      ? "bg-white/20 shadow-sm"
                      : "hover:bg-white/10"
                  }`}
                  title="Tema oscuro"
                >
                  <Moon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTheme("high-contrast")}
                  className={`p-2 rounded-lg transition-all ${
                    theme === "high-contrast"
                      ? "bg-white/20 shadow-sm"
                      : "hover:bg-white/10"
                  }`}
                  title="Alto contraste"
                >
                  <Palette className="w-4 h-4" />
                </button>
              </div>

              {/* Environmental audio indicator */}
              {isRecognizing && (
                <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-2 rounded-xl">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      audioLevel > 50
                        ? "bg-red-500"
                        : audioLevel > 20
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    } animate-pulse`}
                  ></div>
                  <span className="text-xs text-green-400 font-medium">
                    Escuchando
                  </span>
                </div>
              )}

              {/* Vibration indicator */}
              {vibrationEnabled && (
                <div className="flex items-center space-x-1 bg-yellow-500/20 px-3 py-2 rounded-xl">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-yellow-400 font-medium">
                    Vibración
                  </span>
                </div>
              )}

              {/* Settings button */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-3 rounded-xl ${currentTheme.button} transition-all hover:scale-105 shadow-sm`}
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Audio Test Panel */}
        {showAudioTest && (
          <div className="p-6">
            <AudioTestPanel
              isRecording={isRecording}
              recordedAudio={recordedAudio}
              audioUrl={audioUrl}
              recordingDuration={recordingDuration}
              audioLevel={audioLevel}
              isStreaming={isStreaming}
              startRecording={startRecording}
              stopRecording={stopRecording}
              playRecordedAudio={playRecordedAudio}
              downloadRecordedAudio={downloadRecordedAudio}
              clearRecordedAudio={clearRecordedAudio}
              currentTheme={currentTheme}
            />
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div
            className={`${currentTheme.cardBg} border-b ${currentTheme.border} p-6 shadow-inner`}
          >
            <h3 className={`font-bold text-lg mb-4 ${currentTheme.text}`}>
              ⚙️ Configuración de Accesibilidad
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Environmental Audio */}
              <div className="col-span-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <label className={`font-semibold ${currentTheme.text}`}>
                    🎤 Escucha ambiental:
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setEnvironmentalAudio(!environmentalAudio)}
                      className={`relative inline-flex items-center h-7 rounded-full w-12 transition-all duration-300 ${
                        environmentalAudio ? "bg-green-500" : "bg-gray-400"
                      }`}
                    >
                      <span
                        className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300 shadow-lg ${
                          environmentalAudio ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                    {isRecognizing && (
                      <div className="flex items-center space-x-2">
                        <MicIcon className="w-5 h-5 text-green-500" />
                        <AudioVisualizer audioLevel={audioLevel} isActive={isRecognizing} />
                      </div>
                    )}
                  </div>
                </div>
                <p className={`text-sm ${currentTheme.textMuted}`}>
                  Transcribe automáticamente los sonidos del entorno en tiempo
                  real
                </p>
              </div>

              {/* Font Size */}
              <div>
                <label className={`block font-medium mb-2 ${currentTheme.text}`}>
                  📝 Tamaño de texto:
                </label>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className={`w-full p-3 border rounded-xl ${currentTheme.inputBg} ${currentTheme.inputBorder} ${currentTheme.text} transition-all`}
                >
                  {Object.entries(fontSizes).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vibration */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="vibration"
                  checked={vibrationEnabled}
                  onChange={(e) => setVibrationEnabled(e.target.checked)}
                  className="w-5 h-5 rounded accent-purple-500"
                />
                <label
                  htmlFor="vibration"
                  className={`font-medium ${currentTheme.text}`}
                >
                  ⚡ Vibración
                </label>
              </div>

              {/* Sound */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="sound"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-5 h-5 rounded accent-purple-500"
                />
                <label
                  htmlFor="sound"
                  className={`font-medium ${currentTheme.text}`}
                >
                  🔊 Sonido
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Video Mode for Sign Language */}
        {isVideoMode && (
          <div
            className={`${currentTheme.cardBg} p-6 border-b ${currentTheme.border}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold text-lg ${currentTheme.text}`}>
                🤟 Modo Lenguaje de Señas
              </h3>
              <button
                onClick={stopVideoCapture}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all shadow-sm"
              >
                Detener
              </button>
            </div>
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full max-w-md mx-auto rounded-2xl border-4 border-purple-500/30 shadow-lg"
            />
            <p className={`text-sm text-center mt-3 ${currentTheme.textMuted}`}>
              Realiza gestos o lenguaje de señas frente a la cámara
            </p>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.isBot ? "justify-start" : "justify-end"
              } mb-4`}
            >
              <div
                className={`max-w-sm lg:max-w-md px-5 py-3 rounded-2xl shadow-lg backdrop-blur-sm ${
                  message.isBot
                    ? message.isSystem
                      ? currentTheme.systemMessage
                      : currentTheme.botMessage
                    : message.isEnvironmental
                    ? currentTheme.environmentalMessage
                    : message.isTranscription
                    ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white"
                    : currentTheme.userMessage
                } ${fontSize} transform hover:scale-[1.02] transition-all duration-200`}
              >
                <div className="space-y-3">
                  {/* Texto del mensaje */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="leading-relaxed font-medium">
                        {message.isTranscription && "🎤 "}
                        {message.text}
                      </p>
                      <p className="text-xs mt-2 opacity-80">{message.timestamp}</p>
                    </div>
                  </div>
                  
                  {/* Reproductor de audio para transcripciones */}
                  {message.isTranscription && message.audioUrl && (
                    <div className="mt-3 p-3 bg-white/10 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Audio original:</span>
                        <button
                          onClick={() => playTranscriptionAudio(message.audioUrl)}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
                          title="Reproducir audio"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      </div>
                      <audio 
                        controls 
                        className="w-full h-8"
                        src={message.audioUrl}
                        preload="metadata"
                      >
                        Tu navegador no soporta el elemento de audio.
                      </audio>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Mostrar transcripción en progreso */}
          {transcript && (
            <div className="flex justify-start mb-4">
              <div
                className={`max-w-sm lg:max-w-md px-5 py-3 rounded-2xl shadow-lg backdrop-blur-sm bg-gradient-to-r from-yellow-400 to-orange-500 text-white ${fontSize} transform hover:scale-[1.02] transition-all duration-200`}
              >
                <p className="leading-relaxed font-medium">
                  🎤 <strong>Transcribiendo:</strong> {transcript}
                </p>
                <p className="text-xs mt-2 opacity-80">{new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Environmental listening controls */}
        <div
          className={`${currentTheme.cardBg} border-t ${currentTheme.border} p-4`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setEnvironmentalAudio(!environmentalAudio)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl ${
                  environmentalAudio
                    ? currentTheme.buttonActive
                    : currentTheme.button
                } transition-all hover:scale-105 shadow-sm font-medium`}
              >
                {environmentalAudio ? (
                  <Square className="w-5 h-5" />
                ) : (
                  <MicIcon className="w-5 h-5" />
                )}
                <span>
                  {environmentalAudio ? "Detener escucha" : "Iniciar escucha"}
                </span>
              </button>

              {isRecognizing && (
                <div className="flex items-center space-x-3 bg-green-500/20 px-4 py-2 rounded-xl">
                  <div className="flex items-center space-x-1">
                    <div
                      className={`w-2 h-6 rounded-full ${
                        audioLevel > 60
                          ? "bg-red-500"
                          : audioLevel > 30
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      } transition-all`}
                    ></div>
                    <div
                      className={`w-2 h-8 rounded-full ${
                        audioLevel > 40
                          ? "bg-red-500"
                          : audioLevel > 20
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      } transition-all`}
                    ></div>
                    <div
                      className={`w-2 h-10 rounded-full ${
                        audioLevel > 20
                          ? "bg-red-500"
                          : audioLevel > 10
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      } transition-all`}
                    ></div>
                  </div>
                  <span
                    className={`text-sm font-medium ${currentTheme.textMuted}`}
                  >
                    Nivel: {Math.round(audioLevel)}
                  </span>
                </div>
              )}
            </div>

            {lastTranscription && (
              <div
                className={`text-sm ${currentTheme.textMuted} max-w-xs truncate bg-white/10 px-3 py-2 rounded-lg`}
              >
                Último: "{lastTranscription}"
              </div>
            )}
          </div>
        </div>

        {/* Quick Response Buttons */}
        <div
          className={`${currentTheme.cardBg} border-t ${currentTheme.border} p-4`}
        >
          <p className={`font-medium mb-3 ${currentTheme.text}`}>
            💬 Respuestas rápidas:
          </p>
          <div className="flex flex-wrap gap-2">
            {quickResponses.map((response, index) => (
              <button
                key={index}
                onClick={() => sendMessage(response)}
                className={`px-4 py-2 rounded-xl text-sm ${currentTheme.button} transition-all hover:scale-105 shadow-sm font-medium`}
              >
                {response}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div
          className={`${currentTheme.cardBg} border-t ${currentTheme.border} p-6`}
        >
          <div className="flex items-center space-x-4">
            {/* Camera button */}
            <button
              onClick={isVideoMode ? stopVideoCapture : startVideoCapture}
              className={`p-3 rounded-xl ${
                isVideoMode
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : currentTheme.button
              } transition-all hover:scale-105 shadow-sm`}
              title="Activar/desactivar cámara para lenguaje de señas"
            >
              <Camera className="w-6 h-6" />
            </button>

            {/* Text input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Escribe tu mensaje aquí..."
                className={`w-full px-6 py-4 rounded-2xl border-2 ${currentTheme.inputBg} ${currentTheme.inputBorder} ${currentTheme.text} focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 ${fontSize} transition-all shadow-sm`}
              />
            </div>

            {/* Send button */}
            <button
              onClick={handleSubmit}
              disabled={!inputText.trim()}
              className={`p-4 rounded-2xl ${
                inputText.trim()
                  ? `${currentTheme.accent} ${currentTheme.accentHover} text-white shadow-lg hover:scale-105`
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              } transition-all`}
              title="Enviar mensaje"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>

          {/* Accessibility features info */}
          <div className="flex items-center justify-center mt-4 space-x-6 text-sm">
            <span
              className={`flex items-center space-x-2 ${currentTheme.textMuted}`}
            >
              <Eye className="w-4 h-4" />
              <span>Visual</span>
            </span>
            <span
              className={`flex items-center space-x-2 ${currentTheme.textMuted}`}
            >
              <Type className="w-4 h-4" />
              <span>Texto</span>
            </span>
            <span
              className={`flex items-center space-x-2 ${currentTheme.textMuted}`}
            >
              <MicIcon className="w-4 h-4" />
              <span>Audio</span>
            </span>
            <span
              className={`flex items-center space-x-2 ${currentTheme.textMuted}`}
            >
              <Zap className="w-4 h-4" />
              <span>Vibración</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibleChatbot;
