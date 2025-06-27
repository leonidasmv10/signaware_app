import React from "react";

const AudioVisualizer = ({ audioLevel, isActive }) => {
  return (
    <div
      aria-label="Visualización de nivel de audio"
      className={`flex items-end space-x-1 h-8 w-16 ${isActive ? "animate-pulse" : "opacity-50"}`}
    >
      {[1, 2, 3, 4, 5].map((bar, idx) => (
        <div
          key={bar}
          style={{
            height: `${Math.max(2, (audioLevel / 100) * (bar * 8))}px`,
            background:
              audioLevel > 60
                ? "#ef4444"
                : audioLevel > 30
                ? "#f59e42"
                : "#22c55e",
          }}
          className="w-2 rounded bg-current transition-all duration-200"
        />
      ))}
    </div>
  );
};

export default AudioVisualizer; 