export interface ReservasDTO{
    ID? : string
    Title : string //UserEmail
    Creadopor: string
    NombreUsuario:string
    Turn : "Manana" | "Tarde" | "Día completo"
    SpotId : string
    Status : "Terminada" | "Activa" | "Cancelada"
    VehicleType : "Carro" | "Moto"
    Date : String
    Creado : string
    Codigo : String
    Notify : boolean
}
