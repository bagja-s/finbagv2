"use client";

import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export interface ChartProps {
  data: any;
  options?: any;
  type: "doughnut" | "bar" | "line";
  height?: number;
  width?: number;
  className?: string;
}

export function Chart({ data, options, type, height = 300, width, className }: ChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = container.querySelector("canvas");
    if (canvas) {
      canvas.style.height = `${height}px`;
      if (width) canvas.style.width = `${width}px`;
    }
  }, [height, width]);

  const defaultOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        cornerRadius: 8,
      },
    },
    ...options,
  };

  const ChartComponent = type === "doughnut" ? Doughnut : type === "bar" ? Bar : Line;

  return (
    <div ref={containerRef} className={className} style={{ height, width: width ? `${width}px` : "100%" }}>
      <ChartComponent data={data} options={defaultOptions} />
    </div>
  );
}

// Helper functions for chart data
export function createDoughnutData(
  labels: string[],
  values: number[],
  colors: string[],
  label: string = ""
) {
  return {
    labels,
    datasets: [
      {
        label,
        data: values,
        backgroundColor: colors,
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };
}

export function createBarData(
  labels: string[],
  datasets: { label: string; data: number[]; color: string }[]
) {
  return {
    labels,
    datasets: datasets.map((d) => ({
      label: d.label,
      data: d.data,
      backgroundColor: d.color,
      borderRadius: 6,
      borderSkipped: false,
    })),
  };
}

export function createLineData(
  labels: string[],
  datasets: { label: string; data: number[]; color: string; fill?: boolean }[]
) {
  return {
    labels,
    datasets: datasets.map((d) => ({
      label: d.label,
      data: d.data,
      borderColor: d.color,
      backgroundColor: d.fill ? `${d.color}20` : "transparent",
      fill: d.fill ?? false,
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 6,
    })),
  };
}

// Finance-specific color palette
export const financeColors = {
  income: "#22c55e",      // green-500
  expense: "#ef4444",     // red-500
  warning: "#f59e0b",     // amber-500
  primary: "#3b82f6",     // blue-500
  secondary: "#8b5cf6",   // violet-500
  neutral: "#6b7280",     // gray-500
};

export const chartColorPalettes = {
  categorical: [
    "#22c55e", // green
    "#ef4444", // red
    "#3b82f6", // blue
    "#f59e0b", // amber
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#84cc16", // lime
    "#f97316", // orange
    "#6366f1", // indigo
  ],
  income: ["#22c55e", "#16a34a", "#15803d", "#166534"],
  expense: ["#ef4444", "#dc2626", "#b91c1c", "#991b1b"],
  gradient: [
    "rgba(34, 197, 94, 0.8)",
    "rgba(239, 68, 68, 0.8)",
    "rgba(59, 130, 246, 0.8)",
    "rgba(245, 158, 11, 0.8)",
    "rgba(139, 92, 246, 0.8)",
  ],
};