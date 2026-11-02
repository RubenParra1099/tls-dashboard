import React from 'react';
import { 
  Calendar, 
  Search, 
  X, 
  RotateCcw,
  Users,
  Check,
  Church
} from 'lucide-react';
import { DashboardFilters } from '../types/dashboard';

interface FiltersBarProps {
  filters: DashboardFilters;
  onFiltersChange: (newFilters: DashboardFilters) => void;
  sexOptions: { name: string; count: number }[];
  ageGroupOptions: { name: string; count: number }[];
  communityOptions: { name: string; count: number }[];
  totalRecordsCount: number;
  filteredRecordsCount: number;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  filters,
  onFiltersChange,
  sexOptions,
  ageGroupOptions,
  communityOptions,
  totalRecordsCount,
  filteredRecordsCount,
}) => {
  const applyDatePreset = (preset: 'all' | 'today' | '3d' | '7d' | 'thisMonth') => {
    const today = new Date();
    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    if (preset === 'all') {
      onFiltersChange({ ...filters, startDate: null, endDate: null });
      return;
    }

    let start = new Date(today);
    if (preset === 'today') {
      // today only
    } else if (preset === '3d') {
      start.setDate(today.getDate() - 3);
    } else if (preset === '7d') {
      start.setDate(today.getDate() - 7);
    } else if (preset === 'thisMonth') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    onFiltersChange({
      ...filters,
      startDate: formatDate(start),
      endDate: formatDate(today),
    });
  };

  const toggleSex = (sex: string) => {
    let next: string[];
    if (filters.selectedSex.includes(sex)) {
      next = filters.selectedSex.filter(s => s !== sex);
    } else {
      next = [...filters.selectedSex, sex];
    }
    onFiltersChange({ ...filters, selectedSex: next });
  };

  const toggleAgeGroup = (group: string) => {
    let next: string[];
    if (filters.selectedAgeGroups.includes(group)) {
      next = filters.selectedAgeGroups.filter(g => g !== group);
    } else {
      next = [...filters.selectedAgeGroups, group];
    }
    onFiltersChange({ ...filters, selectedAgeGroups: next });
  };

  const toggleCommunity = (community: string) => {
    const next = filters.selectedCommunities.includes(community)
      ? filters.selectedCommunities.filter(c => c !== community)
      : [...filters.selectedCommunities, community];
    onFiltersChange({ ...filters, selectedCommunities: next });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      ...filters,
      startDate: null,
      endDate: null,
      selectedSex: [],
      selectedAgeGroups: [],
      selectedCommunities: [],
      minAge: null,
      maxAge: null,
      searchQuery: '',
    });
  };

  const hasActiveFilters = Boolean(
    filters.startDate || 
    filters.endDate || 
    filters.selectedSex.length > 0 || 
    filters.selectedAgeGroups.length > 0 ||
    filters.selectedCommunities.length > 0 ||
    filters.searchQuery.trim() !== ''
  );

  return (
    <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl border border-[#E8E5DF] dark:border-[#332F2B] shadow-xs p-4 sm:p-5 mb-6 space-y-4">
      {/* Top Filter Controls Row */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        
        {/* Left: Sex Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-[#736E67] dark:text-[#A6A095] mr-1 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-[#E09D1B]" />
            <span>Sexo:</span>
          </span>

          <button
            onClick={() => onFiltersChange({ ...filters, selectedSex: [] })}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filters.selectedSex.length === 0
                ? 'bg-[#1C1A17] dark:bg-white text-white dark:text-[#1C1A17] shadow-2xs'
                : 'bg-[#F5F4F0] dark:bg-[#2B2724] text-[#736E67] dark:text-[#A6A095] hover:bg-[#EAE7E0] dark:hover:bg-[#38332F] hover:text-[#1C1A17] dark:hover:text-white'
            }`}
          >
            Todos ({totalRecordsCount})
          </button>

          {sexOptions.map((opt) => {
            const isSelected = filters.selectedSex.includes(opt.name);
            return (
              <button
                key={opt.name}
                onClick={() => toggleSex(opt.name)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#FFF6E3] dark:bg-[#3D2D10] border-[#FDB82F] text-[#8F5F00] dark:text-[#FDB82F] shadow-xs'
                    : 'bg-white dark:bg-[#2B2724] border-[#E2DFD8] dark:border-[#38332F] text-[#1C1A17] dark:text-[#EAE6DF] hover:border-[#D1CCC2]'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                <span>{opt.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#F5F4F0] dark:bg-[#1E1C1A] text-[#736E67] dark:text-[#A6A095]">
                  {opt.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#736E67] dark:text-[#A6A095] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono, folio o comunidad..."
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
            className="w-full bg-[#F9F8F5] dark:bg-[#2B2724] border border-[#E2DFD8] dark:border-[#38332F] rounded-xl pl-8 pr-7 py-1.5 text-xs text-[#1C1A17] dark:text-white placeholder:text-[#918B80] dark:placeholder:text-[#8C867B] focus:border-[#FDB82F] focus:bg-white dark:focus:bg-[#1E1C1A] focus:outline-hidden transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFiltersChange({ ...filters, searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#918B80] dark:text-[#A6A095] hover:text-[#1C1A17] dark:hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

      </div>

      {/* Comunidad Filter */}
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#F2EFE9] dark:border-[#2C2926]">
        <span className="text-xs font-bold text-[#736E67] dark:text-[#A6A095] mr-1 flex items-center gap-1">
          <Church className="w-3.5 h-3.5 text-[#E09D1B]" />
          <span>Comunidad:</span>
        </span>
        <select
          aria-label="Filtrar por comunidad"
          value=""
          onChange={(e) => {
            if (e.target.value) toggleCommunity(e.target.value);
          }}
          className="w-full sm:w-auto sm:min-w-72 max-w-full bg-[#F9F8F5] dark:bg-[#2B2724] border border-[#E2DFD8] dark:border-[#38332F] rounded-xl px-2.5 py-1.5 text-xs text-[#1C1A17] dark:text-white font-medium focus:border-[#FDB82F] focus:outline-hidden cursor-pointer"
        >
          <option value="">
            {filters.selectedCommunities.length === 0 ? 'Todas las comunidades' : 'Agregar otra comunidad…'}
          </option>
          {communityOptions
            .filter(opt => !filters.selectedCommunities.includes(opt.name))
            .map(opt => (
              <option key={opt.name} value={opt.name}>
                {opt.name} ({opt.count})
              </option>
            ))}
        </select>
      </div>

      {/* Second Row: Age Groups & Date Range Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F2EFE9] dark:border-[#2C2926]">
        
        {/* Age Groups */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-[#736E67] dark:text-[#A6A095] mr-1">
            Grupo de Edad:
          </span>
          {ageGroupOptions.map((opt) => {
            const isSelected = filters.selectedAgeGroups.includes(opt.name);
            return (
              <button
                key={opt.name}
                onClick={() => toggleAgeGroup(opt.name)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#1C1A17] dark:bg-white border-[#1C1A17] dark:border-white text-white dark:text-[#1C1A17]'
                    : 'bg-[#F9F8F5] dark:bg-[#2B2724] border-[#E2DFD8] dark:border-[#38332F] text-[#4A463F] dark:text-[#D1CCC2] hover:bg-[#F0EDE6] dark:hover:bg-[#38332F]'
                }`}
              >
                <span>{opt.name}</span>
                <span className="ml-1 opacity-70">({opt.count})</span>
              </button>
            );
          })}
        </div>

        {/* Date Filter & Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#F9F8F5] dark:bg-[#2B2724] border border-[#E2DFD8] dark:border-[#38332F] rounded-xl px-2.5 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-[#E09D1B]" />
            <input
              type="date"
              aria-label="Fecha inicial"
              value={filters.startDate || ''}
              onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value || null })}
              className="bg-transparent text-xs text-[#1C1A17] dark:text-white font-medium focus:outline-hidden cursor-pointer"
            />
            <span className="text-[#918B80] dark:text-[#736E67] font-medium">—</span>
            <input
              type="date"
              aria-label="Fecha final"
              value={filters.endDate || ''}
              onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value || null })}
              className="bg-transparent text-xs text-[#1C1A17] dark:text-white font-medium focus:outline-hidden cursor-pointer"
            />
            {(filters.startDate || filters.endDate) && (
              <button
                onClick={() => onFiltersChange({ ...filters, startDate: null, endDate: null })}
                title="Quitar filtro de fechas"
                className="text-[#918B80] hover:text-[#1C1A17] dark:hover:text-white p-0.5 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => applyDatePreset('today')}
              className="px-2 py-1 text-[11px] font-medium rounded-lg bg-[#F5F4F0] dark:bg-[#2B2724] hover:bg-[#EAE7E0] dark:hover:bg-[#38332F] text-[#4A463F] dark:text-[#D1CCC2] cursor-pointer"
            >
              Hoy
            </button>
            <button
              onClick={() => applyDatePreset('7d')}
              className="px-2 py-1 text-[11px] font-medium rounded-lg bg-[#F5F4F0] dark:bg-[#2B2724] hover:bg-[#EAE7E0] dark:hover:bg-[#38332F] text-[#4A463F] dark:text-[#D1CCC2] cursor-pointer"
            >
              7d
            </button>
            <button
              onClick={() => applyDatePreset('all')}
              className="px-2 py-1 text-[11px] font-medium rounded-lg bg-[#F5F4F0] dark:bg-[#2B2724] hover:bg-[#EAE7E0] dark:hover:bg-[#38332F] text-[#4A463F] dark:text-[#D1CCC2] cursor-pointer"
            >
              Todo
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              title="Restablecer filtros"
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpiar</span>
            </button>
          )}
        </div>

      </div>

      {/* Active Filter Badges (without columnas activas label) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F2EFE9] dark:border-[#2C2926] text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[#736E67] dark:text-[#A6A095] font-medium text-[11px]">
            Mostrando <strong className="text-[#1C1A17] dark:text-white font-bold">{filteredRecordsCount}</strong> de {totalRecordsCount} registros
          </span>

          {filters.selectedSex.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 bg-[#FFF6E3] dark:bg-[#3D2D10] text-[#8F5F00] dark:text-[#FDB82F] border border-[#FDE5A3] dark:border-[#574016] px-2 py-0.5 rounded-full text-[11px] font-medium"
            >
              {s}
              <button onClick={() => toggleSex(s)}>
                <X className="w-3 h-3 hover:text-black dark:hover:text-white" />
              </button>
            </span>
          ))}

          {filters.selectedAgeGroups.map((g) => (
            <span
              key={g}
              className="inline-flex items-center gap-1 bg-[#F5F4F0] dark:bg-[#2B2724] text-[#1C1A17] dark:text-white px-2 py-0.5 rounded-full text-[11px] font-medium border border-[#E2DFD8] dark:border-[#38332F]"
            >
              {g}
              <button onClick={() => toggleAgeGroup(g)}>
                <X className="w-3 h-3 hover:text-black dark:hover:text-white" />
              </button>
            </span>
          ))}

          {filters.selectedCommunities.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 bg-[#FFF6E3] dark:bg-[#3D2D10] text-[#8F5F00] dark:text-[#FDB82F] border border-[#FDE5A3] dark:border-[#574016] px-2 py-0.5 rounded-full text-[11px] font-medium"
            >
              {c}
              <button onClick={() => toggleCommunity(c)} title="Quitar comunidad">
                <X className="w-3 h-3 hover:text-black dark:hover:text-white" />
              </button>
            </span>
          ))}

          {(filters.startDate || filters.endDate) && (
            <span className="inline-flex items-center gap-1 bg-[#F5F4F0] dark:bg-[#2B2724] text-[#4A463F] dark:text-[#D1CCC2] px-2 py-0.5 rounded-full text-[11px] font-medium">
              📅 {filters.startDate || 'Inicio'} → {filters.endDate || 'Hoy'}
              <button onClick={() => onFiltersChange({ ...filters, startDate: null, endDate: null })}>
                <X className="w-3 h-3 text-[#736E67] hover:text-black dark:hover:text-white" />
              </button>
            </span>
          )}

          {filters.searchQuery && (
            <span className="inline-flex items-center gap-1 bg-[#F5F4F0] dark:bg-[#2B2724] text-[#4A463F] dark:text-[#D1CCC2] px-2 py-0.5 rounded-full text-[11px] font-medium">
              🔍 "{filters.searchQuery}"
              <button onClick={() => onFiltersChange({ ...filters, searchQuery: '' })}>
                <X className="w-3 h-3 text-[#736E67] hover:text-black dark:hover:text-white" />
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
