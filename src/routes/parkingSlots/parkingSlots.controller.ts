import { Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { ParkingSlotsService } from './parkingSlots.service.js';
import { AuthGuard } from '@nestjs/passport';
import { OnBehalfOfService } from '../../common/OnBehalfOf/obo.service.js';

@Controller('parkingSlots')
export class ParkingSlotsController {
    constructor(private readonly parkingSlotService:ParkingSlotsService, private readonly OBOService:OnBehalfOfService){}

    @Get('getSlots')
    @UseGuards(AuthGuard('azure-token'))
    async getSlots(@Req() req:Request){
        const graphToken = await this.OBOService.changeToken(req)
        return this.parkingSlotService.getParkingSlots(graphToken)
    }

    @Post('createSlot')
    @UseGuards(AuthGuard('azure-token'))
    async CreateSlot(@Req() req:Request){
        const graphToken = await this.OBOService.changeToken(req)
        return this.parkingSlotService.createSlot(graphToken, req.body)
    }

    @Delete('delSlot/:id')
    @UseGuards(AuthGuard('azure-token'))
    async deleteSlot(@Req() req : Request, @Param('id') id:string){
        const graphToken = await this.OBOService.changeToken(req)
        return this.parkingSlotService.deleteSlot(graphToken, id)
    }

    @Put('editSlot/:id')
    @UseGuards(AuthGuard('azure-token'))
    async editSlot(@Req() req : Request, @Param('id') id:string){
        const graphToken = await this.OBOService.changeToken(req)
        return this.parkingSlotService.putSlot(graphToken, id, req.body)
    }

}