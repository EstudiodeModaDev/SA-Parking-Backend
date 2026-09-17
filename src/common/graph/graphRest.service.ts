import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

type GraphList = { id: string; name: string; displayName: string };

@Injectable()
export class GraphRestService {
  private readonly graphBaseUrl = 'https://graph.microsoft.com/v1.0';

  // se cachean en memoria porque no cambian mientras el proceso sigue vivo,
  // asi se evita resolverlos en cada request
  private siteId: string | null = null;
  private readonly listIdCache = new Map<string, string>();

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private async call<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    graphToken: string,
    data?: unknown,
  ) {
    const url = `${this.graphBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const requestConfig: AxiosRequestConfig = {
      headers: {
        Authorization: graphToken.startsWith('Bearer')
          ? graphToken
          : `Bearer ${graphToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
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
      throw new Error('Falta configurar SHARE_POINT_SITE_URL');
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
      throw new NotFoundException(
        `No se encontro la lista "${listName}" en el sitio de SharePoint`,
      );
    }

    this.listIdCache.set(listName, list.id);
    return list.id;
  }

  async get<T>(graphToken: string, listName: string, itemId?: string){
    const siteId = await this.getSiteId(graphToken);
    const listId = await this.getListId(graphToken, listName);
    const path = itemId
      ? `/sites/${siteId}/lists/${listId}/items/${itemId}?$expand=fields`
      : `/sites/${siteId}/lists/${listId}/items?$expand=fields`;
    const response = await this.call('GET', path, graphToken);
    return response.data;
  }

  async create(
    graphToken: string,
    fields: Record<string, unknown>,
    listName: string,
  ) {
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

  async update(
    graphToken: string,
    itemId: string,
    fields: Record<string, unknown>,
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
    await this.call(
      'DELETE',
      `/sites/${siteId}/lists/${listId}/items/${itemId}`,
      graphToken,
    );
  }
}
