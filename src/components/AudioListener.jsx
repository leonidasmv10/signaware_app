import { useState, useEffect } from "react";
import { Volume2, Ear, EarOff, Loader2 } from "lucide-react";
import { useAudio } from "../context/AudioContext";

export default function AudioListener() {
  const {
    isRecording,
    isProcessing,
    autoMode,
    volume,
    detectionStatus: audioDetectionStatus,
    lastAgentResult,
    isListeningEnabled,
    toggleListeningMode,
  } = useAudio();

  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="flex items-center space-x-3">
      {/* Indicador de volumen compacto */}
      <div className="flex items-center space-x-2">
        <div className="relative">
          <div
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              isRecording
                ? "bg-red-500 shadow-lg shadow-red-500/50 animate-pulse"
                : isProcessing
                ? "bg-amber-500 shadow-lg shadow-amber-500/50 animate-pulse"
                : autoMode && isListeningEnabled
                ? "bg-emerald-500 shadow-lg shadow-emerald-500/50"
                : "bg-gray-400"
            }`}
          />
          {/* Efecto de pulso para estados activos */}
          {(isRecording || isProcessing || (autoMode && isListeningEnabled)) && (
            <div className={`absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-30 ${
              isRecording ? 'bg-red-500' : isProcessing ? 'bg-amber-500' : 'bg-emerald-500'
            }`}></div>
          )}
        </div>
        
        {/* Barra de nivel visual compacta */}
        <div className="relative w-12 h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
          <div 
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              volume > 80 ? 'bg-red-500' : 
              volume > 60 ? 'bg-amber-500' : 
              volume > 40 ? 'bg-orange-400' : 
              'bg-emerald-400'
            }`}
            style={{ width: `${Math.min((volume / 100) * 100, 100)}%` }}
          />
        </div>
        
        {/* Nivel de audio numérico */}
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 min-w-[2rem] text-right">
          {Math.round(volume)}
        </span>
      </div>

      {/* Botón compacto para activar/desactivar modo escucha */}
      <div className="relative">
        <button
          onClick={toggleListeningMode}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`group relative p-2 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${
            isListeningEnabled
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md'
              : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'
          }`}
          title={isListeningEnabled ? "Desactivar modo escucha" : "Activar modo escucha"}
        >
          {isListeningEnabled ? (
            <Ear className="w-4 h-4" />
          ) : (
            <EarOff className="w-4 h-4" />
          )}
        </button>
        
        {/* Tooltip compacto */}
        {showTooltip && (
          <div className="absolute -bottom-8 right-0 px-2 py-1 rounded text-xs font-medium bg-gray-800 text-gray-200 z-50 whitespace-nowrap">
            {isListeningEnabled ? "Desactivar detección" : "Activar detección"}
            <div className="absolute -top-1 right-3 w-2 h-2 rotate-45 bg-gray-800"></div>
          </div>
        )}
      </div>
    </div>
  );
} 