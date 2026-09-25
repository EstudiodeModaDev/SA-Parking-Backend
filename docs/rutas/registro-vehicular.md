# Router `registro-vehicular`

[← Rutas y endpoints](../rutas.md) · [Flujo de datos](../flujo-de-datos.md)

CRUD del registro de vehículos de los colaboradores. Todos los endpoints son solo para **Admin**.

## Archivos

| Archivo | Responsabilidad |
| --- | --- |
| [registroVehicular.controller.ts](../../src/routes/registroVehicular/registroVehicular.controller.ts) | Endpoints y roles. |
| [registroVehicular.service.ts](../../src/routes/registroVehicular/registroVehicular.service.ts) | CRUD sobre la lista. |
| [registroVehicular.module.ts](../../src/routes/registroVehicular/registroVehicular.module.ts) | Dependencias del router. |
| [dto/registroVehicular.dto.ts](../../src/routes/registroVehicular/dto/registroVehicular.dto.ts) | `RegistroVehicularDTO`. |

**Lista de SharePoint:** `REGISTRO_VEHICULAR_LIST_NAME`

## Endpoints

### `GET /registro-vehicular`

- **Controller:** `getRegistroVehicular` — [registroVehicular.controller.ts:12](../../src/routes/registroVehicular/registroVehicular.controller.ts#L12)
- **Service:** `get` — [registroVehicular.service.ts:14](../../src/routes/registroVehicular/registroVehicular.service.ts#L14)
- **Respuesta:** `RegistroVehicularDTO[]`

### `POST /registro-vehicular/create`

- **Controller:** `CreateRegistroVehicular` — [registroVehicular.controller.ts:20](../../src/routes/registroVehicular/registroVehicular.controller.ts#L20)
- **Service:** `create` — [registroVehicular.service.ts:20](../../src/routes/registroVehicular/registroVehicular.service.ts#L20)
- **Body:** `{ Title, Cedula, TipoVeh, PlacaVeh, CorreoReporte }`
- **Respuesta:** `fields` del ítem creado.

### `PUT /registro-vehicular/edit/:id`

- **Controller:** `EditRegistroVehicular` — [registroVehicular.controller.ts:28](../../src/routes/registroVehicular/registroVehicular.controller.ts#L28)
- **Service:** `edit` — [registroVehicular.service.ts:25](../../src/routes/registroVehicular/registroVehicular.service.ts#L25)
- **Body:** campos a modificar.

### `DELETE /registro-vehicular/delete/:id`

- **Controller:** `deleteRegistroVehicular` — [registroVehicular.controller.ts:36](../../src/routes/registroVehicular/registroVehicular.controller.ts#L36)
- **Service:** `delete` — [registroVehicular.service.ts:30](../../src/routes/registroVehicular/registroVehicular.service.ts#L30)

## Modelo `RegistroVehicularDTO`

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `ID` | string | ID del ítem. |
| `Title` | string | Nombre. |
| `Cedula` | string | Documento de identidad. |
| `TipoVeh` | `"Carro" \| "Moto"` | Tipo de vehículo. |
| `PlacaVeh` | string | Placa. |
| `CorreoReporte` | string | Correo de contacto. |

