import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GraphRestService } from "../../common/graph/graphRest.service.js";
import { RegistroVehicularDTO } from "./dto/registroVehicular.dto.js";

@Injectable()
export class RegistroVehicularService{
    private listName : string 

    constructor(private readonly configService:ConfigService, private readonly graphRestService:GraphRestService){
        this.listName = String(configService.get('REGISTRO_VEHICULAR_LIST_NAME'))
    }

    async get(graphToken : string){
        const response = await this.graphRestService.get(graphToken, this.listName)
        const array = Array.isArray(response?.value) ? response.value : [];
        return array.map((x: any) => this.toModel(x));
    }

    async create (graphToken:string, data : RegistroVehicularDTO){
        const response = await this.graphRestService.create<RegistroVehicularDTO>(graphToken, data, this.listName)
        return response.fields
    }

    async edit (graphToken:string, data:any, id:string){
        const response = await this.graphRestService.update(graphToken, id, data, this.listName)
        return response
    }

    async delete (graphToken:string, id:string){
        const response = await this.graphRestService.delete(graphToken, id, this.listName)
        return response
    }

    private toModel(response: any):RegistroVehicularDTO{
        const f = response?.fields ?? {};
        return{
            ID : String(response?.id ?? ''),
            Title : f.Title,
            Cedula: f.Cedula,
            TipoVeh : f.TipoVeh,
            PlacaVeh: f.PlacaVeh,
            CorreoReporte: f.CorreoReporte
        }
    }

}