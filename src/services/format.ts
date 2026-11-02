// Utilidades de fechas y números para el dashboard
// Check if string represents a date
export const parseDateString = (val: any): Date | null => {
  if (!val) return null;
  if (val instanceof Date && !isNaN(val.getTime())) return val;
  const str = String(val).trim();
  if (str.length < 4) return null;

  // Try standard Date parsing
  const d = new Date(str);
  if (!isNaN(d.getTime()) && d.getFullYear() > 1990 && d.getFullYear() < 2100) {
    return d;
  }

  // Try DD/MM/YYYY or DD-MM-YYYY format
  const ddmmyyyy = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(.*)$/);
  if (ddmmyyyy) {
    const day = parseInt(ddmmyyyy[1], 10);
    const month = parseInt(ddmmyyyy[2], 10) - 1;
    const year = parseInt(ddmmyyyy[3], 10);
    const parsed = new Date(year, month, day);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  // Try YYYY/MM/DD
  const yyyymmdd = str.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})(.*)$/);
  if (yyyymmdd) {
    const year = parseInt(yyyymmdd[1], 10);
    const month = parseInt(yyyymmdd[2], 10) - 1;
    const day = parseInt(yyyymmdd[3], 10);
    const parsed = new Date(year, month, day);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  return null;
};

export const formatDateDisplay = (dateInput: any): string => {
  const d = parseDateString(dateInput);
  if (!d) return String(dateInput || '-');
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const formatIsoDateOnly = (dateInput: any): string => {
  const d = parseDateString(dateInput);
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const formatCurrencyOrNumber = (val: number, isCurrency = true): string => {
  if (val === null || val === undefined || isNaN(val)) return '$0';
  if (Math.abs(val) >= 1_000_000) {
    return `${isCurrency ? '$' : ''}${(val / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(val) >= 10_000) {
    return `${isCurrency ? '$' : ''}${(val / 1_000).toFixed(1)}k`;
  }
  return new Intl.NumberFormat('es-MX', {
    style: isCurrency ? 'currency' : 'decimal',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(val);
};
