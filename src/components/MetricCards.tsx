import React from 'react';
import { 
  Users, 
  TrendingUp, 
  UserMinus 
} from 'lucide-react';
import { KpiSummary } from '../types/dashboard';

interface MetricCardsProps {
  kpi: KpiSummary;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ kpi }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 mb-6">
      
      {/* 1. Total Registros */}
      <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-4 border border-[#E8E5DF] dark:border-[#332F2B] shadow-xs relative overflow-hidden group hover:border-[#FDB82F] dark:hover:border-[#FDB82F] transition-all">
        <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-bl from-[#FFF6E3] dark:from-[#3D2D10]/30 to-transparent rounded-bl-3xl -z-0 pointer-events-none" />
        <div className="flex items-center justify-between mb-1.5 z-10 relative">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#736E67] dark:text-[#A6A095] truncate">
            Total Registros
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#FFF4DC] dark:bg-[#3D2D10] text-[#9A6A00] dark:text-[#FDB82F] flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-[#1C1A17] dark:text-white tracking-tight truncate z-10 relative">
          {kpi.filteredRecords}
        </div>
        <div className="mt-1 text-[11px] text-[#736E67] dark:text-[#8C867B] z-10 relative truncate">
          {kpi.totalRecords > 0 && kpi.filteredRecords !== kpi.totalRecords ? (
            <span className="text-[#9A6A00] dark:text-[#FDB82F] font-medium">
              {((kpi.filteredRecords / kpi.totalRecords) * 100).toFixed(0)}% del total ({kpi.totalRecords})
            </span>
          ) : (
            <span>100% de la hoja activa</span>
          )}
        </div>
      </div>

      {/* 2. Edad Media */}
      <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-4 border border-[#E8E5DF] dark:border-[#332F2B] shadow-xs relative overflow-hidden group hover:border-[#FDB82F] dark:hover:border-[#FDB82F] transition-all">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#736E67] dark:text-[#A6A095] truncate">
            Edad Media
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#F5F4F0] dark:bg-[#2B2724] text-[#1C1A17] dark:text-white flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-[#736E67] dark:text-[#A6A095]" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-[#1C1A17] dark:text-white tracking-tight">
          {kpi.averageAge > 0 ? `${kpi.averageAge.toFixed(1)}` : '0'}
          <span className="text-sm font-semibold text-[#736E67] dark:text-[#A6A095] ml-1">años</span>
        </div>
        <div className="mt-1 text-[11px] text-[#736E67] dark:text-[#8C867B] truncate font-medium">
          Mín: {kpi.minAge} | Máx: {kpi.maxAge} años
        </div>
      </div>

      {/* 3. Mujeres / Femenino */}
      <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-4 border border-[#E8E5DF] dark:border-[#332F2B] shadow-xs relative overflow-hidden group hover:border-[#FDB82F] dark:hover:border-[#FDB82F] transition-all">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#736E67] dark:text-[#A6A095] truncate">
            Femenino
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#FFF4DC] dark:bg-[#3D2D10] text-[#9A6A00] dark:text-[#FDB82F] flex items-center justify-center font-bold text-xs">
            ♀
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-[#1C1A17] dark:text-white tracking-tight truncate">
          {kpi.femaleCount}
          <span className="text-xs font-semibold text-[#9A6A00] dark:text-[#FDB82F] ml-1.5">
            ({kpi.femalePercentage.toFixed(0)}%)
          </span>
        </div>
        <div className="mt-1 text-[11px] text-[#8C867B] truncate">
          mujeres registradas
        </div>
      </div>

      {/* 4. Hombres / Masculino */}
      <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl p-4 border border-[#E8E5DF] dark:border-[#332F2B] shadow-xs relative overflow-hidden group hover:border-[#FDB82F] dark:hover:border-[#FDB82F] transition-all">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#736E67] dark:text-[#A6A095] truncate">
            Masculino
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#F5F4F0] dark:bg-[#2B2724] text-[#1C1A17] dark:text-white flex items-center justify-center font-bold text-xs">
            ♂
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-[#1C1A17] dark:text-white tracking-tight truncate">
          {kpi.maleCount}
          <span className="text-xs font-semibold text-[#736E67] dark:text-[#A6A095] ml-1.5">
            ({kpi.malePercentage.toFixed(0)}%)
          </span>
        </div>
        <div className="mt-1 text-[11px] text-[#8C867B] truncate">
          hombres registrados
        </div>
      </div>

      {/* 5. Menores vs Adultos */}
      <div className="col-span-2 sm:col-span-1 bg-white dark:bg-[#1E1C1A] rounded-2xl p-4 border border-[#E8E5DF] dark:border-[#332F2B] shadow-xs relative overflow-hidden group hover:border-[#FDB82F] dark:hover:border-[#FDB82F] transition-all">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#736E67] dark:text-[#A6A095] truncate">
            Menores de Edad
          </span>
          <div className="w-7 h-7 rounded-lg bg-[#F5F4F0] dark:bg-[#2B2724] text-[#1C1A17] dark:text-white flex items-center justify-center">
            <UserMinus className="w-4 h-4 text-[#736E67] dark:text-[#A6A095]" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-[#1C1A17] dark:text-white tracking-tight">
          {kpi.minorsCount}
          <span className="text-xs font-normal text-[#736E67] dark:text-[#A6A095] ml-1.5">
            / {kpi.adultsCount} ad.
          </span>
        </div>
        <div className="mt-1 text-[11px] text-[#8C867B] truncate">
          {kpi.filteredRecords > 0 ? `${((kpi.minorsCount / kpi.filteredRecords) * 100).toFixed(0)}% son < 18 años` : '0%'}
        </div>
      </div>

    </div>
  );
};
