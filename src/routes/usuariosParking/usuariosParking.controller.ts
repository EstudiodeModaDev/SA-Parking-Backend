import { Controller, Get, Req, Post, Put, Delete, Param , Query} from '@nestjs/common';
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
  @Get('getUsers')
      @UseGuards(AuthGuard('azure-token'))
      async getUsuariosBy(@Query('field') field: string, @Query('value') value:string, @Req() req:Request){
          const graphToken = await this.OBOService.changeToken(req)
          return this.UsuariosService.getUsuarioBy(graphToken, field, value)
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

  @Get('getRole/')
  @UseGuards(AuthGuard('azure-token'))
  async getMyRole(@Req() req:Request){
    const graphToken = await this.OBOService.changeToken(req)
    return this.UsuariosService.getRole(graphToken, req)
  }

}
 