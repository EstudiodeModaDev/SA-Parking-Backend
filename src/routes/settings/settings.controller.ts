import {
  Controller,
  Get,
  Req,
  UseGuards,
  Put,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { OnBehalfOfService } from '../../common/OnBehalfOf/obo.service.js';
import { settingsService } from './settings.service.js';
import { AccessService } from '../../common/access/access.service.js';

@Controller('settings')
export class settingsControler {
  constructor(
    private readonly OBOService: OnBehalfOfService,
    private readonly SettingsService: settingsService,
    private readonly accessService: AccessService,
  ) {}

  @Get('get')
  @UseGuards(AuthGuard('azure-token'))
  async getSettings(@Req() req: Request) {
    const graphToken = await this.OBOService.changeToken(req);
    const allowedRoles = ['Admin', 'Usuario'] as Array<'Usuario' | 'Admin'>;
    if (!(await this.accessService.hasAccess(req, graphToken, allowedRoles)))
      throw new HttpException(
        'El usuario no tiene acceso',
        HttpStatus.UNAUTHORIZED,
      );
    return this.SettingsService.getSettings(graphToken);
  }

  @Put('put')
  @UseGuards(AuthGuard('azure-token'))
  async putSettings(@Req() req: Request) {
    const graphToken = await this.OBOService.changeToken(req);
    const allowedRoles = ['Admin'] as Array<'Usuario' | 'Admin'>;
    if (!(await this.accessService.hasAccess(req, graphToken, allowedRoles)))
      throw new HttpException(
        'El usuario no tiene acceso',
        HttpStatus.UNAUTHORIZED,
      );
    return this.SettingsService.putSettings(graphToken, req.body);
  }
}
