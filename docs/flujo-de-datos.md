# Flujo de datos de una petición

[← Volver al README](../README.md) · [Rutas y endpoints](rutas.md)

Este documento describe el recorrido genérico que sigue cualquier petición en el backend. Todos los routers siguen el mismo patrón; solo cambian la lista de SharePoint y la lógica del service.

## Diagrama general

```
 Cliente (frontend SA-Parking)
   │  HTTP + Authorization: Bearer <token Azure AD>
   ▼
 ┌────────────────────────────────────────────────────────────────────┐
 │ 1. main.ts / AppModule           → Nest enruta al controller        │
 │ 2. AuthGuard('azure-token')      → valida el JWT contra Azure AD    │
 │ 3. OnBehalfOfService.changeToken → token usuario ⇒ token de Graph   │
 │ 4. AccessService.hasAccess       → obtiene el rol y lo compara      │
 │ 5. <Router>Service               → lógica de negocio / validaciones │
 │ 6. GraphRestService              → llamada HTTP a Microsoft Graph   │
 │ 7. <Router>Service.toModel       → mapea la respuesta a un DTO      │
 └────────────────────────────────────────────────────────────────────┘
   │  JSON
   ▼
 Cliente
```

## 1. Entrada y enrutamiento

- [src/main.ts](../src/main.ts) crea la app a partir de `AppModule` y escucha en `PORT` (o `3000`).
- [src/app.module.ts](../src/app.module.ts) carga `ConfigModule` como global (variables de `.env`), `AuthModule` y todos los módulos de `src/routes/`.
- Nest busca el controller cuyo prefijo (`@Controller('...')`) y decorador de método (`@Get`, `@Post`, etc.) coinciden con la petición.

## 2. Autenticación del token

Cada endpoint tiene `@UseGuards(AuthGuard('azure-token'))`. Esta estrategia de Passport está definida en [src/common/auth/auth.guard.ts](../src/common/auth/auth.guard.ts) y:

1. Extrae el token del header `Authorization: Bearer <token>`.
2. Descarga (y cachea) las claves públicas de Azure AD desde `https://login.microsoftonline.com/<tenant>/discovery/v2.0/keys`.
3. Verifica firma `RS256`, expiración, audiencia (`AZURE_CLIENT_ID` o `api://AZURE_CLIENT_ID`) y emisor (`https://sts.windows.net/<tenant>/`).
4. Si todo es válido, deja el payload del token en `req.user` (de ahí salen `upn` y `name` del usuario).

Si falla, Nest responde **401 Unauthorized** y la petición no llega al controller.

> Para depurar un 401 existe la estrategia `azure-token-debug` en [src/common/auth/debug-auth.guard.ts](../src/common/auth/debug-auth.guard.ts), que imprime en consola la causa probable. Solo se debe usar en desarrollo.

## 3. Cambio de token (On-Behalf-Of)

El token del frontend no sirve para llamar a Microsoft Graph. El controller llama a `OnBehalfOfService.changeToken(req)` ([src/common/OnBehalfOf/obo.service.ts](../src/common/OnBehalfOf/obo.service.ts)), que:

1. Toma el token de `req.headers.authorization` y le quita el prefijo `Bearer`.
2. Hace `POST` a `https://login.microsoftonline.com/<tenant>/oauth2/v2.0/token` con `grant_type=jwt-bearer`, `requested_token_use=on_behalf_of` y el scope de Graph.
3. Devuelve el `access_token` de Graph (`graphToken`), que se pasa al resto de la cadena.

Las llamadas a Graph se hacen **en nombre del usuario**, así que los permisos de SharePoint del usuario también aplican.

## 4. Control de acceso por rol

El controller define los roles permitidos del endpoint y llama a `AccessService.hasAccess(req, graphToken, allowedRoles)` ([src/common/access/access.service.ts](../src/common/access/access.service.ts)). Este delega en `UsuariosParkingService.getRole` ([src/routes/usuariosParking/usuariosParking.service.ts](../src/routes/usuariosParking/usuariosParking.service.ts#L59)):

1. Busca en la lista `USUARIOS_PARKING_LIST_NAME` un ítem cuyo `Title` sea el `upn` del usuario. Si existe, devuelve su campo `Rol`.
2. Si no existe, consulta si el usuario pertenece al grupo `OUTLOOK_GROUP_ID`. Si pertenece, su rol es `Usuario`.
3. Si no está en ninguno de los dos, lanza **401** `El usuario no esta registrado en la app`.

Si el rol obtenido no está en `allowedRoles`, el controller lanza **401** `El usuario no tiene acceso`.

## 5. Lógica de negocio (service del router)

El controller llama al método correspondiente del service de su router (`src/routes/<router>/<router>.service.ts`), pasándole el `graphToken` y, según el caso, `req.body`, parámetros de ruta (`:id`) o query (`?field=&value=`).

Aquí viven las validaciones propias del dominio (por ejemplo, turno válido o celda disponible en reservas) y cualquier combinación de datos de varias listas. Cada service obtiene el nombre de su lista desde el `.env` en el constructor.

## 6. Acceso a datos (Microsoft Graph)

Todos los services usan [src/common/graph/graphRest.service.ts](../src/common/graph/graphRest.service.ts), que encapsula las llamadas a `https://graph.microsoft.com/v1.0`:

| Método | Qué hace |
| --- | --- |
| `get(token, lista, itemId?)` | Trae todos los ítems de una lista, o uno solo por ID. |
| `getFiltred(token, lista, filtros)` | Trae ítems filtrando con OData (`fields/<campo> eq '<valor>'`, unidos con `and`). |
| `create(token, campos, lista)` | Crea un ítem. |
| `update(token, itemId, campos, lista)` | Actualiza los campos de un ítem (`PATCH .../fields`). |
| `delete(token, itemId, lista)` | Elimina un ítem. |
| `getInfoMe` / `getPhotoMe` | Perfil y foto del usuario autenticado. |
| `getMailList` / `addMailList` / `removeMailList` | Miembros del grupo `OUTLOOK_GROUP_ID`. |
| `getAllWorkers` | Todos los usuarios del directorio. |

Internamente resuelve y **cachea en memoria** el `siteId` del sitio de SharePoint y el `listId` de cada lista a partir de su nombre, para no repetir esas consultas en cada petición.

## 7. Respuesta

- En las lecturas, el service convierte cada ítem de Graph (`{ id, fields: {...} }`) a su DTO con un método privado `toModel`, y el controller devuelve ese arreglo como JSON.
- En creaciones y ediciones se devuelve el ítem (o sus `fields`) tal como lo responde Graph.
- Los errores lanzados con `HttpException` (o sus variantes `BadRequestException`, `NotFoundException`, `ConflictException`) se convierten en la respuesta HTTP con su código. Cualquier otro error termina en **500**.

## Patrón de un endpoint

Todos los endpoints siguen esta forma:

```ts
@Get('ruta')
@UseGuards(AuthGuard('azure-token'))                           // paso 2
async metodo(@Req() req: Request) {
  const graphToken = await this.OBOService.changeToken(req);   // paso 3
  const allowedRoles = ['Admin'] as Array<'Usuario' | 'Admin'>;
  if (!(await this.accessService.hasAccess(req, graphToken, allowedRoles)))  // paso 4
    throw new HttpException('El usuario no tiene acceso', HttpStatus.UNAUTHORIZED);
  return this.miService.miMetodo(graphToken, req.body);        // pasos 5–7
}
```
