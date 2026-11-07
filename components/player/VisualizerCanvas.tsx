"use client";

import React, { useRef, useEffect } from "react";
import { useAudio } from "@/context/AudioContext";

interface VisualizerProps {
  className?: string;
  barCount?: number;
}

export const VisualizerCanvas: React.FC<VisualizerProps> = ({
  className = "",
  barCount = 42,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { isPlaying, frequencyData, beatIntensity } = useAudio();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // If playing, use actual audio frequency data; otherwise draw a gentle ambient wave
      const data = frequencyData;
      const step = Math.floor(data.length / barCount) || 1;
      const barWidth = (width / barCount) * 0.7;
      const gap = (width - barCount * barWidth) / (barCount - 1);

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.min(i * step, data.length - 1);
        let value = isPlaying ? data[dataIndex] / 255 : 0;

        // Add beat jumping boost to lower frequencies
        if (isPlaying && i < barCount * 0.35) {
          value = Math.min(1, value * (1 + beatIntensity * 0.8));
        }

        // Idle state wave if not playing
        if (!isPlaying) {
          const t = Date.now() * 0.003;
          value = 0.08 + Math.sin(t + i * 0.25) * 0.05;
        }

        const barHeight = Math.max(4, value * (height * 0.9));
        const x = i * (barWidth + gap);
        const y = height - barHeight;

        // Dynamic neon gradient
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, "#d21bff"); // Neon pink
        gradient.addColorStop(0.5, "#8c28ef"); // Purple
        gradient.addColorStop(1, "#31c9ff"); // Neon Cyan

        ctx.fillStyle = gradient;

        // Rounded bar top
        ctx.beginPath();
        const radius = Math.min(barWidth / 2, 4);
        ctx.roundRect(x, y, barWidth, barHeight, [radius, radius, 0, 0]);
        ctx.fill();

        // Neon Glow effect on high peaks
        if (value > 0.6) {
          ctx.save();
          ctx.shadowColor = "#31c9ff";
          ctx.shadowBlur = 12 * beatIntensity;
          ctx.fill();
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, frequencyData, beatIntensity, barCount]);

  return (
    <canvas
      ref={canvasRef}
      width={700}
      height={140}
      className={`w-full h-full block ${className}`}
    />
  );
};

