import { Controller, Get , Req, UseGuards, Post, Delete, Param, Query} from '@nestjs/common';
import { ColaboradoresService } from './colaboradores.service.js';
import { OnBehalfOfService } from '../../common/OnBehalfOf/obo.service.js';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('colaboradores')
export class ColaboradoresController {
    constructor(private readonly colaboradoresService:ColaboradoresService, private readonly  OBOService: OnBehalfOfService){}

    @Get('fijos')
    @UseGuards(AuthGuard('azure-token'))
    async getColaboradoresFijos(@Req() req:Request){
        const graphToken = await this.OBOService.changeToken(req)
        return this.colaboradoresService.getColaboradoresFijos(graphToken)
    }

    @Get('fijos')
    @UseGuards(AuthGuard('azure-token'))
    async getColaboradoresBy(@Query('field') field: string, @Query('value') value:string, @Req() req:Request){
        const graphToken = await this.OBOService.changeToken(req)
        return this.colaboradoresService.getColaboradorFijoBy(graphToken, field, value)
    }

    @Post('createFijo')
    @UseGuards(AuthGuard('azure-token'))
    async createFijo(@Req() req:Request){
        const graphToken = await this.OBOService.changeToken(req)
        return this.colaboradoresService.createColaboradorFijo(graphToken, req.body)
    }

    @Delete('deleteFijo/:id')
    @UseGuards(AuthGuard('azure-token'))
    async deleteFijo(@Req() req:Request, @Param('id') id:string){
        const graphToken = await this.OBOService.changeToken(req)
        return this.colaboradoresService.deleteColaboradorFijo(graphToken, id)
    }
}