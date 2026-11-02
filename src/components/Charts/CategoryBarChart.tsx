import React, { useState } from 'react';
import { ChartPoint } from '../../types/dashboard';
import { Check, Layers } from 'lucide-react';

interface CategoryBarChartProps {
  data: ChartPoint[];
  metricName: string;
  categoryColumnName: string;
  selectedCategories: string[];
  onCategoryClick: (categoryName: string) => void;
  isCurrency?: boolean;
}

export const CategoryBarChart: React.FC<CategoryBarChartProps> = ({
  data,
  metricName,
  categoryColumnName,
  selectedCategories,
  onCategoryClick,
}) => {
  const [sortBy, setSortBy] = useState<'value' | 'name'>('value');

  const sortedData = [...data].sort((a, b) => {
    if (sortBy === 'value') return b.value - a.value;
    return a.label.localeCompare(b.label);
  });

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const totalValue = data.reduce((acc, curr) => acc + curr.value, 0) || 1;

  return (
    <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl border border-[#E8E5DF] dark:border-[#332F2B] p-5 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1C1A17] dark:bg-[#FDB82F]" />
            <h3 className="text-sm font-bold text-[#1C1A17] dark:text-white">Distribución por {categoryColumnName || 'Grupo'}</h3>
          </div>
          <p className="text-xs text-[#736E67] dark:text-[#A6A095] mt-0.5">
            Haz clic en una barra para filtrar directamente
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1 text-xs bg-[#F5F4F0] dark:bg-[#2B2724] p-1 rounded-xl">
          <button
            onClick={() => setSortBy('value')}
            className={`px-2 py-0.5 rounded-lg font-medium transition-colors cursor-pointer ${
              sortBy === 'value' ? 'bg-white dark:bg-[#1E1C1A] text-[#1C1A17] dark:text-white shadow-2xs font-bold' : 'text-[#736E67] dark:text-[#A6A095]'
            }`}
          >
            Cantidad
          </button>
          <button
            onClick={() => setSortBy('name')}
            className={`px-2 py-0.5 rounded-lg font-medium transition-colors cursor-pointer ${
              sortBy === 'name' ? 'bg-white dark:bg-[#1E1C1A] text-[#1C1A17] dark:text-white shadow-2xs font-bold' : 'text-[#736E67] dark:text-[#A6A095]'
            }`}
          >
            Nombre
          </button>
        </div>
      </div>

      {/* Bars List */}
      <div className="space-y-3 flex-1 overflow-y-auto max-h-[360px] pr-1">
        {sortedData.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#918B80]">
            No hay datos para mostrar.
          </div>
        ) : (
          sortedData.map((item, index) => {
            const percentage = ((item.value / totalValue) * 100);
            const barWidthPercent = Math.max(4, (item.value / maxValue) * 100);
            const isSelected = selectedCategories.includes(item.label);

            return (
              <div
                key={item.label}
                onClick={() => onCategoryClick(item.label)}
                className={`group p-2.5 rounded-xl transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#FFF9EC] dark:bg-[#3D2D10] border-[#FDB82F] shadow-xs'
                    : 'hover:bg-[#FAF8F5] dark:hover:bg-[#262320] border-transparent hover:border-[#E8E5DF] dark:hover:border-[#332F2B]'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[11px] font-mono text-[#918B80] w-4">
                      {index + 1}.
                    </span>
                    <span className="font-semibold text-[#1C1A17] dark:text-white truncate group-hover:text-[#E09D1B] transition-colors">
                      {item.label}
                    </span>
                    {isSelected && (
                      <span className="bg-[#FDB82F] text-[#1C1A17] p-0.5 rounded text-[10px]">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-xs font-bold text-[#1C1A17] dark:text-white">
                      {item.value} {item.value === 1 ? 'persona' : 'personas'}
                    </span>
                    <span className="text-[11px] font-medium text-[#736E67] dark:text-[#A6A095] w-12 text-right">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar Track */}
                <div className="h-2.5 w-full bg-[#EFECE6] dark:bg-[#2B2724] rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${barWidthPercent}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      isSelected
                        ? 'bg-[#1C1A17] dark:bg-white'
                        : index === 0
                        ? 'bg-[#FDB82F]'
                        : 'bg-[#FDB82F]/75 group-hover:bg-[#FDB82F]'
                    }`}
                  />
                </div>

                {item.femaleCount !== undefined && item.maleCount !== undefined && (
                  <div className="flex justify-between items-center text-[10px] text-[#918B80] mt-1 px-0.5">
                    <span>♀ {item.femaleCount} Femenino • ♂ {item.maleCount} Masculino</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#E09D1B] font-medium">
                      {isSelected ? 'Quitar filtro' : 'Filtrar por esta comunidad'}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-[#F5F3EE] dark:border-[#2C2926] flex items-center justify-between text-[11px] text-[#918B80]">
        <span>Total comunidades: {data.length}</span>
        <span>Total personas: <strong className="text-[#1C1A17] dark:text-white">{totalValue}</strong></span>
      </div>
    </div>
  );
};
