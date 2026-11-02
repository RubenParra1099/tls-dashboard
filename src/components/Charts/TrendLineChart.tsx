import React, { useState, useMemo } from 'react';
import { ChartPoint } from '../../types/dashboard';
import { Calendar, Users } from 'lucide-react';

interface TrendLineChartProps {
  data: ChartPoint[];
  metricName: string;
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({
  data,
  metricName,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [chartMode, setChartMode] = useState<'area' | 'line'>('area');

  // SVG dimensions
  const width = 800;
  const height = 280;
  const padding = { top: 25, right: 30, bottom: 45, left: 50 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const { points, maxValue, minValue, yTicks, xTicks } = useMemo(() => {
    if (!data || data.length === 0) {
      return { points: [], maxValue: 0, minValue: 0, yTicks: [], xTicks: [] };
    }

    const values = data.map(d => d.value);
    const maxVal = Math.max(...values, 1);
    const minVal = 0;
    const range = maxVal - minVal || 1;

    const calculatedPoints = data.map((d, i) => {
      const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartWidth;
      const y = padding.top + chartHeight - ((d.value - minVal) / range) * chartHeight;
      return { ...d, x, y, index: i };
    });

    // 4 Y-ticks
    const ticksCount = Math.min(4, Math.max(2, maxVal));
    const calculatedYTicks = Array.from({ length: ticksCount + 1 }, (_, i) => {
      const val = Math.round((maxVal / ticksCount) * i);
      const y = padding.top + chartHeight - (i / ticksCount) * chartHeight;
      return { val, y };
    });

    // X-ticks
    const calculatedXTicks = data.map((d, i) => ({
      label: d.label,
      index: i,
      x: calculatedPoints[i]?.x,
    }));

    return {
      points: calculatedPoints,
      maxValue: maxVal,
      minValue: minVal,
      yTicks: calculatedYTicks,
      xTicks: calculatedXTicks,
    };
  }, [data, chartWidth, chartHeight]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E8E5DF] p-6 text-center shadow-xs">
        <h3 className="text-sm font-bold text-[#1C1A17] mb-1">Evolución de Registros en el Tiempo</h3>
        <p className="text-xs text-[#918B80] py-12">No hay suficientes datos temporales para graficar.</p>
      </div>
    );
  }

  // Generate SVG path strings
  const linePath = points.reduce((acc, p, i) => {
    return `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
  }, '');

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`
    : '';

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl border border-[#E8E5DF] dark:border-[#332F2B] p-5 shadow-xs flex flex-col transition-colors">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FDB82F]" />
            <h3 className="text-sm font-bold text-[#1C1A17] dark:text-white">Evolución Temporal de Registros</h3>
          </div>
          <p className="text-xs text-[#736E67] dark:text-[#A6A095] mt-0.5">
            Flujo de inscripciones registradas por fecha
          </p>
        </div>

        {/* Chart View Toggle */}
        <div className="flex items-center gap-1 bg-[#F5F4F0] dark:bg-[#2B2724] p-1 rounded-xl text-xs">
          <button
            onClick={() => setChartMode('area')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              chartMode === 'area'
                ? 'bg-white dark:bg-[#38332F] text-[#1C1A17] dark:text-white shadow-xs font-bold'
                : 'text-[#736E67] dark:text-[#A6A095] hover:text-[#1C1A17] dark:hover:text-white'
            }`}
          >
            Área
          </button>
          <button
            onClick={() => setChartMode('line')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              chartMode === 'line'
                ? 'bg-white dark:bg-[#38332F] text-[#1C1A17] dark:text-white shadow-xs font-bold'
                : 'text-[#736E67] dark:text-[#A6A095] hover:text-[#1C1A17] dark:hover:text-white'
            }`}
          >
            Línea
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative w-full aspect-16/7 sm:aspect-21/9 min-h-[220px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="brandGoldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FDB82F" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#FDB82F" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#FDB82F" stopOpacity="0" />
            </linearGradient>

            <filter id="shadowGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#FDB82F" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Grid lines (horizontal) */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={tick.y}
                x2={width - padding.right}
                y2={tick.y}
                stroke="currentColor"
                className="text-[#F0ECE3] dark:text-[#2E2B27]"
                strokeWidth="1"
                strokeDasharray={i === 0 ? undefined : '3 3'}
              />
              <text
                x={padding.left - 10}
                y={tick.y + 4}
                textAnchor="end"
                fontSize="10"
                className="fill-[#918B80] dark:fill-[#736E67]"
                fontFamily="sans-serif"
              >
                {tick.val}
              </text>
            </g>
          ))}

          {/* Area Fill */}
          {chartMode === 'area' && (
            <path
              d={areaPath}
              fill="url(#brandGoldGradient)"
              className="transition-all duration-300"
            />
          )}

          {/* Line Stroke */}
          <path
            d={linePath}
            fill="none"
            stroke="#EAA41A"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#shadowGlow)"
            className="transition-all duration-300"
          />

          {/* Interactive Hover Guides */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1={padding.top}
                x2={activePoint.x}
                y2={padding.top + chartHeight}
                stroke="#1C1A17"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.4"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="6"
                fill="#FFFFFF"
                stroke="#1C1A17"
                strokeWidth="3"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="3"
                fill="#FDB82F"
              />
            </g>
          )}

          {/* Points */}
          {points.map((p, i) => (
            <g key={i} className="cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r="16"
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r="4"
                fill="#FFFFFF"
                stroke="#EAA41A"
                strokeWidth="2.5"
                className="pointer-events-none"
              />
            </g>
          ))}

          {/* X Axis Labels */}
          {xTicks.map((tick, i) => (
            <text
              key={i}
              x={tick.x}
              y={padding.top + chartHeight + 18}
              textAnchor="middle"
              fontSize="10"
              className="fill-[#918B80] dark:fill-[#736E67]"
              fontFamily="sans-serif"
            >
              {tick.label}
            </text>
          ))}
        </svg>

        {/* Hover Tooltip Popup */}
        {activePoint && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
              top: `${(activePoint.y / height) * 100}%`,
            }}
          >
            <div className="bg-[#1C1A17] dark:bg-[#2B2724] text-white px-3 py-2 rounded-xl shadow-xl text-xs whitespace-nowrap border border-[#3A352E] dark:border-[#423C36]">
              <div className="text-[10px] text-[#C4BFB5] dark:text-[#A6A095] flex items-center gap-1 font-medium mb-0.5">
                <Calendar className="w-3 h-3 text-[#FDB82F]" />
                {activePoint.label}
              </div>
              <div className="text-sm font-extrabold text-[#FDB82F] flex items-center gap-1">
                <span>{activePoint.value} {activePoint.value === 1 ? 'registro' : 'registros'}</span>
              </div>
              {activePoint.femaleCount !== undefined && activePoint.maleCount !== undefined && (
                <div className="text-[10px] text-[#A8A298] dark:text-[#8C867B] mt-0.5">
                  ♀ {activePoint.femaleCount} Femenino • ♂ {activePoint.maleCount} Masculino
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="mt-3 pt-3 border-t border-[#F5F3EE] dark:border-[#2C2926] flex items-center justify-between text-[11px] text-[#918B80] dark:text-[#736E67]">
        <span>{data.length} días con actividad</span>
        <span>Pico máximo: <strong className="text-[#1C1A17] dark:text-white">{maxValue} personas/día</strong></span>
      </div>
    </div>
  );
};
