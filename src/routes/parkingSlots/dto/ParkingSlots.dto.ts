export interface ParkingSlotDTO{
    ID?:string
    Title : string,
    TipoCelda: "Carro"| "Moto"
    Itinerancia : "Empleado Itinerante" | "Directivo" | "Empleado Fijo"
    Activa :"Inactiva" | "Activa"
}