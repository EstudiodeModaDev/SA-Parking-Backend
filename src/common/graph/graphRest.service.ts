import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import { filter, firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { error } from 'console';
import { FiltersDTO } from './dto/graphRestFilter.dto.js';

type GraphList = { id: string; name: string; displayName: string };

@Injectable()
export class GraphRestService {
  private readonly graphBaseUrl = 'https://graph.microsoft.com/v1.0';
  private readonly groupID : string
  // se cachean en memoria porque no cambian mientras el proceso sigue vivo,
  // asi se evita resolverlos en cada request
  
  private siteId: string | null = null;
  private readonly listIdCache = new Map<string, string>();

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.groupID = this.configService.get<string>('OUTLOOK_GROUP_ID') ?? '';
  }

  private async call<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    graphToken: string,
    data?: unknown,
    extraHeaders?: Record<string, string>,
  ) {
    const url = `${this.graphBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: graphToken.startsWith('Bearer')
          ? graphToken
          : `Bearer ${graphToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...extraHeaders,
      },
    };
    switch (method) {
      case 'GET':
        return firstValueFrom(this.httpService.get<T>(url, requestConfig));
      case 'POST':
        return firstValueFrom(
          this.httpService.post<T>(url, data, requestConfig),
        );
      case 'PUT':
        return firstValueFrom(
          this.httpService.put<T>(url, data, requestConfig),
        );
      case 'PATCH':
        return firstValueFrom(
          this.httpService.patch<T>(url, data, requestConfig),
        );
      case 'DELETE':
        return firstValueFrom(this.httpService.delete<T>(url, requestConfig));
    }
  }

  /**
   * Resuelve el id del sitio de SharePoint (formato `{hostname},{siteId},{webId}`)
   * a partir de SHARE_POINT_SITE_URL. Se necesita porque los endpoints de Graph
   * para listas cuelgan de /sites/{siteId}, no de la url del sitio.
   */
  private async getSiteId(graphToken: string): Promise<string> {
    if (this.siteId) return this.siteId;

    const siteUrl = this.configService.get<string>('SHARE_POINT_SITE_URL');
    if (!siteUrl) {
      throw new HttpException('Falta configurar SHARE_POINT_SITE_URL', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const { hostname, pathname } = new URL(siteUrl);
    const serverRelativePath = pathname.replace(/\/+$/, '');

    const response = await this.call<{ id: string }>(
      'GET',
      `/sites/${hostname}:${serverRelativePath}`,
      graphToken,
    );
    this.siteId = response.data.id;
    return this.siteId;
  }

  /**
   * Trae todas las listas del sitio con su id, name y displayName.
   * Util mientras no se conocen los ids de las listas: se llama este metodo,
   * se ubica la lista buscada por displayName y se toma su id.
   */
  private async getLists(graphToken: string): Promise<GraphList[]> {
    const siteId = await this.getSiteId(graphToken);
    const response = await this.call<{ value: GraphList[] }>(
      'GET',
      `/sites/${siteId}/lists?$select=id,name,displayName`,
      graphToken,
    );
    return response.data.value;
  }

  private async getListId(
    graphToken: string,
    listName: string,
  ): Promise<string> {
    const cached = this.listIdCache.get(listName);
    if (cached) return cached;

    const lists = await this.getLists(graphToken);
    const list = lists.find(
      (l) => l.displayName === listName || l.name === listName,
    );
    if (!list) {
      throw new HttpException(
        `No se encontro la lista "${listName}" en el sitio de SharePoint`,
        HttpStatus.NOT_FOUND,
      );
    }
    this.listIdCache.set(listName, list.id);
    return list.id;
  }

  async getInfoMe(graphToken: string) {
    const path = '/me';
    const response = await this.call('GET', path, graphToken);
    return response.data;
  }

  async getPhotoMe(graphToken: string) {
    const path = '/me/photo/$value';
    const response = await this.call('GET', path, graphToken);
    return response.data;
  }

  async get(graphToken: string, listName: string, itemId?: string) {
    const siteId = await this.getSiteId(graphToken);
    const listId = await this.getListId(graphToken, listName);
    const path = itemId
      ? `/sites/${siteId}/lists/${listId}/items/${itemId}?$expand=fields`
      : `/sites/${siteId}/lists/${listId}/items?$expand=fields`;
    const response = await this.call('GET', path, graphToken);
    return response.data;
  }

  async getFiltred(
    graphToken: string,
    listName: string,
    filters: Array<FiltersDTO>,
  ) {
    const siteId = await this.getSiteId(graphToken);
    const listId = await this.getListId(graphToken, listName);
    // cada filtro se une con and; se escapan comillas simples para no romper el filtro OData
    const condiciones = filters.map(
      (f) => `fields/${f.field} eq '${f.value.replace(/'/g, "''")}'`,
    );
    const filterPath = `$filter=${condiciones.join(' and ')}`;
    const path = `/sites/${siteId}/lists/${listId}/items?$expand=fields&${filterPath}`;
    // Title no esta indexado en la lista de SharePoint, Graph exige este header para permitir el filtro igual
    const response = await this.call('GET', path, graphToken, undefined, {
      Prefer: 'HonorNonIndexedQueriesWarningMayFailRandomly',
    });
    return response.data;
  }

  async create<T>(graphToken: string, fields: T, listName: string) {
    const siteId = await this.getSiteId(graphToken);
    const listId = await this.getListId(graphToken, listName);
    const response = await this.call(
      'POST',
      `/sites/${siteId}/lists/${listId}/items`,
      graphToken,
      { fields },
    );
    return response.data;
  }

  async update<T>(
    graphToken: string,
    itemId: string,
    fields: T,
    listName: string,
  ) {
    const siteId = await this.getSiteId(graphToken);
    const listId = await this.getListId(graphToken, listName);
    // los valores de campo se actualizan contra el subrecurso /fields del item, no contra el item en si
    const response = await this.call(
      'PATCH',
      `/sites/${siteId}/lists/${listId}/items/${itemId}/fields`,
      graphToken,
      fields,
    );
    return response.data;
  }

  async delete(graphToken: string, itemId: string, listName: string) {
    const siteId = await this.getSiteId(graphToken);
    const listId = await this.getListId(graphToken, listName);
    const response = await this.call(
      'DELETE',
      `/sites/${siteId}/lists/${listId}/items/${itemId}`,
      graphToken,
    );
    return response.data;
  }

  async getMailList(graphToken: string, filteredEmail?: string) {
    let path = `/groups/${this.groupID}/transitiveMembers`
    if (filteredEmail !== undefined) {
      path = `/groups/${this.groupID}/transitiveMembers/microsoft.graph.user?$filter=mail eq '${filteredEmail}'&$count=true`;
    }
    const response = await this.call('GET', path, graphToken,undefined, {
      "ConsistencyLevel" : "eventual"
    })
    return response.data
  }

  async addMailList(graphToken:string, mail:string){
    let path = `/users?$filter=mail eq '${mail}'&$select=id`
    let response = await this.call('GET', path, graphToken)
    if(response.data['@odata.count'] === 0)
      throw new HttpException('No se encontro el correo dentro de la compañia', HttpStatus.NOT_FOUND)

    const userId = response.data.value[0].id

    path = `/groups/${this.groupID}/members/$ref`
    response = await this.call("POST",path,graphToken, {"@odata.id":`${this.graphBaseUrl}/directoryObjects/${userId}`})
    return response.data
  }

  async removeMailList(graphToken:string, mail:string){
    let response = await this.getMailList(graphToken, mail)
    if(response['@odata.count'] === 0)
      throw new HttpException('No se encontro el correo dentro de el grupo', HttpStatus.NOT_FOUND)
    const userId = response.value[0].id
    const path = `/groups/${this.groupID}/members/${userId}/$ref`
    response = await this.call("DELETE",path,graphToken)
    return response.data

  }

  async getAllWorkers(graphToken:string){
    const path = `/users`
    const response = await this.call("GET", path, graphToken)
    return response.data
  }

}
