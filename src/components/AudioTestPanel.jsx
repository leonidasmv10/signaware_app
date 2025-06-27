import React from "react";
import { 
  Mic, 
  Square, 
  Play, 
  Download, 
  Trash2, 
  Clock,
  Volume2,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const AudioTestPanel = ({
  isRecording,
  recordedAudio,
  audioUrl,
  recordingDuration,
  audioLevel,
  isStreaming,
  startRecording,
  stopRecording,
  playRecordedAudio,
  downloadRecordedAudio,
  clearRecordedAudio,
  currentTheme
}) => {
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAudioLevelColor = (level) => {
    if (level > 60) return "text-red-500";
    if (level > 30) return "text-yellow-500";
    return "text-green-500";
  };

  const getAudioLevelText = (level) => {
    if (level > 60) return "Alto";
    if (level > 30) return "Medio";
    if (level > 10) return "Bajo";
    return "Silencio";
  };

  return (
    <div className={`${currentTheme.cardBg} border ${currentTheme.border} rounded-2xl p-6 shadow-lg`}>
      <h3 className={`font-bold text-xl mb-4 ${currentTheme.text} flex items-center space-x-2`}>
        🎤 Test Completo de Audio Streaming
      </h3>

      {/* Estado actual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className={`p-4 rounded-xl ${currentTheme.button} border-2 ${isStreaming ? 'border-green-500' : 'border-transparent'}`}>
          <div className="flex items-center justify-between">
            <span className={`font-medium ${currentTheme.text}`}>Estado del Micrófono:</span>
            <div className="flex items-center space-x-2">
              {isStreaming ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-500" />
              )}
              <span className={`text-sm font-medium ${isStreaming ? 'text-green-500' : currentTheme.textMuted}`}>
                {isStreaming ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl ${currentTheme.button} border-2 ${isRecording ? 'border-red-500' : 'border-transparent'}`}>
          <div className="flex items-center justify-between">
            <span className={`font-medium ${currentTheme.text}`}>Grabación:</span>
            <div className="flex items-center space-x-2">
              {isRecording ? (
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              ) : (
                <div className="w-3 h-3 bg-gray-400 rounded-full" />
              )}
              <span className={`text-sm font-medium ${isRecording ? 'text-red-500' : currentTheme.textMuted}`}>
                {isRecording ? 'Grabando' : 'Detenida'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Nivel de audio en tiempo real */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className={`font-medium ${currentTheme.text}`}>Nivel de Audio en Tiempo Real:</span>
          <div className="flex items-center space-x-2">
            <Volume2 className={`w-5 h-5 ${getAudioLevelColor(audioLevel)}`} />
            <span className={`text-sm font-bold ${getAudioLevelColor(audioLevel)}`}>
              {getAudioLevelText(audioLevel)} ({Math.round(audioLevel)})
            </span>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div 
            className={`h-full transition-all duration-200 ${
              audioLevel > 60 ? 'bg-red-500' : 
              audioLevel > 30 ? 'bg-yellow-500' : 
              audioLevel > 10 ? 'bg-green-500' : 'bg-gray-400'
            }`}
            style={{ width: `${Math.min(100, (audioLevel / 100) * 100)}%` }}
          />
        </div>
      </div>

      {/* Controles de grabación */}
      <div className="mb-6">
        <h4 className={`font-semibold mb-3 ${currentTheme.text}`}>Controles de Grabación:</h4>
        <div className="flex items-center space-x-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all shadow-sm ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
            disabled={!isStreaming}
          >
            {isRecording ? (
              <>
                <Square className="w-5 h-5" />
                <span>Detener Grabación</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                <span>Iniciar Grabación</span>
              </>
            )}
          </button>

          {isRecording && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-800 rounded-xl">
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold">{formatDuration(recordingDuration)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Audio grabado */}
      {recordedAudio && (
        <div className="mb-6">
          <h4 className={`font-semibold mb-3 ${currentTheme.text}`}>Audio Grabado:</h4>
          <div className={`p-4 rounded-xl ${currentTheme.inputBg} border ${currentTheme.border}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm ${currentTheme.textMuted}`}>
                Tamaño: {(recordedAudio.size / 1024).toFixed(1)} KB
              </span>
              <span className={`text-sm ${currentTheme.textMuted}`}>
                Formato: WebM (Opus)
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={playRecordedAudio}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
              >
                <Play className="w-4 h-4" />
                <span>Reproducir</span>
              </button>
              
              <button
                onClick={downloadRecordedAudio}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Descargar</span>
              </button>
              
              <button
                onClick={clearRecordedAudio}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Información del test */}
      <div className={`p-4 rounded-xl bg-blue-50 border border-blue-200`}>
        <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Información del Test:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Streaming:</strong> Audio enviado en chunks cada segundo (simulado para Django)</li>
          <li>• <strong>Grabación:</strong> Audio completo guardado localmente</li>
          <li>• <strong>Formato:</strong> WebM con codec Opus (compatible con navegadores modernos)</li>
          <li>• <strong>Calidad:</strong> Automática según el navegador</li>
          <li>• <strong>Descarga:</strong> Archivo .webm listo para usar</li>
        </ul>
      </div>
    </div>
  );
};

export default AudioTestPanel; 