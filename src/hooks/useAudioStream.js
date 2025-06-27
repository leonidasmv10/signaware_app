import { useState, useRef } from "react";

const useAudioStream = () => {
  const [audioLevel, setAudioLevel] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingStartTimeRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  // Iniciar streaming de audio
  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      setIsStreaming(true);

      // Visualización de nivel de audio
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const updateAudioLevel = () => {
        if (analyserRef.current && isStreaming) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setAudioLevel(average);
          requestAnimationFrame(updateAudioLevel);
        }
      };
      updateAudioLevel();

      // Streaming de audio (MediaRecorder)
      mediaRecorderRef.current = new window.MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          sendAudioChunk(e.data);
        }
      };
      mediaRecorderRef.current.start(1000); // Enviar chunk cada segundo
    } catch (error) {
      console.error("Error starting audio stream:", error);
      setIsStreaming(false);
      setAudioLevel(0);
    }
  };

  // Iniciar grabación completa
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Configurar MediaRecorder para grabación completa
      mediaRecorderRef.current = new window.MediaRecorder(stream, { 
        mimeType: 'audio/webm;codecs=opus' 
      });
      
      const chunks = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedAudio(blob);
        setAudioUrl(url);
        setIsRecording(false);
        setRecordingDuration(0);
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      recordingStartTimeRef.current = Date.now();
      
      // Actualizar duración de grabación
      recordingIntervalRef.current = setInterval(() => {
        const duration = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
        setRecordingDuration(duration);
      }, 1000);
      
      // También iniciar visualización de nivel de audio
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
        microphoneRef.current.connect(analyserRef.current);
        analyserRef.current.fftSize = 256;
      }
      
      setIsStreaming(true);
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const updateAudioLevel = () => {
        if (analyserRef.current && isStreaming) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setAudioLevel(average);
          requestAnimationFrame(updateAudioLevel);
        }
      };
      updateAudioLevel();
      
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsRecording(false);
      setIsStreaming(false);
    }
  };

  // Detener grabación
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  };

  // Detener streaming
  const stopStream = () => {
    setIsStreaming(false);
    setAudioLevel(0);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  // Reproducir audio grabado
  const playRecordedAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  // Descargar audio grabado
  const downloadRecordedAudio = () => {
    if (recordedAudio) {
      const url = URL.createObjectURL(recordedAudio);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audio-recording-${new Date().toISOString()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Limpiar audio grabado
  const clearRecordedAudio = () => {
    setRecordedAudio(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  };

  // Simulación de envío de audio a Django
  const sendAudioChunk = (chunk) => {
    // Aquí puedes hacer un fetch o websocket a tu API Django
    // Ejemplo:
    // const formData = new FormData();
    // formData.append('audio', chunk, 'audio.webm');
    // fetch('/api/audio-stream/', { method: 'POST', body: formData });
    console.log('Audio chunk ready to send to Django:', chunk.size, 'bytes');
  };

  return {
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
    sendAudioChunk,
  };
};

export default useAudioStream; 