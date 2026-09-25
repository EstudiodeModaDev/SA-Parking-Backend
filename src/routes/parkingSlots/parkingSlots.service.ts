import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { GraphRestService } from "../../common/graph/graphRest.service.js";
import { ConfigService } from "@nestjs/config";
import { ParkingSlotDTO } from "./dto/ParkingSlots.dto.js";
import { ParkingSlotDeactivateDTO } from "./dto/ParkingSlots.dto.js";
import { OcupacionTurnos, ocuparTurno } from "./turnos.js";
import { normalizarFecha } from "./fechas.js";
@Injectable()
export class ParkingSlotsService{
    private listName:string
    private reservasListName:string
    constructor (private readonly graphRestService : GraphRestService, private readonly configService : ConfigService){
        this.listName = String(configService.get('PARKING_SLOTS_LIST_NAME'))
        this.reservasListName = String(configService.get('RESERVAS_LIST_NAME'))
    }

    // date en formato YYYY-MM-DD; la ocupacion solo considera las reservas de ese dia
    async getParkingSlots(graphToken: string, date: string): Promise<Array<ParkingSlotDTO>>{
        const [response, ocupacion] = await Promise.all([
            this.graphRestService.getFiltred(graphToken,this.listName,[{field : "Activa", value: "Activa" }]),
            this.getOcupacion(graphToken, date),
        ])
        const array = Array.isArray(response?.value) ? response.value : [];
        return array.map((x: any) => {
            const slot = this.toModel(x)
            slot.Ocupacion = ocupacion.get(slot.Title) ?? { Manana: false, Tarde: false }
            return slot
        });
        
    }

    async getSlotByTitle(graphToken: string, title: string, date: string): Promise<ParkingSlotDTO | null>{
        const [response, ocupacion] = await Promise.all([
            this.graphRestService.getFiltred(graphToken,this.listName,[{field : "Title", value: title }]),
            this.getOcupacion(graphToken, date, title),
        ])
        const array = Array.isArray(response?.value) ? response.value : [];
        if(array.length === 0) return null
        const slot = this.toModel(array[0])
        slot.Ocupacion = ocupacion.get(slot.Title) ?? { Manana: false, Tarde: false }
        return slot
    }

    // ocupacion por turno de cada celda segun las reservas activas del dia indicado (SpotId = Title de la celda)
    private async getOcupacion(graphToken: string, date: string, spotId?: string): Promise<Map<string, OcupacionTurnos>>{
        const filters = [{ field: "Status", value: "Activa" }]
        if(spotId) filters.push({ field: "SpotId", value: spotId })
        const response = await this.graphRestService.getFiltred(graphToken, this.reservasListName, filters)
        const array = Array.isArray(response?.value) ? response.value : [];
        const ocupacion = new Map<string, OcupacionTurnos>()
        for(const item of array){
            const f = item?.fields ?? {}
            if(!f.SpotId) continue
            // la fecha se compara aqui y no en el filtro OData porque SharePoint la guarda en UTC
            if(normalizarFecha(f.Date) !== date) continue
            const actual = ocupacion.get(f.SpotId) ?? { Manana: false, Tarde: false }
            ocuparTurno(actual, f.Turn)
            ocupacion.set(f.SpotId, actual)
        }
        return ocupacion
    }

    async createSlot(graphToken:string, data : ParkingSlotDTO){
        const response = await this.graphRestService.create(graphToken,data, this.listName)
        return response
    }

    // antes de eliminar la celda se cancelan sus reservas activas, para que no queden apuntando a una celda que no existe
    async deleteSlot(graphToken:string, id:string){
        let item: any
        try{
            item = await this.graphRestService.get(graphToken, this.listName, id)
        }catch(error: any){
            if(error?.response?.status === 404) throw new HttpException(`La celda con id ${id} no existe`, HttpStatus.NOT_FOUND)
            throw error
        }
        const title = item?.fields?.Title
        let reservasCanceladas = 0
        if(title){
            const reservas = await this.graphRestService.getFiltred(graphToken, this.reservasListName, [
                { field: "Status", value: "Activa" },
                { field: "SpotId", value: title },
            ])
            const array = Array.isArray(reservas?.value) ? reservas.value : [];
            await Promise.all(array.map((reserva: any) =>
                this.graphRestService.update(graphToken, reserva.id, { Status: "Cancelada" }, this.reservasListName)
            ))
            reservasCanceladas = array.length
        }
        await this.graphRestService.delete(graphToken, id, this.listName)
        return { Title: title, reservasCanceladas }
    }

    async putSlot(graphToken:string, id:string, data:ParkingSlotDeactivateDTO){
        const response  = await this.graphRestService.update(graphToken, id, data, this.listName)
        return response
    }

    private toModel(response:any): ParkingSlotDTO{
        const f = response?.fields ?? {};
        return{
            ID: String(response?.id ?? ''),
            Title : f.Title,
            TipoCelda:f.TipoCelda,
            Itinerancia:f.Itinerancia,
            Activa: f.Activa
        }
    }
}