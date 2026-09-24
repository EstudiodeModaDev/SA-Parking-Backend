import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { GraphRestService } from "../../common/graph/graphRest.service.js";
import { ConfigService } from "@nestjs/config";
import { ColaboradorFijoDTO } from './dto/colaboradores.dto.js';

@Injectable()
export class ColaboradoresService{
    private listName : string

    constructor(private readonly graphRestService:GraphRestService, private readonly configService : ConfigService ){
        this.listName = String(configService.get('COLABORADORES_FIJOS_LIST_NAME'))
    }

    async getColaboradoresFijos(graphToken:string){
        const response = await this.graphRestService.get(graphToken, this.listName)
        const array = Array.isArray(response?.value) ? response.value : [];
        return array.map((x: any) => this.toModel(x));
    }

    async deleteColaboradorFijo(graphToken:string, id:string){
        const response = await this.graphRestService.delete(graphToken, id, this.listName)
        return response
    }

    async createColaboradorFijo(graphToken:string, data: ColaboradorFijoDTO){
        const response = await this.graphRestService.create(graphToken, data, this.listName)
        return response.fields
    }

    async getColaboradorFijoBy(graphToken:string, field:string, value:string){
        const response = await this.graphRestService.getFiltred(graphToken, this.listName, [{field: field, value:value}])
        if (!response.value[0]) {
            throw new HttpException('No se encontro un objeto con los filtros', HttpStatus.NOT_FOUND)
        }
        const array = Array.isArray(response?.value) ? response.value : [];
        return array.map((x: any) => this.toModel(x));
    }

    async getUserGroup(graphToken:string){
        const response = await this.graphRestService.getMailList(graphToken)
        return response.value

    }

    async getUserFromGroup(graphToken:string, mail:string){
        const response = await this.graphRestService.getMailList(graphToken, mail)
        return response.value
    }

    async addUserGroup(graphToken:string, mail:string){
        const response = await this.graphRestService.addMailList(graphToken, mail)
        return response
    }

    async removeUserGroup(graphToken:string, mail:string){
        const response = await this.graphRestService.removeMailList(graphToken,mail)
        return response
    }

    private toModel(response:any): ColaboradorFijoDTO{
        const f = response?.fields ?? {};
        return{
            ID : String(response?.id ?? ''),
            Title : f.Title,
            Correo: f.Correo,
            TipoVehiculo : f.Tipodevehiculo,
            Placa : f.Placa,
            CodigoCelda: f.CodigoCelda? f.CodigoCelda : '',
            SpotAsignado: f.SpotAsignado? f.SpotAsignado : ''
        }
    }
}