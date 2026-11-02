import React, { useState, useMemo } from 'react';
import { ChartPoint } from '../../types/dashboard';
import { formatCurrencyOrNumber } from '../../services/format';
import { PieChart as PieIcon } from 'lucide-react';

interface CategoryDonutChartProps {
  data: ChartPoint[];
  metricName: string;
  categoryColumnName: string;
  onCategoryClick?: (categoryName: string) => void;
  selectedCategories?: string[];
  isCurrency?: boolean;
}

// Brand-coherent color palette matching the logo
const BRAND_PALETTE = [
  '#FDB82F', // Primary Logo Gold
  '#1C1A17', // Primary Logo Dark Charcoal
  '#F59E0B', // Amber Accent
  '#0D9488', // Teal
  '#2563EB', // Royal Blue
  '#D97706', // Ochre
  '#7C3AED', // Violet
  '#E11D48', // Rose
  '#059669', // Emerald
  '#64748B', // Slate
];

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  data,
  metricName,
  categoryColumnName,
  onCategoryClick,
  selectedCategories = [],
  isCurrency = true,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Group into Top 6 + Otros if more than 7 categories
  const chartItems = useMemo(() => {
    if (!data || data.length === 0) return [];
    const sorted = [...data].sort((a, b) => b.value - a.value);

    const getSliceColor = (label: string, idx: number) => {
      const lower = label.toLowerCase();
      if (lower.includes('fem') || lower === 'f') return '#FDB82F';
      if (lower.includes('masc') || lower === 'm') return '#1C1A17';
      return BRAND_PALETTE[idx % BRAND_PALETTE.length];
    };

    if (sorted.length <= 7) {
      return sorted.map((item, idx) => ({
        ...item,
        color: getSliceColor(item.label, idx),
      }));
    }

    const top = sorted.slice(0, 6).map((item, idx) => ({
      ...item,
      color: getSliceColor(item.label, idx),
    }));

    const others = sorted.slice(6);
    const othersValue = others.reduce((acc, c) => acc + c.value, 0);
    const othersCount = others.reduce((acc, c) => acc + c.count, 0);

    top.push({
      label: 'Otros',
      value: othersValue,
      count: othersCount,
      color: '#94A3B8',
    });

    return top;
  }, [data]);

  const totalValue = chartItems.reduce((acc, c) => acc + c.value, 0) || 1;

  // Calculate SVG arc paths
  const slices = useMemo(() => {
    let cumulativeAngle = 0;
    return chartItems.map((item, index) => {
      const percentage = (item.value / totalValue) * 100;
      const angle = (item.value / totalValue) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;
      cumulativeAngle += angle;

      // Arc coordinates (center: 100, 100, outerRadius: 80, innerRadius: 52)
      const radius = 80;
      const innerRadius = 52;
      const cx = 100;
      const cy = 100;

      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((endAngle - 90) * Math.PI) / 180;

      const x1 = cx + radius * Math.cos(startRad);
      const y1 = cy + radius * Math.sin(startRad);
      const x2 = cx + radius * Math.cos(endRad);
      const y2 = cy + radius * Math.sin(endRad);

      const ix1 = cx + innerRadius * Math.cos(endRad);
      const iy1 = cy + innerRadius * Math.sin(endRad);
      const ix2 = cx + innerRadius * Math.cos(startRad);
      const iy2 = cy + innerRadius * Math.sin(startRad);

      const largeArcFlag = angle > 180 ? 1 : 0;

      // SVG path definition
      const path = [
        `M ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${ix1} ${iy1}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix2} ${iy2}`,
        'Z',
      ].join(' ');

      return {
        ...item,
        percentage,
        path,
        index,
      };
    });
  }, [chartItems, totalValue]);

  const activeSlice = hoveredIndex !== null ? slices[hoveredIndex] : null;

  return (
    <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl border border-[#E8E5DF] dark:border-[#332F2B] p-5 shadow-xs flex flex-col h-full transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FDB82F]" />
            <h3 className="text-sm font-bold text-[#1C1A17] dark:text-white">Participación Porcentual</h3>
          </div>
          <p className="text-xs text-[#736E67] dark:text-[#A6A095] mt-0.5">
            Distribución proporcional por {categoryColumnName || 'Sexo'}
          </p>
        </div>
        <PieIcon className="w-4 h-4 text-[#736E67] dark:text-[#A6A095]" />
      </div>

      {slices.length === 0 ? (
        <div className="py-12 text-center text-xs text-[#918B80] dark:text-[#736E67]">
          Sin datos para gráfica circular.
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-auto">
          {/* Donut Graphic */}
          <div className="relative w-48 h-48 shrink-0">
            <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
              {slices.map((slice, i) => {
                const isHovered = hoveredIndex === i;
                const isSelected = selectedCategories.includes(slice.label);

                return (
                  <path
                    key={slice.label}
                    d={slice.path}
                    fill={slice.color}
                    className="transition-all duration-200 cursor-pointer"
                    style={{
                      opacity: hoveredIndex !== null && !isHovered ? 0.45 : 1,
                      transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                      transformOrigin: '100px 100px',
                      stroke: isSelected ? '#FDB82F' : '#FFFFFF',
                      strokeWidth: isSelected ? '2.5' : '1.5',
                    }}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => onCategoryClick && onCategoryClick(slice.label)}
                  />
                );
              })}
            </svg>

            {/* Donut Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              {activeSlice ? (
                <>
                  <span className="text-[10px] text-[#736E67] dark:text-[#A6A095] font-semibold truncate max-w-[85px]">
                    {activeSlice.label}
                  </span>
                  <span className="text-base font-black text-[#1C1A17] dark:text-white tracking-tight">
                    {activeSlice.percentage.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-[#E09D1B] dark:text-[#FDB82F] font-bold">
                    {isCurrency ? formatCurrencyOrNumber(activeSlice.value, true) : `${activeSlice.value} ${activeSlice.value === 1 ? 'persona' : 'personas'}`}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[10px] text-[#736E67] dark:text-[#A6A095] font-semibold uppercase tracking-wider">
                    TOTAL
                  </span>
                  <span className="text-sm sm:text-base font-black text-[#1C1A17] dark:text-white tracking-tight">
                    {isCurrency ? formatCurrencyOrNumber(totalValue, true) : `${totalValue} personas`}
                  </span>
                  <span className="text-[10px] text-[#918B80] dark:text-[#736E67]">
                    {data.length} {data.length === 1 ? 'grupo' : 'grupos'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Interactive Legend List */}
          <div className="flex-1 w-full space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {slices.map((slice, i) => {
              const isHovered = hoveredIndex === i;
              const isSelected = selectedCategories.includes(slice.label);

              return (
                <div
                  key={slice.label}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => onCategoryClick && onCategoryClick(slice.label)}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    isHovered
                      ? 'bg-[#FFF9EC] dark:bg-[#2B2314]'
                      : isSelected
                      ? 'bg-[#F5F4F0] dark:bg-[#2B2724] font-semibold'
                      : 'hover:bg-[#FAF8F5] dark:hover:bg-[#262320]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate mr-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="truncate text-[#1C1A17] dark:text-white font-medium" title={slice.label}>
                      {slice.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-[#1C1A17] dark:text-white">
                      {slice.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer info */}
      <div className="mt-auto pt-3 border-t border-[#F5F3EE] dark:border-[#2C2926] flex items-center justify-between text-[11px] text-[#918B80] dark:text-[#736E67]">
        <span>Pasa el cursor para ver detalles</span>
        <span>Distribución relativa</span>
      </div>
    </div>
  );
};
