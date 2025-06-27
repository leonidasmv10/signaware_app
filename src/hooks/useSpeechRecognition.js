import { useState, useRef, useCallback } from "react";

const useSpeechRecognition = (onTranscriptionComplete) => {
  const [transcript, setTranscript] = useState("");
  const [isRecognizing, setIsRecognizing] = useState(false);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  const startRecognition = useCallback(async () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    
    try {
      // Obtener stream de audio para grabación
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Configurar MediaRecorder para grabar el audio
      mediaRecorderRef.current = new window.MediaRecorder(stream, { 
        mimeType: 'audio/webm;codecs=opus' 
      });
      
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
          console.log('Audio chunk received:', e.data.size, 'bytes');
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        console.log('MediaRecorder stopped, chunks:', audioChunksRef.current.length);
        if (audioChunksRef.current.length > 0) {
          // Crear blob del audio grabado
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          console.log('Audio blob created:', audioBlob.size, 'bytes');
          console.log('Audio URL:', audioUrl);
          
          // Llamar callback con transcripción y audio
          if (onTranscriptionComplete) {
            onTranscriptionComplete({
              text: transcript.trim(),
              audioBlob,
              audioUrl,
              timestamp: new Date().toLocaleTimeString()
            });
          }
          
          // Limpiar para la siguiente transcripción
          audioChunksRef.current = [];
        }
      };
      
      // Configurar reconocimiento de voz
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; // Cambiar a false para procesar una frase a la vez
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "es-ES";
      
      recognitionRef.current.onstart = () => {
        setIsRecognizing(true);
        setTranscript("");
        console.log('Speech recognition started');
        // Iniciar grabación inmediatamente
        mediaRecorderRef.current.start();
        console.log('Audio recording started');
      };
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript + interimTranscript);
        
        // Si hay transcripción final, procesarla
        if (finalTranscript.trim()) {
          console.log('Final transcript detected:', finalTranscript.trim());
          
          // Detener grabación después de un pequeño delay
          setTimeout(() => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              console.log('Stopping audio recording');
              mediaRecorderRef.current.stop();
            }
          }, 500); // Esperar 500ms después de la transcripción final
        }
      };
      
      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setIsRecognizing(false);
        // Si aún estamos grabando, detener
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecognizing(false);
      };
      
      recognitionRef.current.start();
      
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      setIsRecognizing(false);
    }
  }, [onTranscriptionComplete, transcript]);

  const stopRecognition = useCallback(() => {
    console.log('Stopping recognition manually');
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsRecognizing(false);
    setTranscript("");
    audioChunksRef.current = [];
  }, []);

  return {
    transcript,
    isRecognizing,
    startRecognition,
    stopRecognition,
  };
};

export default useSpeechRecognition; 