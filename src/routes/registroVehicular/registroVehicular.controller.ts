import { Controller, Get, UseGuards, Req, HttpStatus, HttpException, Post, Put, Param, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { RegistroVehicularService } from './registroVehicular.service.js';
import { OnBehalfOfService } from '../../common/OnBehalfOf/obo.service.js';
import { AccessService } from '../../common/access/access.service.js';

@Controller('registro-vehicular')
export class RegistroVehicularController {
    constructor(private readonly registroVehicularService : RegistroVehicularService, private readonly OBOService : OnBehalfOfService, private readonly accessService : AccessService){}

    @Get() 
    @UseGuards(AuthGuard('azure-token'))
    async getRegistroVehicular(@Req() req: Request){
        const graphToken = await this.OBOService.changeToken(req)
        const allowedRoles = ["Admin"] as Array<"Usuario" | "Admin">
        if(!(await this.accessService.hasAccess(req, graphToken, allowedRoles))) throw new HttpException('El usuario no tiene acceso', HttpStatus.UNAUTHORIZED)
        return await this.registroVehicularService.get(graphToken)
    }
    @Post('create') 
    @UseGuards(AuthGuard('azure-token'))
    async CreateRegistroVehicular(@Req() req: Request){
        const graphToken = await this.OBOService.changeToken(req)
        const allowedRoles = ["Admin"] as Array<"Usuario" | "Admin">
        if(!(await this.accessService.hasAccess(req, graphToken, allowedRoles))) throw new HttpException('El usuario no tiene acceso', HttpStatus.UNAUTHORIZED)
        return await this.registroVehicularService.create(graphToken, req.body)
    }
    @Put('edit/:id')
    @UseGuards(AuthGuard('azure-token'))
    async EditRegistroVehicular(@Req() req: Request, @Param('id') id : string){
        const graphToken = await this.OBOService.changeToken(req)
        const allowedRoles = ["Admin"] as Array<"Usuario" | "Admin">
        if(!(await this.accessService.hasAccess(req, graphToken, allowedRoles))) throw new HttpException('El usuario no tiene acceso', HttpStatus.UNAUTHORIZED)
        return await this.registroVehicularService.edit(graphToken, req.body, id)
    }
    @Delete('delete/:id')
    @UseGuards(AuthGuard('azure-token'))
    async deleteRegistroVehicular(@Req() req: Request, @Param('id') id : string){
        const graphToken = await this.OBOService.changeToken(req)
        const allowedRoles = ["Admin"] as Array<"Usuario" | "Admin">
        if(!(await this.accessService.hasAccess(req, graphToken, allowedRoles))) throw new HttpException('El usuario no tiene acceso', HttpStatus.UNAUTHORIZED)
        return await this.registroVehicularService.delete(graphToken, id)
    }
}