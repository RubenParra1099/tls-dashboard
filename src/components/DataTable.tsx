import React, { useState, useMemo } from 'react';
import { RegistroRow } from '../types/dashboard';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Phone,
  Copy,
  Check,
  Calendar,
  MessageCircle
} from 'lucide-react';

interface DataTableProps {
  rows: RegistroRow[];
  sheetTitle: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  rows,
}) => {
  const [sortColumn, setSortColumn] = useState<string | null>('Fecha/Hora');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const handleSort = (colName: string) => {
    if (sortColumn === colName) {
      if (sortDirection === 'desc') {
        setSortDirection('asc');
      } else {
        setSortColumn(null);
      }
    } else {
      setSortColumn(colName);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const sortedRows = useMemo(() => {
    if (!sortColumn) return rows;
    return [...rows].sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined || valA === '') return 1;
      if (valB === null || valB === undefined || valB === '') return -1;

      if (sortColumn === 'Edad') {
        return sortDirection === 'asc' ? (a.Edad || 0) - (b.Edad || 0) : (b.Edad || 0) - (a.Edad || 0);
      }

      if (sortColumn === 'Fecha/Hora') {
        const timeA = a.parsedDate ? a.parsedDate.getTime() : new Date(a['Fecha/Hora']).getTime() || 0;
        const timeB = b.parsedDate ? b.parsedDate.getTime() : new Date(b['Fecha/Hora']).getTime() || 0;
        return sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [rows, sortColumn, sortDirection]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  // Copy phone number to clipboard
  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 1500);
  };

  // Export to CSV with the 7 columns
  const exportToCSV = () => {
    if (sortedRows.length === 0) return;

    const exportCols = ['Folio', 'Nombre completo', 'Edad', 'Sexo', 'Teléfono', 'Comunidad', 'Fecha/Hora (CDMX)'];
    const csvHeader = exportCols.join(',');

    const csvRows = sortedRows.map(row => {
      return [
        `"${String(row.id || '').replace(/"/g, '""')}"`,
        `"${String(row['Nombre completo'] || '').replace(/"/g, '""')}"`,
        `"${row.Edad ?? ''}"`,
        `"${String(row.Sexo || '').replace(/"/g, '""')}"`,
        `"${String(row['Teléfono'] || '').replace(/"/g, '""')}"`,
        `"${String(row.Comunidad || '').replace(/"/g, '""')}"`,
        `"${String(row['Fecha/Hora'] || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    // El BOM (\uFEFF) hace que Excel respete los acentos
    const csvContent = '\uFEFF' + [csvHeader, ...csvRows].join('\r\n');
    const url = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `registro_emaus_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (parts[0]?.[0] || 'U').toUpperCase();
  };

  return (
    <div className="bg-white dark:bg-[#1E1C1A] rounded-2xl border border-[#E8E5DF] dark:border-[#332F2B] shadow-xs overflow-hidden flex flex-col mb-10 transition-colors">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-[#E8E5DF] dark:border-[#332F2B] flex flex-wrap items-center justify-between gap-3 bg-[#FAF9F6] dark:bg-[#25221F]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FDB82F]" />
            <h3 className="text-sm font-bold text-[#1C1A17] dark:text-white">
              Listado de Registros ({rows.length})
            </h3>
          </div>
          <p className="text-xs text-[#736E67] dark:text-[#A6A095] mt-0.5">
            Mostrando participantes registrados en tiempo real
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Page size selector */}
          <div className="flex items-center gap-1.5 text-xs text-[#736E67] dark:text-[#A6A095]">
            <span>Filas:</span>
            <select
              aria-label="Filas por página"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white dark:bg-[#2B2724] border border-[#E2DFD8] dark:border-[#38332F] rounded-lg px-2 py-1 text-xs text-[#1C1A17] dark:text-white font-medium focus:outline-hidden cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Export to CSV */}
          <button
            onClick={exportToCSV}
            disabled={rows.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1C1A17] dark:text-white bg-white dark:bg-[#2B2724] border border-[#E2DFD8] dark:border-[#38332F] hover:border-[#FDB82F] hover:bg-[#FFFDF7] dark:hover:bg-[#38332F] rounded-xl transition-all shadow-2xs active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#E09D1B]" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Table Responsive Container */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F6F5F2] dark:bg-[#272421] border-b border-[#E8E5DF] dark:border-[#332F2B] text-[#736E67] dark:text-[#A6A095]">
              <th className="py-3 px-3.5 font-bold uppercase tracking-wider text-[10px] w-12 text-center text-[#918B80] dark:text-[#736E67]">
                #
              </th>
              
              {/* ID */}
              <th 
                onClick={() => handleSort('id')}
                className="py-3 px-3.5 font-bold uppercase tracking-wider text-[10px] cursor-pointer hover:bg-[#EFECE6] dark:hover:bg-[#332F2B] transition-colors select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>ID</span>
                  {sortColumn === 'id' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#E09D1B]" /> : <ArrowDown className="w-3 h-3 text-[#E09D1B]" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-30" />
                  )}
                </div>
              </th>

              {/* Nombre completo */}
              <th 
                onClick={() => handleSort('Nombre completo')}
                className="py-3 px-3.5 font-bold uppercase tracking-wider text-[10px] cursor-pointer hover:bg-[#EFECE6] dark:hover:bg-[#332F2B] transition-colors select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Nombre completo</span>
                  {sortColumn === 'Nombre completo' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#E09D1B]" /> : <ArrowDown className="w-3 h-3 text-[#E09D1B]" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-30" />
                  )}
                </div>
              </th>

              {/* Edad */}
              <th 
                onClick={() => handleSort('Edad')}
                className="py-3 px-3.5 font-bold uppercase tracking-wider text-[10px] cursor-pointer hover:bg-[#EFECE6] dark:hover:bg-[#332F2B] transition-colors select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Edad</span>
                  {sortColumn === 'Edad' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#E09D1B]" /> : <ArrowDown className="w-3 h-3 text-[#E09D1B]" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-30" />
                  )}
                </div>
              </th>

              {/* Sexo */}
              <th 
                onClick={() => handleSort('Sexo')}
                className="py-3 px-3.5 font-bold uppercase tracking-wider text-[10px] cursor-pointer hover:bg-[#EFECE6] dark:hover:bg-[#332F2B] transition-colors select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Sexo</span>
                  {sortColumn === 'Sexo' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#E09D1B]" /> : <ArrowDown className="w-3 h-3 text-[#E09D1B]" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-30" />
                  )}
                </div>
              </th>

              {/* Teléfono */}
              <th 
                className="py-3 px-3.5 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap"
              >
                <span>Teléfono</span>
              </th>

              {/* Comunidad */}
              <th
                onClick={() => handleSort('Comunidad')}
                className="py-3 px-3.5 font-bold uppercase tracking-wider text-[10px] cursor-pointer hover:bg-[#EFECE6] dark:hover:bg-[#332F2B] transition-colors select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Comunidad</span>
                  {sortColumn === 'Comunidad' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#E09D1B]" /> : <ArrowDown className="w-3 h-3 text-[#E09D1B]" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-30" />
                  )}
                </div>
              </th>

              {/* Fecha/Hora */}
              <th 
                onClick={() => handleSort('Fecha/Hora')}
                className="py-3 px-3.5 font-bold uppercase tracking-wider text-[10px] cursor-pointer hover:bg-[#EFECE6] dark:hover:bg-[#332F2B] transition-colors select-none whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>Fecha / Hora</span>
                  {sortColumn === 'Fecha/Hora' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-[#E09D1B]" /> : <ArrowDown className="w-3 h-3 text-[#E09D1B]" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-30" />
                  )}
                </div>
              </th>

            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2EFE9] dark:divide-[#2C2926]">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={8}className="py-12 text-center text-xs text-[#918B80] dark:text-[#736E67]">
                  No hay registros que coincidan con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, idx) => {
                const rowNum = (currentPage - 1) * pageSize + idx + 1;
                const isMinor = row.Edad < 18;
                const isFemale = row.Sexo?.toLowerCase().includes('fem') || row.Sexo?.toLowerCase() === 'f';

                return (
                  <tr
                    key={row.__id || row.id || idx}
                    className="hover:bg-[#FFFDF7] dark:hover:bg-[#262320] transition-colors group"
                  >
                    {/* # Index */}
                    <td className="py-3 px-3.5 text-center text-[11px] font-mono text-[#918B80] dark:text-[#736E67]">
                      {rowNum}
                    </td>

                    {/* ID */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-[#1C1A17] dark:text-[#FDB82F] bg-[#F5F4F0] dark:bg-[#2B2724] px-2 py-0.5 rounded-md border border-[#E8E5DF] dark:border-[#38332F]">
                        {row.id || '-'}
                      </span>
                    </td>

                    {/* Nombre completo */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                          isFemale 
                            ? 'bg-[#FFF4DC] dark:bg-[#3D2D10] text-[#9A6A00] dark:text-[#FDB82F]' 
                            : 'bg-[#1C1A17] dark:bg-white text-[#FDB82F] dark:text-[#1C1A17]'
                        }`}>
                          {getInitials(row['Nombre completo'])}
                        </div>
                        <span className="font-semibold text-[#1C1A17] dark:text-white group-hover:text-[#E09D1B] dark:group-hover:text-[#FDB82F] transition-colors">
                          {row['Nombre completo']}
                        </span>
                      </div>
                    </td>

                    {/* Edad */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#1C1A17] dark:text-white text-xs">
                          {row.Edad}
                        </span>
                        <span className="text-[10px] text-[#736E67] dark:text-[#A6A095]">años</span>
                        {isMinor ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-medium border border-amber-200 dark:border-amber-900/60">
                            Menor
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium border border-emerald-200 dark:border-emerald-900/60">
                            Adulto
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Sexo */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        isFemale
                          ? 'bg-[#FFF6E3] dark:bg-[#3D2D10] text-[#8F5F00] dark:text-[#FDB82F] border-[#FDE5A3] dark:border-[#574016]'
                          : 'bg-[#F4F4F5] dark:bg-[#272421] text-[#27272A] dark:text-[#D1CCC2] border-[#E4E4E7] dark:border-[#38332F]'
                      }`}>
                        <span>{isFemale ? '♀' : '♂'}</span>
                        <span>{row.Sexo || 'N/A'}</span>
                      </span>
                    </td>

                    {/* Teléfono */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${String(row['Teléfono'] || '').replace(/\D/g, '')}`}
                          className="font-mono text-xs text-[#1C1A17] dark:text-white hover:text-[#E09D1B] dark:hover:text-[#FDB82F] font-medium hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-[#736E67] dark:text-[#8C867B]" />
                          <span>{row['Teléfono'] || '-'}</span>
                        </a>

                        {row['Teléfono'] && (
                          <button
                            onClick={() => handleCopyPhone(row['Teléfono'])}
                            title="Copiar teléfono"
                            className="p-1 rounded text-[#918B80] dark:text-[#8C867B] hover:text-[#1C1A17] dark:hover:text-white hover:bg-[#F5F4F0] dark:hover:bg-[#332F2B] transition-colors cursor-pointer"
                          >
                            {copiedPhone === row['Teléfono'] ? (
                              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}

                        {row['Teléfono'] && (
                          <a
                            href={`https://wa.me/52${String(row['Teléfono']).replace(/\D/g, '').slice(-10)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Mandar mensaje de WhatsApp"
                            className="p-1 rounded text-[#128C4A] dark:text-[#25D366] hover:bg-[#25D366]/15 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Comunidad */}
                    <td className="py-3 px-3.5 min-w-[180px] text-xs text-[#1C1A17] dark:text-[#EAE6DF] font-medium">
                      {row.Comunidad || '-'}
                    </td>

                    {/* Fecha/Hora */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-[#4A463F] dark:text-[#D1CCC2] font-mono">
                        <Calendar className="w-3 h-3 text-[#918B80] dark:text-[#736E67]" />
                        <span>{row['Fecha/Hora']}</span>
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 sm:p-4 border-t border-[#E8E5DF] dark:border-[#332F2B] bg-[#FAF9F6] dark:bg-[#25221F] flex items-center justify-between text-xs text-[#736E67] dark:text-[#A6A095]">
        <div>
          Mostrando registro{' '}
          <strong className="text-[#1C1A17] dark:text-white">
            {rows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </strong>{' '}
          a{' '}
          <strong className="text-[#1C1A17] dark:text-white">
            {Math.min(currentPage * pageSize, rows.length)}
          </strong>{' '}
          de <strong className="text-[#1C1A17] dark:text-white">{rows.length}</strong>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-[#E2DFD8] dark:border-[#38332F] bg-white dark:bg-[#2B2724] text-[#1C1A17] dark:text-white hover:bg-[#F5F4F0] dark:hover:bg-[#332F2B] disabled:opacity-40 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="px-2 font-medium">
            Página {currentPage} de {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-[#E2DFD8] dark:border-[#38332F] bg-white dark:bg-[#2B2724] text-[#1C1A17] dark:text-white hover:bg-[#F5F4F0] dark:hover:bg-[#332F2B] disabled:opacity-40 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
