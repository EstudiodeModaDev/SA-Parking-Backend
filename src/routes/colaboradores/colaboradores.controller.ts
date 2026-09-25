import {
  Controller,
  Get,
  Req,
  UseGuards,
  Post,
  Delete,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ColaboradoresService } from './colaboradores.service.js';
import { OnBehalfOfService } from '../../common/OnBehalfOf/obo.service.js';
import type { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AccessService } from '../../common/access/access.service.js';

@Controller('colaboradores')
export class ColaboradoresController {
  constructor(
    private readonly colaboradoresService: ColaboradoresService,
    private readonly OBOService: OnBehalfOfService,
    private readonly accessService: AccessService,
  ) {}

  @Get('fijos')
  @UseGuards(AuthGuard('azure-token'))
  async getColaboradoresFijos(@Req() req: Request) {
    const graphToken = await this.OBOService.changeToken(req);
    const allowedRoles = ['Admin'] as Array<'Usuario' | 'Admin'>;
    if (!(await this.accessService.hasAccess(req, graphToken, allowedRoles)))
      throw new HttpException(
        'El usuario no tiene acceso',
        HttpStatus.UNAUTHORIZED,
      );
    return this.colaboradoresService.getColaboradoresFijos(graphToken);
  }

  @Get('fijosBy')
  @UseGuards(AuthGuard('azure-token'))
  async getColaboradoresBy(
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
    return this.colaboradoresService.getColaboradorFijoBy(
      graphToken,
      field,
      value,
    );
  }

  @Post('createFijo')
  @UseGuards(AuthGuard('azure-token'))
  async createFijo(@Req() req: Request) {
    const graphToken = await this.OBOService.changeToken(req);
    const allowedRoles = ['Admin'] as Array<'Usuario' | 'Admin'>;
    if (!(await this.accessService.hasAccess(req, graphToken, allowedRoles)))
      throw new HttpException(
        'El usuario no tiene acceso',
        HttpStatus.UNAUTHORIZED,
      );
    return this.colaboradoresService.createColaboradorFijo(
      graphToken,
      req.body,
    );
  }

  @Delete('deleteFijo/:id')
  @UseGuards(AuthGuard('azure-token'))
  async deleteFijo(@Req() req: Request, @Param('id') id: string) {
    const graphToken = await this.OBOService.changeToken(req);
    const allowedRoles = ['Admin'] as Array<'Usuario' | 'Admin'>;
    if (!(await this.accessService.hasAccess(req, graphToken, allowedRoles)))
      throw new HttpException(
        'El usuario no tiene acceso',
        HttpStatus.UNAUTHORIZED,
      );
    return this.colaboradoresService.deleteColaboradorFijo(graphToken, id);
  }

  @Get('mailList')
  @UseGuards(AuthGuard('azure-token'))
  async getMailList(@Req() req: Request) {
    const graphToken = await this.OBOService.changeToken(req);
    const allowedRoles = ['Admin'] as Array<'Usuario' | 'Admin'>;
    if (!(await this.accessService.hasAccess(req, graphToken, allowedRoles)))
      throw new HttpException(
        'El usuario no tiene acceso',
        HttpStatus.UNAUTHORIZED,
      );
    return this.colaboradoresService.getUserGroup(graphToken);
  }

  @Get('userBy')
  @UseGuards(AuthGuard('azure-token'))
  async getUserFromGroup(@Req() req: Request, @Query('email') email : string) {
    const graphToken = await this.OBOService.changeToken(req);
    const allowedRoles = ['Admin'] as Array<'Usuario' | 'Admin'>;
    if (!(await this.accessService.hasAccess(req, graphToken, allowedRoles)))
      throw new HttpException(
        'El usuario no tiene acceso',
        HttpStatus.UNAUTHORIZED,
      );
    return this.colaboradoresService.getUserFromGroup(graphToken, email);
  }

  @Post('addUser')
  @UseGuards(AuthGuard('azure-token'))
  async addUserGroup(@Req() req: Request,@Query('email') email : string){
    const graphToken = await this.OBOService.changeToken(req);
    const allowedRoles = ['Admin'] as Array<'Usuario' | 'Admin'>;
    if (!(await this.accessService.hasAccess(req, graphToken, allowedRoles)))
      throw new HttpException(
        'El usuario no tiene acceso',
        HttpStatus.UNAUTHORIZED,
      );
    return this.colaboradoresService.addUserGroup(graphToken, email);
  }

  @Delete('remove')
  @UseGuards(AuthGuard('azure-token'))
  async removeUserGroup(@Req() req: Request,@Query('email') email : string){
    const graphToken = await this.OBOService.changeToken(req);
    const allowedRoles = ['Admin'] as Array<'Usuario' | 'Admin'>;
    if (!(await this.accessService.hasAccess(req, graphToken, allowedRoles)))
      throw new HttpException(
        'El usuario no tiene acceso',
        HttpStatus.UNAUTHORIZED,
      );
    return this.colaboradoresService.removeUserGroup(graphToken, email);
  }

  @Get('all')
  @UseGuards(AuthGuard('azure-token'))
  async getAllUsers(@Req() req:Request){
    const graphToken = await this.OBOService.changeToken(req);
    const allowedRoles = ['Admin'] as Array<'Usuario' | 'Admin'>;
    if (!(await this.accessService.hasAccess(req, graphToken, allowedRoles)))
      throw new HttpException(
        'El usuario no tiene acceso',
        HttpStatus.UNAUTHORIZED,
      );
    return this.colaboradoresService.getAllUsers(graphToken)    
  }
}
