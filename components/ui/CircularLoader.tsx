import React from "react";

interface CircularLoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export const CircularLoader: React.FC<CircularLoaderProps> = ({
  size = "md",
  text,
  className = "",
}) => {
  const sizeMap = {
    sm: "w-6 h-6 border-2",
    md: "w-12 h-12 border-3",
    lg: "w-16 h-16 border-4",
  };

  const ringSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-6 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Outer ambient blur glow */}
        <div
          className={`absolute rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 blur-md opacity-60 animate-pulse ${
            size === "sm" ? "w-7 h-7" : size === "lg" ? "w-20 h-20" : "w-14 h-14"
          }`}
        />

        {/* Outer rotating gradient ring */}
        <div
          className={`${ringSize} rounded-full border-t-transparent border-r-fuchsia-500 border-b-cyan-400 border-l-fuchsia-400 animate-spin relative z-10 shadow-[0_0_15px_rgba(210,27,255,0.4)]`}
          style={{ animationDuration: "0.85s" }}
        />

        {/* Inner reverse pulsing ring */}
        {size !== "sm" && (
          <div
            className="absolute w-6 h-6 rounded-full border border-t-cyan-300 border-b-transparent border-l-transparent border-r-cyan-400 animate-spin relative z-10"
            style={{ animationDirection: "reverse", animationDuration: "1.4s" }}
          />
        )}
      </div>

      {text && (
        <span className="text-xs font-semibold tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-pink-200 to-cyan-300 animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
};

