import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { reservasService } from './reservas.service.js';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { OnBehalfOfService } from '../../common/OnBehalfOf/obo.service.js';
import { AccessService } from '../../common/access/access.service.js';
import { UsuariosParkingService } from '../usuariosParking/usuariosParking.service.js';

@Controller('reserva')
export class ReservasController {
  constructor(
    private readonly ReservasService: reservasService,
    private readonly OBOService: OnBehalfOfService,
    private readonly accessService: AccessService,
    private readonly usuariosParkingService: UsuariosParkingService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('azure-token'))
  async getReservas(@Req() req: Request) {
    const graphToken = await this.OBOService.changeToken(req);
    if (!this.accessService.hasAccess(req, graphToken, ['Usuario', 'Admin']))
      throw new HttpException(
        'El Usuario registrado no tiene acceso',
        HttpStatus.UNAUTHORIZED,
      );
    const rol = await this.usuariosParkingService.getRole(graphToken, req);
    switch (rol) {
      case 'Admin':
        return await this.ReservasService.getAllActive(graphToken);
      case 'Usuario':
        return await this.ReservasService.getUserActive(
          graphToken,
          (req.user as { upn: string }).upn,
        );
    }
  }

  @Get('history')
  @UseGuards(AuthGuard('azure-token'))
  async getReservasHistory(@Req() req: Request) {
    const graphToken = await this.OBOService.changeToken(req);
    if (!this.accessService.hasAccess(req, graphToken, ['Usuario', 'Admin']))
      throw new HttpException(
        'El Usuario registrado no tiene acceso',
        HttpStatus.UNAUTHORIZED,
      );
    const rol = await this.usuariosParkingService.getRole(graphToken, req);
    switch (rol) {
      case 'Admin':
        return await this.ReservasService.getAllHistory(graphToken);
      case 'Usuario':
        return await this.ReservasService.getUserHistory(
          graphToken,
          (req.user as { upn: string }).upn,
        );
    }
  }

  @Post('createQuickUsr')
  @UseGuards(AuthGuard('azure-token'))
  async createQuickResv(@Req() req: Request) {
    const graphToken = await this.OBOService.changeToken(req);
    if (!this.accessService.hasAccess(req, graphToken, ['Usuario', 'Admin']))
      throw new HttpException(
        'El Usuario registrado no tiene acceso',
        HttpStatus.UNAUTHORIZED,
      );
    const userData = req.user as { upn: string; name: string };
    return this.ReservasService.createQuickUsuario(
      graphToken,
      req.body,
      userData.upn,
      userData.name,
    );
  }

  @Post('createQuickAdm')
  @UseGuards(AuthGuard('azure-token'))
  async createQuickResvAdm(@Req() req: Request) {
    const graphToken = await this.OBOService.changeToken(req);
    if (!this.accessService.hasAccess(req, graphToken, ['Admin']))
      throw new HttpException(
        'El Usuario registrado no tiene acceso',
        HttpStatus.UNAUTHORIZED,
      );
    return this.ReservasService.createQuickAdmin(graphToken, req.body);
  }

  @Post('createPuntAdm')
  @UseGuards(AuthGuard('azure-token'))
  async createPuntResvAdm(@Req() req: Request) {
    const graphToken = await this.OBOService.changeToken(req);
    if (!this.accessService.hasAccess(req, graphToken, ['Admin']))
      throw new HttpException(
        'El Usuario registrado no tiene acceso',
        HttpStatus.UNAUTHORIZED,
      );
    return this.ReservasService.createPuntualAdm(graphToken, req.body);
  }

  @Post('createPuntUsr')
  @UseGuards(AuthGuard('azure-token'))
  async createPuntResvUsr(@Req() req: Request) {
    const graphToken = await this.OBOService.changeToken(req);
    if (!this.accessService.hasAccess(req, graphToken, ['Admin']))
      throw new HttpException(
        'El Usuario registrado no tiene acceso',
        HttpStatus.UNAUTHORIZED,
      );
    const userData = req.user as { upn: string; name: string };
    return this.ReservasService.createPuntualUsr(
      graphToken,
      req.body,
      userData.upn,
      userData.name,
    );
  }

  @Put('cancelReserv/:id')
  @UseGuards(AuthGuard('azure-token'))
  async CancelReserv(@Req() req: Request, @Param('id') id :string) {
    const graphToken = await this.OBOService.changeToken(req);
    if (!this.accessService.hasAccess(req, graphToken, ['Admin']))
      throw new HttpException(
        'El Usuario registrado no tiene acceso',
        HttpStatus.UNAUTHORIZED,
      );
    const rol = await this.usuariosParkingService.getRole(graphToken, req);
    const userData = req.user as { upn: string; name: string };
    switch (rol) {
      case 'Admin':
        return await this.ReservasService.cancelAdmin(graphToken, id);
      case 'Usuario':
        return await this.ReservasService.cancelUsr(graphToken, id, userData.upn)
    }
  }
}
