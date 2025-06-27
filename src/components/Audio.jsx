import React, { useRef, useState } from "react";

const AudioStream = () => {
  const mediaRecorder = useRef(null);
  const [recording, setRecording] = useState(false);
  const [transcriptions, setTranscriptions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      mediaRecorder.current = new window.MediaRecorder(stream, { 
        mimeType: "audio/webm;codecs=opus",
        audioBitsPerSecond: 16000
      });
      
      mediaRecorder.current.ondataavailable = async (e) => {
        if (e.data.size > 0) {
          await sendAudioForTranscription(e.data);
        }
      };

      mediaRecorder.current.onstart = () => {
        setTranscriptions([]);
      };

      // Enviar chunks cada 3 segundos
      mediaRecorder.current.start(3000);
      setRecording(true);
    } catch (error) {
      alert("Error al acceder al micrófono: " + error.message);
    }
  };

  const sendAudioForTranscription = async (audioBlob) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      
      console.log('Sending audio file:', audioBlob.size, 'bytes');
      
      const response = await fetch('http://localhost:8000/api/core/transcribe/', {
        method: 'POST',
        body: formData,
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success && data.text) {
        const newTranscription = {
          id: Date.now(),
          text: data.text,
          language: data.language || "es",
          timestamp: new Date().toLocaleTimeString(),
        };
        setTranscriptions(prev => [...prev, newTranscription]);
      }
    } catch (error) {
      console.error('Error en transcripción:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
    setRecording(false);
  };

  const clearTranscriptions = () => {
    setTranscriptions([]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Transcripción en Tiempo Real</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de Control */}
        <div className="space-y-4">
          {recording && (
            <div className="flex items-center justify-center p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-600 font-semibold">GRABANDO</span>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center justify-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-yellow-600 font-semibold">PROCESANDO</span>
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button 
              onClick={startRecording} 
              disabled={recording}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                recording 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              Iniciar
            </button>
            <button 
              onClick={stopRecording} 
              disabled={!recording}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                !recording 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              Detener
            </button>
          </div>

          {transcriptions.length > 0 && (
            <button 
              onClick={clearTranscriptions}
              className="w-full py-2 px-4 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Panel de Transcripciones */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Transcripciones:</h3>
          
          {transcriptions.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500">No hay transcripciones</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-3">
              {transcriptions.map((transcription) => (
                <div key={transcription.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-green-600 font-medium">
                      {transcription.timestamp}
                    </span>
                    <span className="text-xs text-green-500">
                      {transcription.language}
                    </span>
                  </div>
                  <p className="text-green-800 font-medium">{transcription.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioStream;