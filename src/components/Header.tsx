import React from 'react';
import { 
  RefreshCw, 
  Sun, 
  Moon 
} from 'lucide-react';

interface HeaderProps {
  onRefreshClick: () => void;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  autoRefreshInterval: number; // in seconds
  onAutoRefreshChange: (seconds: number) => void;
  isLiveConnected: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onRefreshClick,
  isRefreshing,
  lastUpdated,
  autoRefreshInterval,
  onAutoRefreshChange,
  isLiveConnected,
  theme,
  onToggleTheme,
}) => {
  const getRelativeTime = (date: Date | null) => {
    if (!date) return 'Sin sincronizar';
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 5) return 'Recién sincronizado';
    if (seconds < 60) return `Hace ${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Hace ${minutes}m`;
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    // Header is ALWAYS white to ensure the logo image is perfectly visible and clear
    <header className="sticky top-0 z-30 bg-white border-b border-[#E8E5DF] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo & Brand Title */}
          <div className="flex items-center gap-3.5 min-w-0">
            {/* White background container so the logo image is 100% clearly identified */}
            <div className="relative flex items-center justify-center p-1 bg-white rounded-xl shrink-0">
              <img 
                src="/logo.png" 
                alt="Logo Parroquia de Todos los Santos" 
                className="h-11 w-auto object-contain max-w-[140px]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#1C1A17] truncate">
                  TLS-Dashboard
                </h1>
                <span 
                  title={isLiveConnected ? 'En vivo' : 'Sincronizando'}
                  className={`inline-flex items-center justify-center p-1.5 rounded-full border transition-all ${
                    isLiveConnected
                      ? 'bg-[#EBFBF0] border-[#BBF7D0]'
                      : 'bg-[#FFF4DC] border-[#FDE5A3]'
                  }`}
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isLiveConnected ? 'bg-[#16A34A]' : 'bg-[#D97706]'
                    }`} />
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                      isLiveConnected ? 'bg-[#16A34A]' : 'bg-[#D97706]'
                    }`} />
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Live Indicator & Auto-refresh interval */}
            <div className="hidden md:flex items-center gap-2 bg-[#F8F7F4] border border-[#E8E5DF] px-2.5 py-1.5 rounded-xl text-xs">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${autoRefreshInterval > 0 ? 'bg-[#FDB82F]' : 'bg-gray-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${autoRefreshInterval > 0 ? 'bg-[#FDB82F]' : 'bg-gray-400'}`}></span>
              </span>
              <span className="text-[#736E67] font-medium text-[11px]">
                {autoRefreshInterval > 0 ? 'En vivo' : 'Pausado'}
              </span>
              <select
                aria-label="Frecuencia de sincronización"
                value={autoRefreshInterval}
                onChange={(e) => onAutoRefreshChange(Number(e.target.value))}
                className="bg-white border border-[#E0DCD3] rounded px-1.5 py-0.5 text-[11px] text-[#1C1A17] font-medium focus:outline-hidden cursor-pointer"
              >
                <option value={15}>Cada 15s</option>
                <option value={30}>Cada 30s</option>
                <option value={60}>Cada 1m</option>
                <option value={300}>Cada 5m</option>
                <option value={0}>Manual</option>
              </select>
              <span className="text-[10px] text-[#918B80] pl-1 border-l border-[#E8E5DF]">
                {getRelativeTime(lastUpdated)}
              </span>
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={onRefreshClick}
              disabled={isRefreshing}
              title="Actualizar datos en tiempo real"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1C1A17] bg-white border border-[#E0DCD3] hover:border-[#FDB82F] hover:bg-[#FFFDF7] rounded-xl transition-all shadow-2xs active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#E09D1B] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#1C1A17] bg-white border border-[#E0DCD3] hover:border-[#FDB82F] hover:bg-[#FFFDF7] rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#FDB82F]" />
                  <span className="text-[11px] font-medium hidden sm:inline">Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#4A463F]" />
                  <span className="text-[11px] font-medium hidden sm:inline">Modo Oscuro</span>
                </>
              )}
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
