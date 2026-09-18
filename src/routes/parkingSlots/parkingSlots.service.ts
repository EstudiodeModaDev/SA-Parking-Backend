import { Injectable } from "@nestjs/common";
import { GraphRestService } from "../../common/graph/graphRest.service.js";
import { ConfigService } from "@nestjs/config";
import { ParkingSlotDTO } from "./dto/ParkingSlots.dto.js";
@Injectable()
export class ParkingSlotsService{
    private listName:string
    constructor (private readonly graphRestService : GraphRestService, private readonly configService : ConfigService){
        this.listName = String(configService.get('PARKING_SLOTS_LIST_NAME'))
    }

    async getParkingSlots(graphToken: string){
        const response = await this.graphRestService.get(graphToken,this.listName)
        const array = Array.isArray(response?.value) ? response.value : [];
        return array.map((x: any) => this.toModel(x));
    }

    async createSlot(graphToken:string, data : ParkingSlotDTO){
        const response = await this.graphRestService.create(graphToken,data, this.listName)
        return response
    }

    async deleteSlot(graphToken:string, id:string){
        const response = await this.graphRestService.delete(graphToken, id, this.listName)
        return response
    }

    async putSlot(graphToken:string, id:string, data:ParkingSlotDTO){
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