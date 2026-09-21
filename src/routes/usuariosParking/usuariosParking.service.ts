import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { GraphRestService } from "../../common/graph/graphRest.service.js";
import { UsuariosParkingDTO } from "./dto/usuariosParking.dto.js";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class UsuariosParkingService{
    private listName : string

    constructor(private readonly graphRestService:GraphRestService, private readonly configService:ConfigService){
        this.listName = String(configService.get('USUARIOS_PARKING_LIST_NAME'))
    }
    

    async getUsuarios(graphToken:string){
        const response = await this.graphRestService.get(graphToken, this.listName)
        const array = Array.isArray(response?.value) ? response.value : [];
        return array.map((x: any) => this.toModel(x));
    }

    async getUsuarioBy(graphToken:string, field:string, value:string){
        const response = await this.graphRestService.getFiltred(graphToken, this.listName, field, value)
        if (!response.value[0]) {
            throw new HttpException('No se encontro un objeto con los filtros', HttpStatus.NOT_FOUND)
        }
        const array = Array.isArray(response?.value) ? response.value : [];
        return array.map((x: any) => this.toModel(x));
    }

    async createUsuarios(graphToken:string, data: UsuariosParkingDTO){
        const response = await this.graphRestService.create(graphToken, data, this.listName)
        return response
    }

    async getInfoMe(graphToken:string){
        const response = await this.graphRestService.getInfoMe(graphToken)
        return response        
    }

    async getInfoPhotoMe(graphToken:string){
        const response = await this.graphRestService.getPhotoMe(graphToken)
        return response
    }

    async getRole(graphToken:string, correo : string){
        const response = await this.graphRestService.getFiltred(graphToken, this.listName, 'Title', correo)
        const array = Array.isArray(response?.value) ? response.value : [];
        const results = array.map((x: any) => this.toModel(x));
        return {
            "Rol":results[0].Rol
        }
    }

    private toModel(response:any):UsuariosParkingDTO{
        const f = response?.fields ?? {};
        return {
            ID : String(response?.id ?? ''),
            Title: f.Title,
            Rol: f.Rol,
            Permitidos : f.Permitidos
        };
    }
}