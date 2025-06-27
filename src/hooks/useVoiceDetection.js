import { useState, useRef, useCallback } from "react";

const useVoiceDetection = (onVoiceDetected, onVoiceEnded) => {
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const voiceTimeoutRef = useRef(null);
  
  // Configuración para detección de voz
  const VOICE_THRESHOLD = 30; // Umbral de amplitud para detectar voz
  const VOICE_FREQUENCY_MIN = 85; // Hz - frecuencia mínima de voz humana
  const VOICE_FREQUENCY_MAX = 255; // Hz - frecuencia máxima de voz humana
  const VOICE_DURATION_MIN = 500; // ms - duración mínima para considerar voz
  const SILENCE_DURATION = 1500; // ms - tiempo de silencio para considerar que terminó

  const startVoiceDetection = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      microphoneRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const timeDataArray = new Uint8Array(bufferLength);
      
      let voiceStartTime = null;
      let isCurrentlySpeaking = false;
      
      const detectVoice = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        analyserRef.current.getByteTimeDomainData(timeDataArray);
        
        // Calcular nivel de audio general
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        setAudioLevel(average);
        
        // Detectar frecuencias de voz humana
        let voiceFrequencyCount = 0;
        const sampleRate = audioContextRef.current.sampleRate;
        
        for (let i = 0; i < bufferLength; i++) {
          const frequency = (i * sampleRate) / (2 * bufferLength);
          if (frequency >= VOICE_FREQUENCY_MIN && frequency <= VOICE_FREQUENCY_MAX) {
            if (dataArray[i] > VOICE_THRESHOLD) {
              voiceFrequencyCount++;
            }
          }
        }
        
        const voicePercentage = (voiceFrequencyCount / bufferLength) * 100;
        const hasVoice = voicePercentage > 5 && average > VOICE_THRESHOLD; // 5% de frecuencias de voz
        
        // Detectar inicio de voz
        if (hasVoice && !isCurrentlySpeaking) {
          isCurrentlySpeaking = true;
          voiceStartTime = Date.now();
          setIsVoiceActive(true);
          
          console.log('🎤 Voz detectada! Iniciando transcripción...');
          if (onVoiceDetected) {
            onVoiceDetected({
              audioLevel: average,
              voicePercentage,
              timestamp: new Date().toLocaleTimeString()
            });
          }
        }
        
        // Detectar fin de voz
        if (!hasVoice && isCurrentlySpeaking) {
          const voiceDuration = Date.now() - voiceStartTime;
          
          if (voiceDuration >= VOICE_DURATION_MIN) {
            // Limpiar timeout anterior si existe
            if (voiceTimeoutRef.current) {
              clearTimeout(voiceTimeoutRef.current);
            }
            
            // Esperar un poco más para confirmar que realmente terminó
            voiceTimeoutRef.current = setTimeout(() => {
              isCurrentlySpeaking = false;
              setIsVoiceActive(false);
              voiceStartTime = null;
              
              console.log('🔇 Voz terminada. Deteniendo transcripción...');
              if (onVoiceEnded) {
                onVoiceEnded({
                  duration: voiceDuration,
                  timestamp: new Date().toLocaleTimeString()
                });
              }
            }, SILENCE_DURATION);
          } else {
            // Voz muy corta, ignorar
            isCurrentlySpeaking = false;
            setIsVoiceActive(false);
            voiceStartTime = null;
          }
        }
        
        animationFrameRef.current = requestAnimationFrame(detectVoice);
      };
      
      setIsListening(true);
      detectVoice();
      
    } catch (error) {
      console.error("Error starting voice detection:", error);
      setIsListening(false);
    }
  }, [onVoiceDetected, onVoiceEnded]);

  const stopVoiceDetection = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (voiceTimeoutRef.current) {
      clearTimeout(voiceTimeoutRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    setIsListening(false);
    setIsVoiceActive(false);
    setAudioLevel(0);
  }, []);

  return {
    isListening,
    isVoiceActive,
    audioLevel,
    startVoiceDetection,
    stopVoiceDetection,
  };
};

export default useVoiceDetection; 