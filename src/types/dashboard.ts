export interface SheetInfo {
  sheetId: number;
  title: string;
  rowCount: number;
  columnCount: number;
}

export type ColumnType = 'date' | 'category' | 'numeric' | 'text';

export interface ColumnMeta {
  index: number;
  name: string;
  type: ColumnType;
  uniqueValuesCount: number;
  sampleValues: (string | number)[];
}

export interface SheetRow {
  __id: string;
  __rowIndex: number;
  id?: string;
  'Nombre completo'?: string;
  Edad?: number;
  Sexo?: string;
  'Teléfono'?: string;
  Comunidad?: string;
  'Fecha/Hora'?: string;
  parsedDate?: Date | null;
  ageGroup?: string;
  [key: string]: any;
}

export interface RegistroRow extends SheetRow {
  id: string;
  'Nombre completo': string;
  Edad: number;
  Sexo: string;
  'Teléfono': string;
  Comunidad: string;
  'Fecha/Hora': string;
  parsedDate?: Date | null;
  ageGroup?: string;
}

export interface SpreadsheetData {
  spreadsheetId: string;
  spreadsheetTitle: string;
  sheets: SheetInfo[];
  activeSheetTitle: string;
  columns: ColumnMeta[];
  rows: SheetRow[];
  lastFetchedAt: Date;
}

export interface DashboardFilters {
  startDate: string | null; // YYYY-MM-DD
  endDate: string | null;   // YYYY-MM-DD
  selectedSex: string[];    // 'Femenino', 'Masculino', etc.
  selectedAgeGroups: string[]; // '< 18 años', '18 - 29 años', etc.
  selectedCommunities: string[];
  minAge: number | null;
  maxAge: number | null;
  searchQuery: string;
  dateColumn: string;
  categoryColumn: string;
  metricColumn: string;
  selectedCategories?: string[];
}

export interface ChartPoint {
  label: string;
  value: number;
  count: number;
  percentage?: number;
  color?: string;
  rawDate?: Date;
  femaleCount?: number;
  maleCount?: number;
}

export interface KpiSummary {
  totalRecords: number;
  filteredRecords: number;
  averageAge: number;
  minAge: number;
  maxAge: number;
  femaleCount: number;
  femalePercentage: number;
  maleCount: number;
  malePercentage: number;
  minorsCount: number; // < 18
  adultsCount: number; // >= 18
  dateRangeSpan: string;
  latestRegistrationName: string;
  latestRegistrationTime: string;
}
