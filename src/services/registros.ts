import { ColumnMeta, RegistroRow, SpreadsheetData } from '../types/dashboard';

export const AGE_GROUPS = ['< 18 años', '18 - 29 años', '30 - 39 años', '40 - 49 años', '50 - 59 años', '60+ años'];

export const getAgeGroup = (age: number): string => {
  if (age < 18) return AGE_GROUPS[0];
  if (age <= 29) return AGE_GROUPS[1];
  if (age <= 39) return AGE_GROUPS[2];
  if (age <= 49) return AGE_GROUPS[3];
  if (age <= 59) return AGE_GROUPS[4];
  return AGE_GROUPS[5];
};

const COLUMNS: ColumnMeta[] = [
  { index: 0, name: 'id', type: 'text', uniqueValuesCount: 0, sampleValues: [] },
  { index: 1, name: 'Nombre completo', type: 'text', uniqueValuesCount: 0, sampleValues: [] },
  { index: 2, name: 'Edad', type: 'numeric', uniqueValuesCount: 0, sampleValues: [] },
  { index: 3, name: 'Sexo', type: 'category', uniqueValuesCount: 0, sampleValues: [] },
  { index: 4, name: 'Teléfono', type: 'text', uniqueValuesCount: 0, sampleValues: [] },
  { index: 5, name: 'Comunidad', type: 'category', uniqueValuesCount: 0, sampleValues: [] },
  { index: 6, name: 'Fecha/Hora', type: 'date', uniqueValuesCount: 0, sampleValues: [] },
];

const formatCdmx = new Intl.DateTimeFormat('es-MX', {
  timeZone: 'America/Mexico_City',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

interface ApiRegistro {
  folio: string;
  nombre_completo: string;
  edad: number;
  sexo: string;
  telefono: string;
  comunidad: string | null;
  registrado_en: string;
}

// Lee los registros de Neon a través de /api/registros
export async function fetchRegistros(): Promise<SpreadsheetData> {
  const response = await fetch('/api/registros', { cache: 'no-store' });
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.status !== 'success') {
    throw new Error(result?.message || `Error en el servidor (${response.status})`);
  }

  const rows: RegistroRow[] = (result.data as ApiRegistro[]).map((r, idx) => {
    const parsedDate = new Date(r.registrado_en);
    return {
      __id: r.folio,
      __rowIndex: idx,
      id: r.folio,
      'Nombre completo': r.nombre_completo,
      Edad: Number(r.edad),
      Sexo: r.sexo,
      'Teléfono': r.telefono,
      Comunidad: r.comunidad || 'Sin comunidad',
      'Fecha/Hora': formatCdmx.format(parsedDate),
      parsedDate,
      ageGroup: getAgeGroup(Number(r.edad)),
    };
  });

  return {
    spreadsheetId: 'neon',
    spreadsheetTitle: 'Neon',
    sheets: [],
    activeSheetTitle: 'integrantes',
    columns: COLUMNS,
    rows,
    lastFetchedAt: new Date(),
  };
}
