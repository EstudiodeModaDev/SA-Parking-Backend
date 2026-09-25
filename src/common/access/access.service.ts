import { forwardRef, HttpException, Inject, Injectable, HttpStatus } from "@nestjs/common";
import type { Request } from "express";
import { UsuariosParkingService } from "../../routes/usuariosParking/usuariosParking.service.js";
import { GraphRestService } from "../graph/graphRest.service.js";
import { ConfigService } from "@nestjs/config"

@Injectable()
export class AccessService{

    constructor(
        @Inject(forwardRef(() => UsuariosParkingService))
        private readonly usuariosParkingService: UsuariosParkingService,
    ){
    }

    async hasAccess(req : Request, graphToken:string, allowedRoles: Array<"Usuario" | "Admin">): Promise<boolean>{
        let rol : "Usuario" | "Admin" = await this.usuariosParkingService.getRole(graphToken, req)
        if(allowedRoles.includes(rol)){
            return true
        }
        return false
    }
}