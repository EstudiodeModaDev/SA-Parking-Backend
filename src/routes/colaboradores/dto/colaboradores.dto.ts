export interface ColaboradorFijoDTO{
    ID? : string
    Title :string
    Correo :string
    TipoVehiculo: "Carro" | "Moto"
    Placa:string
    CodigoCelda?: string | null
    SpotAsignado?: string | null
}