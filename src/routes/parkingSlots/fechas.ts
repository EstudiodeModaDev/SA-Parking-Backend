const ZONA_HORARIA = 'America/Bogota';

// en-CA formatea como YYYY-MM-DD
const formatoDia = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA_HORARIA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

// normaliza una fecha a YYYY-MM-DD en hora de Colombia, o null si no es valida.
// SharePoint devuelve las columnas de fecha en UTC (ej. 2026-09-25T05:00:00Z),
// por eso las fechas con hora se convierten a la zona local antes de tomar el dia
export function normalizarFecha(value: any): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const texto = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    return isNaN(Date.parse(texto)) ? null : texto;
  }
  const fecha = new Date(texto);
  if (isNaN(fecha.getTime())) return null;
  return formatoDia.format(fecha);
}

export function fechaHoy(): string {
  return formatoDia.format(new Date());
}
