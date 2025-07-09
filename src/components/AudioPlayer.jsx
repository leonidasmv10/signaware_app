import { useState, useRef, useEffect } from "react";
import { Volume2, Play, Pause } from "lucide-react";

export default function AudioPlayer({ audioId, soundType }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const loadAudio = async () => {
    if (!audioId || audioUrl) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/agent/audio/${audioId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      } else {
        console.error("Error al cargar audio:", response.status);
      }
    } catch (error) {
      console.error("Error al cargar audio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = () => {
    if (!audioUrl) {
      loadAudio();
      return;
    }

    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioPlay = () => {
    setIsPlaying(true);
  };

  const handleAudioPause = () => {
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-full transition-colors"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isLoading ? "Cargando audio..." : "Reproducir audio detectado"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tipo: {soundType}
            </p>
          </div>
        </div>
        <Volume2 className="w-5 h-5 text-gray-400" />
      </div>
      
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={handleAudioEnded}
          onPlay={handleAudioPlay}
          onPause={handleAudioPause}
          className="hidden"
        />
      )}
    </div>
  );
} 