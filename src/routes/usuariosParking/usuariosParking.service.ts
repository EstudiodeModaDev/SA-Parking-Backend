import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { GraphRestService } from '../../common/graph/graphRest.service.js';
import { UsuariosParkingDTO } from './dto/usuariosParking.dto.js';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class UsuariosParkingService {
  private listName: string;

  constructor(
    private readonly graphRestService: GraphRestService,
    private readonly configService: ConfigService,
  ) {
    this.listName = String(configService.get('USUARIOS_PARKING_LIST_NAME'));
  }

  async getUsuarios(graphToken: string) {
    const response = await this.graphRestService.get(graphToken, this.listName);
    const array = Array.isArray(response?.value) ? response.value : [];
    return array.map((x: any) => this.toModel(x));
  }

  async getUsuarioBy(graphToken: string, field: string, value: string) {
    const response = await this.graphRestService.getFiltred(
      graphToken,
      this.listName,
      [{ field: field, value: value }],
    );
    if (!response.value[0]) {
      throw new HttpException(
        'No se encontro un objeto con los filtros',
        HttpStatus.NOT_FOUND,
      );
    }
    const array = Array.isArray(response?.value) ? response.value : [];
    return array.map((x: any) => this.toModel(x));
  }

  async createUsuarios(graphToken: string, data: UsuariosParkingDTO) {
    const response = await this.graphRestService.create(
      graphToken,
      data,
      this.listName,
    );
    return response;
  }

  async getInfoMe(graphToken: string) {
    const response = await this.graphRestService.getInfoMe(graphToken);
    return response;
  }

  async getInfoPhotoMe(graphToken: string) {
    const response = await this.graphRestService.getPhotoMe(graphToken);
    return response;
  }

  async getRole(
    graphToken: string,
    req: Request,
  ): Promise<'Usuario' | 'Admin'> {
    const response = await this.graphRestService.getFiltred(
      graphToken,
      this.listName,
      [{ field: 'Title', value: (req.user as { upn: string }).upn }],
    );
    const array = Array.isArray(response?.value) ? response.value : [];
    const results: Array<UsuariosParkingDTO> = array.map((x: any) =>
      this.toModel(x),
    );
    if (results.length === 0) {
      const groupResponse = await this.graphRestService.getMailList(
        graphToken,
        (req.user as { upn: string }).upn,
      );
      if (groupResponse['@odata.count'] > 0) {
        return 'Usuario';
      }
      throw new HttpException(
        'El usuario no esta registrado en la app',
        HttpStatus.UNAUTHORIZED,
      );
    } else {
      return results[0].Rol as 'Usuario' | 'Admin';
    }
  }

  private toModel(response: any): UsuariosParkingDTO {
    const f = response?.fields ?? {};
    return {
      ID: String(response?.id ?? ''),
      Title: f.Title,
      Rol: f.Rol,
      Permitidos: f.Permitidos,
    };
  }
}
