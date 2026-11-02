import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { FiltersBar } from './components/FiltersBar';
import { MetricCards } from './components/MetricCards';
import { DataTable } from './components/DataTable';
import { TrendLineChart } from './components/Charts/TrendLineChart';
import { CategoryDonutChart } from './components/Charts/CategoryDonutChart';
import { CategoryBarChart } from './components/Charts/CategoryBarChart';
import { fetchRegistros, getAgeGroup, AGE_GROUPS } from './services/registros';
import {
  parseDateString,
  formatIsoDateOnly,
  formatDateDisplay
} from './services/format';
import {
  DashboardFilters,
  KpiSummary,
  RegistroRow,
  SpreadsheetData
} from './types/dashboard';
import { AlertCircle } from 'lucide-react';

const EMPTY_DATA: SpreadsheetData = {
  spreadsheetId: 'neon',
  spreadsheetTitle: 'Neon',
  sheets: [],
  activeSheetTitle: 'integrantes',
  columns: [],
  rows: [],
  lastFetchedAt: new Date(),
};

export default function App() {
  const [data, setData] = useState<SpreadsheetData>(EMPTY_DATA);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  // Dark / Light Mode state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('app-theme');
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('app-theme', next);
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Auto-refresh interval in seconds (default 15 seconds)
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(15);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Dashboard Filters State
  const [filters, setFilters] = useState<DashboardFilters>({
    startDate: null,
    endDate: null,
    selectedSex: [],
    selectedAgeGroups: [],
    selectedCommunities: [],
    minAge: null,
    maxAge: null,
    searchQuery: '',
    dateColumn: 'Fecha/Hora',
    categoryColumn: 'Sexo',
    metricColumn: 'Edad',
  });

  // Fetch registros from Neon (via /api/registros)
  const syncData = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    }

    try {
      const result = await fetchRegistros();
      setData(result);
      hasLoadedRef.current = true;
      setIsLiveConnected(true);
      setErrorMessage(null);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.warn('Sync error:', err);
      setIsLiveConnected(false);
      if (isManual || !hasLoadedRef.current) {
        setErrorMessage('No se pudo sincronizar en este momento. Reintentando automáticamente en segundo plano...');
      }
    } finally {
      if (isManual) {
        setIsRefreshing(false);
      }
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    syncData(false);
  }, [syncData]);

  // Auto-refresh interval effect
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;

    const intervalId = setInterval(() => {
      syncData(false);
    }, autoRefreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [autoRefreshInterval, syncData]);

  // Filtered Rows Calculation
  const filteredRows = useMemo(() => {
    return (data.rows as RegistroRow[]).filter((row: RegistroRow) => {
      // 1. Date Filter (on Fecha/Hora)
      if (filters.startDate || filters.endDate) {
        const parsedDate = row.parsedDate || parseDateString(row['Fecha/Hora']);
        if (parsedDate) {
          const isoDate = formatIsoDateOnly(parsedDate);
          if (filters.startDate && isoDate < filters.startDate) return false;
          if (filters.endDate && isoDate > filters.endDate) return false;
        }
      }

      // 2. Sex Filter
      if (filters.selectedSex.length > 0) {
        const sexVal = String(row.Sexo || '').trim();
        if (!filters.selectedSex.includes(sexVal)) {
          return false;
        }
      }

      // 3. Age Group Filter
      if (filters.selectedAgeGroups.length > 0) {
        const group = row.ageGroup || getAgeGroup(row.Edad || 0);
        if (!filters.selectedAgeGroups.includes(group)) {
          return false;
        }
      }

      // 4. Comunidad Filter
      if (filters.selectedCommunities.length > 0) {
        if (!filters.selectedCommunities.includes(row.Comunidad)) {
          return false;
        }
      }

      // 5. Search Query Filter (Nombre, Teléfono, ID, Comunidad)
      if (filters.searchQuery.trim() !== '') {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchesName = String(row['Nombre completo'] || '').toLowerCase().includes(query);
        const matchesPhone = String(row['Teléfono'] || '').toLowerCase().includes(query);
        const matchesId = String(row.id || '').toLowerCase().includes(query);
        const matchesAge = String(row.Edad || '').includes(query);
        const matchesCommunity = String(row.Comunidad || '').toLowerCase().includes(query);

        if (!matchesName && !matchesPhone && !matchesId && !matchesAge && !matchesCommunity) return false;
      }

      return true;
    });
  }, [data.rows, filters]);

  // Sex options with count
  const sexOptions = useMemo(() => {
    const counts = new Map<string, number>();
    data.rows.forEach((row) => {
      const val = String(row.Sexo || 'No especificado').trim();
      if (val) counts.set(val, (counts.get(val) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [data.rows]);

  // Age group options with count
  const ageGroupOptions = useMemo(() => {
    const counts = new Map<string, number>();
    AGE_GROUPS.forEach(g => counts.set(g, 0));

    data.rows.forEach((row) => {
      const g = row.ageGroup || getAgeGroup(row.Edad || 0);
      counts.set(g, (counts.get(g) || 0) + 1);
    });

    return AGE_GROUPS.map(name => ({
      name,
      count: counts.get(name) || 0,
    }));
  }, [data.rows]);

  // Comunidad options with count (only communities with registros)
  const communityOptions = useMemo(() => {
    const counts = new Map<string, number>();
    data.rows.forEach((row) => {
      const val = String(row.Comunidad || 'Sin comunidad');
      counts.set(val, (counts.get(val) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }, [data.rows]);

  // KPI Summary calculation
  const kpiSummary = useMemo<KpiSummary>(() => {
    const totalRecords = data.rows.length;
    const filteredRecords = filteredRows.length;

    let sumAge = 0;
    let minAge = Infinity;
    let maxAge = -Infinity;
    let validAgeCount = 0;
    let femaleCount = 0;
    let maleCount = 0;
    let minorsCount = 0;
    let adultsCount = 0;

    let earliestDate: Date | null = null;
    let latestDate: Date | null = null;
    let latestRegistrationName = '';
    let latestRegistrationTime = '';
    let maxTimestamp = -Infinity;

    filteredRows.forEach((row) => {
      const age = row.Edad;
      if (typeof age === 'number' && !isNaN(age) && age > 0) {
        sumAge += age;
        validAgeCount++;
        if (age > maxAge) maxAge = age;
        if (age < minAge) minAge = age;
        if (age < 18) minorsCount++;
        else adultsCount++;
      }

      const s = (row.Sexo || '').toLowerCase();
      if (s.includes('fem') || s === 'f') femaleCount++;
      else if (s.includes('masc') || s === 'm') maleCount++;

      const dateObj = row.parsedDate || parseDateString(row['Fecha/Hora']);
      if (dateObj) {
        if (!earliestDate || dateObj < earliestDate) earliestDate = dateObj;
        if (!latestDate || dateObj > latestDate) latestDate = dateObj;

        const ts = dateObj.getTime();
        if (ts > maxTimestamp) {
          maxTimestamp = ts;
          latestRegistrationName = row['Nombre completo'] || row.id || 'Registro';
          latestRegistrationTime = formatDateDisplay(dateObj);
        }
      }
    });

    const averageAge = validAgeCount > 0 ? sumAge / validAgeCount : 0;
    if (minAge === Infinity) minAge = 0;
    if (maxAge === -Infinity) maxAge = 0;

    const femalePercentage = filteredRecords > 0 ? (femaleCount / filteredRecords) * 100 : 0;
    const malePercentage = filteredRecords > 0 ? (maleCount / filteredRecords) * 100 : 0;

    let dateRangeSpan = 'Todo el historial';
    if (earliestDate && latestDate) {
      dateRangeSpan = `${formatDateDisplay(earliestDate)} - ${formatDateDisplay(latestDate)}`;
    }

    return {
      totalRecords,
      filteredRecords,
      averageAge,
      minAge,
      maxAge,
      femaleCount,
      femalePercentage,
      maleCount,
      malePercentage,
      minorsCount,
      adultsCount,
      dateRangeSpan,
      latestRegistrationName,
      latestRegistrationTime,
    };
  }, [filteredRows, data.rows.length]);

  // Trend chart data (group by date)
  const trendData = useMemo(() => {
    const dateMap = new Map<string, { count: number; dateObj: Date; femaleCount: number; maleCount: number }>();

    filteredRows.forEach((row) => {
      const d = row.parsedDate || parseDateString(row['Fecha/Hora']);
      if (!d) return;

      const dateKey = formatIsoDateOnly(d);
      const isFemale = row.Sexo?.toLowerCase().includes('fem') || row.Sexo?.toLowerCase() === 'f';
      const isMale = row.Sexo?.toLowerCase().includes('masc') || row.Sexo?.toLowerCase() === 'm';

      const existing = dateMap.get(dateKey) || {
        count: 0,
        dateObj: d,
        femaleCount: 0,
        maleCount: 0
      };

      existing.count += 1;
      if (isFemale) existing.femaleCount += 1;
      if (isMale) existing.maleCount += 1;

      dateMap.set(dateKey, existing);
    });

    const sortedDates = Array.from(dateMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

    return sortedDates.map(([_, info]) => ({
      label: formatDateDisplay(info.dateObj),
      value: info.count,
      count: info.count,
      femaleCount: info.femaleCount,
      maleCount: info.maleCount,
    }));
  }, [filteredRows]);

  // Donut chart data (distribution by Sexo)
  const sexDonutData = useMemo(() => {
    const counts = new Map<string, number>();

    filteredRows.forEach((row) => {
      const val = String(row.Sexo || 'No especificado').trim();
      counts.set(val, (counts.get(val) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([name, count]) => ({
        label: name,
        value: count,
        count: count,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredRows]);

  // Bar chart data (distribution by Comunidad, with sex breakdown)
  const communityBarData = useMemo(() => {
    const map = new Map<string, { count: number; femaleCount: number; maleCount: number }>();

    filteredRows.forEach((row) => {
      const key = row.Comunidad || 'Sin comunidad';
      const s = (row.Sexo || '').toLowerCase();
      const entry = map.get(key) || { count: 0, femaleCount: 0, maleCount: 0 };
      entry.count += 1;
      if (s.includes('fem')) entry.femaleCount += 1;
      else if (s.includes('masc')) entry.maleCount += 1;
      map.set(key, entry);
    });

    return Array.from(map.entries()).map(([label, info]) => ({
      label,
      value: info.count,
      count: info.count,
      femaleCount: info.femaleCount,
      maleCount: info.maleCount,
    }));
  }, [filteredRows]);

  const toggleCommunity = (community: string) => {
    const next = filters.selectedCommunities.includes(community)
      ? filters.selectedCommunities.filter(c => c !== community)
      : [...filters.selectedCommunities, community];
    setFilters({ ...filters, selectedCommunities: next });
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-[#121110] text-[#F3F1EC]' : 'bg-[#F8F7F4] text-[#1C1A17]'} flex flex-col font-sans transition-colors duration-200 selection:bg-[#FDB82F] selection:text-[#1C1A17]`}>

      {/* Top Application Header (ALWAYS WHITE so the logo is clearly identified) */}
      <Header
        onRefreshClick={() => syncData(true)}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
        autoRefreshInterval={autoRefreshInterval}
        onAutoRefreshChange={setAutoRefreshInterval}
        isLiveConnected={isLiveConnected}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 shadow-xs flex items-start gap-3 text-xs leading-relaxed">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-bold block mb-0.5">Estado de la sincronización</strong>
              {errorMessage}
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="font-bold text-amber-800 dark:text-amber-400 hover:underline shrink-0 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Global Filter Bar for Sexo, Grupos de Edad, Comunidad, Fechas y Búsqueda */}
        <FiltersBar
          filters={filters}
          onFiltersChange={setFilters}
          sexOptions={sexOptions}
          ageGroupOptions={ageGroupOptions}
          communityOptions={communityOptions}
          totalRecordsCount={data.rows.length}
          filteredRecordsCount={filteredRows.length}
        />

        {/* KPI Metric Summary Cards */}
        <MetricCards
          kpi={kpiSummary}
        />

        {/* Listado de Registros */}
        <DataTable
          rows={filteredRows as RegistroRow[]}
          sheetTitle={data.activeSheetTitle}
        />

        {/* Gráficas Interactivas Debajo de la Tabla de Registros */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-stretch">
          <div className="lg:col-span-2">
            <TrendLineChart
              data={trendData}
              metricName="Registros"
            />
          </div>
          <div className="lg:col-span-1">
            <CategoryDonutChart
              data={sexDonutData}
              metricName="Personas"
              categoryColumnName="Sexo"
              isCurrency={false}
              onCategoryClick={(categoryName) => {
                let next: string[];
                if (filters.selectedSex.includes(categoryName)) {
                  next = filters.selectedSex.filter(s => s !== categoryName);
                } else {
                  next = [...filters.selectedSex, categoryName];
                }
                setFilters({ ...filters, selectedSex: next });
              }}
              selectedCategories={filters.selectedSex}
            />
          </div>
        </div>

        {/* Distribución por Comunidad */}
        <div className="mb-10">
          <CategoryBarChart
            data={communityBarData}
            metricName="Personas"
            categoryColumnName="Comunidad"
            selectedCategories={filters.selectedCommunities}
            onCategoryClick={toggleCommunity}
          />
        </div>

      </main>

      {/* Minimalist Dashboard Footer */}
      <footer className="border-t border-[#E8E5DF] dark:border-[#2C2926] bg-white dark:bg-[#1A1816] py-5 text-center text-xs text-[#918B80] dark:text-[#736E67] transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FDB82F]" />
            <span className="font-semibold text-[#1C1A17] dark:text-white">TLS-Dashboard</span>
          </div>
          <div className="text-left sm:text-right text-[11px] leading-tight space-y-1">
            <div className="font-medium text-[#1C1A17] dark:text-white">
              Desarrollado por Rubén Parra
            </div>
            <div className="text-[#918B80] dark:text-[#736E67]">
              Estética Minimalista y Profesional
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
