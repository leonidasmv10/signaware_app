import { createContext, useContext, useState, useRef, useEffect } from "react";
import RecordRTC from "recordrtc";

const AudioContext = createContext();

const UMBRAL = 60;
const DURACION_GRABACION = 3000;
const API_URL = import.meta.env.VITE_API_URL;

export function AudioProvider({ children }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const [volume, setVolume] = useState(0);
  const [detectionStatus, setDetectionStatus] = useState("Solicitando acceso al micrófono");
  const [isDetecting, setIsDetecting] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastAgentResult, setLastAgentResult] = useState(null);
  const [isListeningEnabled, setIsListeningEnabled] = useState(true);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);
  const animationIdRef = useRef(null);
  const checkVolumeIntervalRef = useRef(null);
  const recorderRef = useRef(null);
  const isRecordingRef = useRef(false); // Bandera para evitar grabaciones múltiples

  const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      streamRef.current = stream;
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);

      updateSoundIntensity();
      setIsInitialized(true);
      setDetectionStatus(isListeningEnabled ? "Monitoreando sonidos" : "Modo escucha desactivado");
      if (isListeningEnabled) {
        startAutoDetection();
      }
    } catch (err) {
      console.error("Error al inicializar el audio:", err);
      setDetectionStatus("Error: Permiso de micrófono denegado");
    }
  };

  useEffect(() => {
    initializeAudio();
    return () => {
      stopAllProcesses();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const updateSoundIntensity = () => {
    if (!analyserRef.current || !dataArrayRef.current) {
      animationIdRef.current = requestAnimationFrame(updateSoundIntensity);
      return;
    }

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const avgVolume = dataArrayRef.current.reduce((sum, val) => sum + val, 0) / dataArrayRef.current.length;
    setVolume(avgVolume);
    animationIdRef.current = requestAnimationFrame(updateSoundIntensity);
  };

  const checkVolumeAndRecord = () => {
    if (!analyserRef.current || !isDetecting || !autoMode || isRecordingRef.current || !isListeningEnabled) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    const avgVolume = Array.from(dataArray).reduce((sum, val) => sum + val, 0) / dataArray.length;
    setVolume(avgVolume);

    if (avgVolume > UMBRAL && !isRecording && !isProcessing) {
      startRecording();
    }
  };

  const startRecording = async () => {
    if (isRecording || isProcessing || !streamRef.current || !isDetecting || isRecordingRef.current || !isListeningEnabled) return;

    try {
      isRecordingRef.current = true; // Marcar como grabando
      setIsDetecting(false);
      setIsRecording(true);
      setDetectionStatus("Grabando audio");

      console.log("Iniciando grabación de audio...");
      console.log("Stream activo:", streamRef.current.active);
      console.log("Tracks:", streamRef.current.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled })));

      const recorder = new RecordRTC(streamRef.current, {
        type: "audio",
        mimeType: "audio/wav",
        recorderType: RecordRTC.StereoAudioRecorder,
        desiredSampRate: 16000,
        numberOfAudioChannels: 1, // Mono para mejor compatibilidad
        timeSlice: 1000, // Grabar en chunks de 1 segundo
        ondataavailable: (blob) => {
          console.log("Chunk de audio recibido:", blob.size, "bytes");
        }
      });

      recorder.startRecording();
      recorderRef.current = recorder;

      console.log("Grabación iniciada, esperando", DURACION_GRABACION, "ms...");

      setTimeout(() => {
        console.log("Deteniendo grabación...");
        recorder.stopRecording(async () => {
          console.log("Grabación detenida, procesando...");
          await processAudioData();
        });
      }, DURACION_GRABACION);
    } catch (error) {
      console.error("Error al iniciar grabación:", error);
      isRecordingRef.current = false; // Resetear bandera en caso de error
      setIsRecording(false);
      setIsDetecting(true);
    }
  };

  const processAudioData = async () => {
    setIsRecording(false);
    setIsProcessing(true);
    setDetectionStatus("Procesando audio con IA");

    try {
      const blob = recorderRef.current?.getBlob();

      if (!blob) {
        console.error("No hay blob de audio disponible.");
        setDetectionStatus("Error: No se pudo obtener el audio grabado");
        return;
      }

      console.log("Blob de audio obtenido:");
      console.log("- Tamaño:", blob.size, "bytes");
      console.log("- Tipo:", blob.type);
      console.log("- Última modificación:", new Date(blob.lastModified));

      // Verificar que el blob no esté vacío
      if (blob.size === 0) {
        console.error("El blob de audio está vacío");
        setDetectionStatus("Error: Audio grabado está vacío");
        return;
      }

      // Verificar que el blob tenga un tamaño mínimo (al menos 1KB)
      if (blob.size < 1024) {
        console.warn("El blob de audio es muy pequeño:", blob.size, "bytes");
        setDetectionStatus("Advertencia: Audio muy corto, puede ser silencio");
      }

      const agentResult = await processWithAgent(blob);
      
      if (agentResult) {
        const { sound_type, confidence, alert_category, transcription, is_conversation_detected, audio_id, sound_detections } = agentResult;
        
        // Ignorar detecciones de silencio, errores y tipos unknown
        if (sound_type === "Silence" || sound_type === "Quiet") {
          console.log("Silencio detectado, ignorando...");
          return;
        }
        
        // Manejar errores de análisis
        if (sound_type === "Error") {
          console.error("Error en el análisis de audio:", agentResult);
          setDetectionStatus("Error: No se pudo analizar el audio");
          return;
        }
        
        // Ignorar tipos unknown para evitar mensajes innecesarios
        if (sound_type === "Unknown" || sound_type === "unknown") {
          console.log("Tipo de sonido unknown, ignorando...");
          return;
        }
        
        setLastAgentResult(agentResult);
        
        console.log("Resultado del agente recibido:", {
          sound_type,
          confidence,
          alert_category,
          is_conversation_detected,
          audio_id,
          has_transcription: !!transcription,
          sound_detections_count: sound_detections?.length || 0
        });
        
        // Mostrar alerta según la categoría
        if (alert_category && alert_category !== "unknown") {
          const alertMessages = {
            'danger_alert': '🔴 ¡ALERTA DE PELIGRO!',
            'attention_alert': '🟡 ¡ATENCIÓN REQUERIDA!',
            'social_alert': '🟢 ACTIVIDAD SOCIAL DETECTADA',
            'environment_alert': '🔵 CAMBIO EN EL ENTORNO'
          };
          
          const alertMessage = alertMessages[alert_category] || '⚠️ SONIDO RELEVANTE DETECTADO';
          console.log(alertMessage, `- ${sound_type} (${(confidence * 100).toFixed(1)}% confianza)`);
        }
        
        // Crear descripción del sonido detectado
        // let description = "";
        // if (is_conversation_detected && transcription) {
        //   const transcriptionText = extractTranscriptionText(transcription);
        //   description = `Conversación detectada: "${transcriptionText}"`;
        // } else {
        //   description = `${sound_type} detectado con confianza ${(confidence * 100).toFixed(1)}%`;
        // }

      } else {
        console.error("No se recibió resultado del agente");
        setDetectionStatus("Error: No se pudo procesar el audio");
      }

    } catch (error) {
      console.error("Error al procesar audio:", error);
      setDetectionStatus("Error al procesar audio");
    } finally {
      isRecordingRef.current = false; // Resetear bandera para permitir nuevas grabaciones
      setIsProcessing(false);
      setIsDetecting(true);
      setDetectionStatus(isListeningEnabled ? "Monitoreando sonidos" : "Modo escucha desactivado");
    }
  };

  const processWithAgent = async (audioBlob) => {
    try {
      console.log("Iniciando envío de audio al agente...");
      console.log("Tamaño del blob:", audioBlob.size, "bytes");
      console.log("Tipo del blob:", audioBlob.type);
      
      // Crear un nuevo blob con el Content-Type correcto si es necesario
      let finalBlob = audioBlob;
      if (!audioBlob.type || audioBlob.type === 'application/octet-stream') {
        console.log("Forzando Content-Type a audio/wav");
        finalBlob = new Blob([audioBlob], { type: 'audio/wav' });
      }
      
      const formData = new FormData();
      formData.append("audio", finalBlob, "audio_event.wav");

      // Verificar que el FormData contiene el archivo
      console.log("FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
        if (value instanceof Blob) {
          console.log("  - Blob type:", value.type);
          console.log("  - Blob size:", value.size);
        }
      }

      const response = await fetch(`${API_URL}/agent/process-audio/`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("Respuesta del servidor:", response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log("Resultado del agente:", result);
        return result;
      } else {
        console.error("Error en la respuesta del agente:", response.status);
        const errorText = await response.text();
        console.error("Detalles del error:", errorText);
        return null;
      }
    } catch (error) {
      console.error("Error al procesar con el agente:", error);
      return null;
    }
  };

  const startAutoDetection = () => {
    if (checkVolumeIntervalRef.current) {
      clearInterval(checkVolumeIntervalRef.current);
    }
    checkVolumeIntervalRef.current = setInterval(checkVolumeAndRecord, 100);
  };

  const stopAutoDetection = () => {
    if (checkVolumeIntervalRef.current) {
      clearInterval(checkVolumeIntervalRef.current);
      checkVolumeIntervalRef.current = null;
    }
  };

  const stopAllProcesses = () => {
    stopAutoDetection();
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
  };

  const toggleAutoMode = () => {
    setAutoMode(!autoMode);
    if (!autoMode) {
      startAutoDetection();
    } else {
      stopAutoDetection();
    }
  };

  const toggleListeningMode = () => {
    const newListeningState = !isListeningEnabled;
    setIsListeningEnabled(newListeningState);
    
    if (newListeningState) {
      // Si se está activando el modo escucha, reiniciar la detección automática si está en modo auto
      setDetectionStatus("Monitoreando sonidos");
      if (autoMode) {
        startAutoDetection();
      }
    } else {
      // Si se está desactivando, detener la detección automática
      setDetectionStatus("Modo escucha desactivado");
      stopAutoDetection();
    }
  };

  const value = {
    isRecording,
    isProcessing,
    autoMode,
    volume,
    detectionStatus,
    isDetecting,
    isInitialized,
    lastAgentResult,
    isListeningEnabled,
    toggleAutoMode,
    toggleListeningMode,
    startRecording: () => {
      if (!isRecording && !isProcessing) {
        startRecording();
      }
    },
    stopRecording: () => {
      if (isRecording) {
        setIsRecording(false);
        setIsDetecting(true);
      }
    },
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio debe ser usado dentro de un AudioProvider");
  }
  return context;
}
