import { OcupacionTurnos } from '../turnos.js';

export interface ParkingSlotDTO{
    ID?:string
    Title : string,
    TipoCelda: "Carro"| "Moto"
    Itinerancia : "Empleado Itinerante" | "Directivo" | "Empleado Fijo"
    Activa :"Inactiva" | "Activa"
    Ocupacion?: OcupacionTurnos
}

export interface ParkingSlotDeactivateDTO{
    ID?:string
    Title? : string,
    TipoCelda? : "Carro"| "Moto"
    Itinerancia? : "Empleado Itinerante" | "Directivo" | "Empleado Fijo"
    Activa? :"Inactiva" | "Activa"
}