import { Controller, Get, Req, UseGuards, Put } from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { OnBehalfOfService } from '../../common/OnBehalfOf/obo.service.js';
import { settingsService } from './settings.service.js';

@Controller('settings')
export class settingsControler {
    constructor(private readonly OBOService: OnBehalfOfService, private readonly SettingsService:settingsService){}

    @Get('get')
    @UseGuards(AuthGuard('azure-token'))
    async getSettings(@Req() req:Request) {
        const graphToken =  await this.OBOService.changeToken(req)
        return this.SettingsService.getSettings(graphToken)
    }

    @Put('put')
    @UseGuards(AuthGuard('azure-token'))
    async putSettings(@Req() req:Request){
        const graphToken = await this.OBOService.changeToken(req)
        return this.SettingsService.putSettings(graphToken, req.body)
    }
}