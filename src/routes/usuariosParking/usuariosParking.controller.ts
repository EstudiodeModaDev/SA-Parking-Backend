import {
  Controller,
  Get,
  Req,
  Post,
  Put,
  Delete,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { forwardRef, Inject, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OnBehalfOfService } from '../../common/OnBehalfOf/obo.service.js';
import { UsuariosParkingService } from './usuariosParking.service.js';
import { AccessService } from '../../common/access/access.service.js';

@Controller('usuarios')
export class UsuariosParkingController {
  constructor(
    private readonly OBOService: OnBehalfOfService,
    private readonly UsuariosService: UsuariosParkingService,
    @Inject(forwardRef(() => AccessService))
    private readonly accessService: AccessService,
  ) {}

  @Get('getUsers')
  @UseGuards(AuthGuard('azure-token'))
  async getUsers(@Req() req: Request) {
    const graphToken = await this.OBOService.changeToken(req);
    const allowedRoles = ['Admin'] as Array<'Usuario' | 'Admin'>;
    if (!(await this.accessService.hasAccess(req, graphToken, allowedRoles)))
      throw new HttpException(
        'El usuario no tiene acceso',
        HttpStatus.UNAUTHORIZED,
      );
    return this.UsuariosService.getUsuarios(graphToken);
  }
  @Get('getUsersBy')
  @UseGuards(AuthGuard('azure-token'))
  async getUsuariosBy(
    @Query('field') field: string,
    @Query('value') value: string,
    @Req() req: Request,
  ) {
    const graphToken = await this.OBOService.changeToken(req);
    const allowedRoles = ['Admin'] as Array<'Usuario' | 'Admin'>;
    if (!(await this.accessService.hasAccess(req, graphToken, allowedRoles)))
      throw new HttpException(
        'El usuario no tiene acceso',
        HttpStatus.UNAUTHORIZED,
      );
    return this.UsuariosService.getUsuarioBy(graphToken, field, value);
  }

  @Post('createUser')
  @UseGuards(AuthGuard('azure-token'))
  async postUsers(@Req() req: Request) {
    const graphToken = await this.OBOService.changeToken(req);
    const allowedRoles = ['Admin'] as Array<'Usuario' | 'Admin'>;
    if (!(await this.accessService.hasAccess(req, graphToken, allowedRoles)))
      throw new HttpException(
        'El usuario no tiene acceso',
        HttpStatus.UNAUTHORIZED,
      );
    return this.UsuariosService.createUsuarios(graphToken, req.body);
  }

  @Get('infoMe')
  @UseGuards(AuthGuard('azure-token'))
  async getInfoMe(@Req() req: Request) {
    const graphToken = await this.OBOService.changeToken(req);
    return this.UsuariosService.getInfoMe(graphToken);
  }

  @Get('infoPhotoMe')
  @UseGuards(AuthGuard('azure-token'))
  async getInfoPhotoMe(@Req() req: Request) {
    const graphToken = await this.OBOService.changeToken(req);
    return this.UsuariosService.getInfoPhotoMe(graphToken);
  }

  @Get('getRole/')
  @UseGuards(AuthGuard('azure-token'))
  async getMyRole(@Req() req: Request) {
    const graphToken = await this.OBOService.changeToken(req);
    return this.UsuariosService.getRole(graphToken, req);
  }
}
