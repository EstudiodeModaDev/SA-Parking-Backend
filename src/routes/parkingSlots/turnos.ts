export type Turno = 'Manana' | 'Tarde' | 'Día completo';

export const TURNOS: Array<Turno> = ['Manana', 'Tarde', 'Día completo'];

export interface OcupacionTurnos {
  Manana: boolean;
  Tarde: boolean;
}

export function esTurnoValido(turn: any): turn is Turno {
  return TURNOS.includes(turn);
}

// "Día completo" ocupa la manana y la tarde
export function ocuparTurno(ocupacion: OcupacionTurnos, turn: string) {
  if (turn === 'Manana' || turn === 'Día completo') ocupacion.Manana = true;
  if (turn === 'Tarde' || turn === 'Día completo') ocupacion.Tarde = true;
}

export function turnoDisponible(ocupacion: OcupacionTurnos | undefined, turn: Turno): boolean {
  if (!ocupacion) return true;
  if (turn === 'Manana') return !ocupacion.Manana;
  if (turn === 'Tarde') return !ocupacion.Tarde;
  return !ocupacion.Manana && !ocupacion.Tarde;
}
