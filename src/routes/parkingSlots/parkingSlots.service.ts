import { Injectable } from "@nestjs/common";
import { GraphRestService } from "../../common/graph/graphRest.service.js";
import { ConfigService } from "@nestjs/config";
import { ParkingSlotDTO } from "./dto/ParkingSlots.dto.js";
import { ParkingSlotDeactivateDTO } from "./dto/ParkingSlots.dto.js";
import { OcupacionTurnos, ocuparTurno } from "./turnos.js";
@Injectable()
export class ParkingSlotsService{
    private listName:string
    private reservasListName:string
    constructor (private readonly graphRestService : GraphRestService, private readonly configService : ConfigService){
        this.listName = String(configService.get('PARKING_SLOTS_LIST_NAME'))
        this.reservasListName = String(configService.get('RESERVAS_LIST_NAME'))
    }

    async getParkingSlots(graphToken: string): Promise<Array<ParkingSlotDTO>>{
        const [response, ocupacion] = await Promise.all([
            this.graphRestService.getFiltred(graphToken,this.listName,[{field : "Activa", value: "Activa" }]),
            this.getOcupacion(graphToken),
        ])
        const array = Array.isArray(response?.value) ? response.value : [];
        return array.map((x: any) => {
            const slot = this.toModel(x)
            slot.Ocupacion = ocupacion.get(slot.Title) ?? { Manana: false, Tarde: false }
            return slot
        });
    }

    async getSlotByTitle(graphToken: string, title: string): Promise<ParkingSlotDTO | null>{
        const [response, ocupacion] = await Promise.all([
            this.graphRestService.getFiltred(graphToken,this.listName,[{field : "Title", value: title }]),
            this.getOcupacion(graphToken, title),
        ])
        const array = Array.isArray(response?.value) ? response.value : [];
        if(array.length === 0) return null
        const slot = this.toModel(array[0])
        slot.Ocupacion = ocupacion.get(slot.Title) ?? { Manana: false, Tarde: false }
        return slot
    }

    // ocupacion por turno de cada celda segun las reservas activas (SpotId = Title de la celda)
    private async getOcupacion(graphToken: string, spotId?: string): Promise<Map<string, OcupacionTurnos>>{
        const filters = [{ field: "Status", value: "Activa" }]
        if(spotId) filters.push({ field: "SpotId", value: spotId })
        const response = await this.graphRestService.getFiltred(graphToken, this.reservasListName, filters)
        const array = Array.isArray(response?.value) ? response.value : [];
        const ocupacion = new Map<string, OcupacionTurnos>()
        for(const item of array){
            const f = item?.fields ?? {}
            if(!f.SpotId) continue
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

    async deleteSlot(graphToken:string, id:string){
        const response = await this.graphRestService.delete(graphToken, id, this.listName)
        return response
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