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
    <div className="flex items-center space-x-4">
      {/* Indicador de audio mejorado - Diseño moderno */}
      <div className={`group relative flex items-center space-x-4 px-5 py-3 rounded-2xl transition-all duration-300 ${
        'bg-gradient-to-r from-slate-800/80 to-gray-800/80 border border-slate-600/50 shadow-md'
      }`}>
        {/* Estado de grabación con animaciones */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                isRecording
                  ? "bg-red-500 shadow-lg shadow-red-500/50 animate-pulse"
                  : isProcessing
                  ? "bg-amber-500 shadow-lg shadow-amber-500/50 animate-pulse"
                  : autoMode && isListeningEnabled
                  ? "bg-emerald-500 shadow-lg shadow-emerald-500/50"
                  : "bg-slate-400"
              }`}
            />
            {/* Efecto de pulso para estados activos */}
            {(isRecording || isProcessing || (autoMode && isListeningEnabled)) && (
              <div className={`absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-30 ${
                isRecording ? 'bg-red-500' : isProcessing ? 'bg-amber-500' : 'bg-emerald-500'
              }`}></div>
            )}
          </div>
          <span className="text-sm font-semibold transition-all duration-300 text-slate-200">
            {audioDetectionStatus}
          </span>
        </div>
        
        {/* Separador elegante */}
        <div className="w-px h-6 rounded-full bg-gradient-to-b from-slate-600/50 to-transparent" />
        
        {/* Nivel de audio mejorado */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg transition-all duration-300 bg-slate-700/50">
              <Volume2 className="w-4 h-4 transition-all duration-300 group-hover:scale-110 text-blue-400" />
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-bold transition-all duration-300 text-blue-400">
                {Math.round(volume)}
              </span>
              <span className="text-xs font-medium text-slate-400">dB</span>
            </div>
          </div>
          
          {/* Barra de nivel visual mejorada */}
          <div className="relative w-20 h-3 rounded-full overflow-hidden bg-slate-700/50 shadow-inner">
            <div 
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                volume > 80 ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/50' : 
                volume > 60 ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/50' : 
                volume > 40 ? 'bg-gradient-to-r from-orange-400 to-yellow-500 shadow-lg shadow-orange-400/50' : 
                'bg-gradient-to-r from-emerald-400 to-green-500 shadow-lg shadow-emerald-400/50'
              }`}
              style={{ width: `${Math.min((volume / 100) * 100, 100)}%` }}
            />
            {/* Efecto de brillo */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Botón para activar/desactivar modo escucha - Diseño mejorado */}
      <div className="relative">
        <button
          onClick={toggleListeningMode}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`group relative flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
            isListeningEnabled
              ? 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-md hover:shadow-lg text-white border border-emerald-400/30'
              : 'bg-gradient-to-r from-slate-600 to-gray-700 shadow-md hover:shadow-lg text-white border border-slate-400/30'
          }`}
          title={isListeningEnabled ? "Desactivar modo escucha" : "Activar modo escucha"}
        >
          {/* Icono */}
          <div className="relative z-10">
            {isListeningEnabled ? (
              <Ear className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            ) : (
              <EarOff className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            )}
          </div>
          {/* Texto */}
          <span className="relative z-10 text-sm font-semibold hidden sm:inline transition-all duration-300 group-hover:tracking-wide">
            {isListeningEnabled ? "Escucha Activa" : "Escucha Inactiva"}
          </span>
          {/* Indicador de estado simple */}
          <div className={`relative z-10 w-2 h-2 rounded-full transition-all duration-300 ${
            isListeningEnabled 
              ? 'bg-white' 
              : 'bg-slate-300'
          }`} />
        </button>
        
        {/* Tooltip mejorado */}
        {showTooltip && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-md text-xs font-medium bg-gray-800 text-gray-200 z-50">
            {isListeningEnabled ? "Desactivar detección de sonidos" : "Activar detección de sonidos"}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45 bg-gray-800"></div>
          </div>
        )}
      </div>
    </div>
  );
} 