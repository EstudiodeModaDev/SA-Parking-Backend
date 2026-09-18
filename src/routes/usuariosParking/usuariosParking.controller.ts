import { Controller, Get, Req, Post, Put, Delete, Param } from '@nestjs/common';
import type { Request } from 'express';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OnBehalfOfService } from '../../common/OnBehalfOf/obo.service.js';
import { UsuariosParkingService } from './usuariosParking.service.js';

@Controller('usuarios')
export class UsuariosParkingController {
  constructor(
    private readonly OBOService: OnBehalfOfService,
    private readonly UsuariosService: UsuariosParkingService,
  ) {}

  @Get('getUsers')
  @UseGuards(AuthGuard('azure-token'))
  async getUsers(@Req() req: Request) {
    const graphToken = await this.OBOService.changeToken(req);
    return this.UsuariosService.getUsuarios(graphToken);
  }

  @Post('createUser')
  @UseGuards(AuthGuard('azure-token'))
  async postUsers(@Req() req: Request){
    const graphToken = await this.OBOService.changeToken(req)
    return this.UsuariosService.createUsuarios(graphToken, req.body)
  }

  @Get('infoMe')
  @UseGuards(AuthGuard('azure-token'))
  async getInfoMe(@Req() req:Request){
    const graphToken = await this.OBOService.changeToken(req)
    return this.UsuariosService.getInfoMe(graphToken)
  }

  @Get('infoPhotoMe')
  @UseGuards(AuthGuard('azure-token'))
  async getInfoPhotoMe(@Req() req:Request){
    const graphToken = await this.OBOService.changeToken(req)
    return this.UsuariosService.getInfoPhotoMe(graphToken)
  }

  @Get('getRole/:mail')
  @UseGuards(AuthGuard('azure-token'))
  async getRoleByMail(@Req() req:Request, @Param('mail') mail:string){
    const graphToken = await this.OBOService.changeToken(req)
    return this.UsuariosService.getRole(graphToken, mail)
  }

}
 