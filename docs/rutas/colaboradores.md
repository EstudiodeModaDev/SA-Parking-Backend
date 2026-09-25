# Router `colaboradores`

[← Rutas y endpoints](../rutas.md) · [Flujo de datos](../flujo-de-datos.md)

Dos responsabilidades:

1. **Colaboradores fijos:** personas con celda asignada de forma permanente (lista de SharePoint).
2. **Grupo de Microsoft:** administración de los miembros del grupo `OUTLOOK_GROUP_ID`, que son quienes obtienen el rol `Usuario` sin estar en la lista de usuarios.

Todos los endpoints son solo para **Admin**.

## Archivos

| Archivo | Responsabilidad |
| --- | --- |
| [colaboradores.controller.ts](../../src/routes/colaboradores/colaboradores.controller.ts) | Endpoints y roles. |
| [colaboradores.service.ts](../../src/routes/colaboradores/colaboradores.service.ts) | CRUD de la lista y operaciones sobre el grupo. |
| [colaboradores.module.ts](../../src/routes/colaboradores/colaboradores.module.ts) | Dependencias del router. |
| [dto/colaboradores.dto.ts](../../src/routes/colaboradores/dto/colaboradores.dto.ts) | `ColaboradorFijoDTO`. |

**Lista de SharePoint:** `COLABORADORES_FIJOS_LIST_NAME` · **Grupo:** `OUTLOOK_GROUP_ID`

## Endpoints — colaboradores fijos

### `GET /colaboradores/fijos`

- **Controller:** `getColaboradoresFijos` — [colaboradores.controller.ts:27](../../src/routes/colaboradores/colaboradores.controller.ts#L27)
- **Service:** `getColaboradoresFijos` — [colaboradores.service.ts:14](../../src/routes/colaboradores/colaboradores.service.ts#L14)
- **Respuesta:** `ColaboradorFijoDTO[]`

### `GET /colaboradores/fijosBy?field=<campo>&value=<valor>`

- **Controller:** `getColaboradoresBy` — [colaboradores.controller.ts:40](../../src/routes/colaboradores/colaboradores.controller.ts#L40)
- **Service:** `getColaboradorFijoBy` — [colaboradores.service.ts:30](../../src/routes/colaboradores/colaboradores.service.ts#L30)
- **Lógica:** filtro OData por campo; **404** si no hay resultados.
- **Nota:** comparte ruta con el endpoint anterior; ver [observaciones](#observaciones).

### `POST /colaboradores/createFijo`

- **Controller:** `createFijo` — [colaboradores.controller.ts:61](../../src/routes/colaboradores/colaboradores.controller.ts#L61)
- **Service:** `createColaboradorFijo` — [colaboradores.service.ts:25](../../src/routes/colaboradores/colaboradores.service.ts#L25)
- **Body:** campos de `ColaboradorFijoDTO` (con los nombres internos de la lista de SharePoint).
- **Respuesta:** `fields` del ítem creado.

### `DELETE /colaboradores/deleteFijo/:id`

- **Controller:** `deleteFijo` — [colaboradores.controller.ts:77](../../src/routes/colaboradores/colaboradores.controller.ts#L77)
- **Service:** `deleteColaboradorFijo` — [colaboradores.service.ts:20](../../src/routes/colaboradores/colaboradores.service.ts#L20)

## Endpoints — grupo de Microsoft

La lógica de Graph de estos endpoints está en [graphRest.service.ts](../../src/common/graph/graphRest.service.ts#L212) (`getMailList`, `addMailList`, `removeMailList`, `getAllWorkers`).

### `GET /colaboradores/mailList`

- **Controller:** `getMailList` — [colaboradores.controller.ts:90](../../src/routes/colaboradores/colaboradores.controller.ts#L90)
- **Service:** `getUserGroup` — [colaboradores.service.ts:39](../../src/routes/colaboradores/colaboradores.service.ts#L39)
- **Lógica:** `GET /groups/{id}/transitiveMembers` (incluye miembros de subgrupos).
- **Respuesta:** arreglo de objetos de directorio de Graph.

### `GET /colaboradores/userBy?email=<correo>`

- **Controller:** `getUserFromGroup` — [colaboradores.controller.ts:103](../../src/routes/colaboradores/colaboradores.controller.ts#L103)
- **Service:** `getUserFromGroup` — [colaboradores.service.ts:45](../../src/routes/colaboradores/colaboradores.service.ts#L45)
- **Lógica:** miembros transitivos del grupo filtrados por `mail eq '<correo>'`.

### `POST /colaboradores/addUser?email=<correo>`

- **Controller:** `addUserGroup` — [colaboradores.controller.ts:116](../../src/routes/colaboradores/colaboradores.controller.ts#L116)
- **Service:** `addUserGroup` — [colaboradores.service.ts:50](../../src/routes/colaboradores/colaboradores.service.ts#L50)
- **Lógica:** busca el ID del usuario por correo y lo agrega con `POST /groups/{id}/members/$ref`.

### `DELETE /colaboradores/remove?email=<correo>`

- **Controller:** `removeUserGroup` — [colaboradores.controller.ts:129](../../src/routes/colaboradores/colaboradores.controller.ts#L129)
- **Service:** `removeUserGroup` — [colaboradores.service.ts:55](../../src/routes/colaboradores/colaboradores.service.ts#L55)
- **Lógica:** busca el ID del usuario por correo y lo quita con `DELETE /groups/{id}/members/{userId}/$ref`.

### `GET /colaboradores/all`

- **Controller:** `getAllUsers` — [colaboradores.controller.ts:142](../../src/routes/colaboradores/colaboradores.controller.ts#L142)
- **Service:** `getAllUsers` — [colaboradores.service.ts:60](../../src/routes/colaboradores/colaboradores.service.ts#L60)
- **Lógica:** `GET /users` (todos los usuarios del directorio de la compañía).

## Modelo `ColaboradorFijoDTO`

| Campo | Tipo | Campo en SharePoint |
| --- | --- | --- |
| `ID` | string | `id` |
| `Title` | string | `Title` |
| `Correo` | string | `Correo` |
| `TipoVehiculo` | `"Carro" \| "Moto"` | `Tipodevehiculo` |
| `Placa` | string | `Placa` |
| `CodigoCelda` | string | `CodigoCelda` |
| `SpotAsignado` | string | `SpotAsignado` |

## Observaciones

- `GET /users` en Graph devuelve por defecto solo la primera página (100 usuarios); no se sigue `@odata.nextLink`.
