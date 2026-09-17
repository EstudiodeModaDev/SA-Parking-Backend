import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { getGraphTokenDTO } from './dto/obo.dto.js';
import { firstValueFrom } from 'rxjs';
import type { Request } from 'express';

@Injectable()
export class OnBehalfOfService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async changeToken(req:Request): Promise<string> {
    const authHeader = req.headers.authorization; //se toma la request completa que llego al endpoint y se obtiene el header de autorizacion
    const token = authHeader?.startsWith('Bearer ')  // se le quita el prefijo bearer para manipular unicamente el token
      ? authHeader.slice(7)
      : authHeader;
    const TENANT_ID = this.configService.get('AZURE_TENANT_ID');
    const CLIENT_ID = this.configService.get('AZURE_CLIENT_ID');
    const SECRET = this.configService.get('AZURE_SECRET');
    const url = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
    const data: getGraphTokenDTO = {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      client_id: CLIENT_ID,
      client_secret: SECRET,
      assertion: token,
      scope: 'https://graph.microsoft.com/.default',
      requested_token_use: 'on_behalf_of',
    };
    const body = new URLSearchParams(data as Record<string, string>); //se convierte el body a parametros de url
    const response = await firstValueFrom(  
      this.httpService.post(url, body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, // en los headers se le agrega content type para que no rechace la coneccion
      }),
    );
    return response.data.access_token;
  }
}
