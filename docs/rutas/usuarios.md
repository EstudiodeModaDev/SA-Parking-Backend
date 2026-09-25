# Router `usuarios`

[← Rutas y endpoints](../rutas.md) · [Flujo de datos](../flujo-de-datos.md)

Usuarios registrados en la app con su rol, e información del usuario autenticado. Su service también lo usa el control de acceso de toda la API para resolver el rol (`getRole`).

## Archivos

| Archivo | Responsabilidad |
| --- | --- |
| [usuariosParking.controller.ts](../../src/routes/usuariosParking/usuariosParking.controller.ts) | Endpoints y roles. |
| [usuariosParking.service.ts](../../src/routes/usuariosParking/usuariosParking.service.ts) | Consultas a la lista, a Graph `/me` y resolución de rol. |
| [usuariosParking.module.ts](../../src/routes/usuariosParking/usuariosParking.module.ts) | Dependencias; exporta `UsuariosParkingService`. Usa `forwardRef` porque `AccessModule` y este módulo dependen entre sí. |
| [dto/usuariosParking.dto.ts](../../src/routes/usuariosParking/dto/usuariosParking.dto.ts) | `UsuariosParkingDTO`. |

**Lista de SharePoint:** `USUARIOS_PARKING_LIST_NAME`

## Endpoints

### `GET /usuarios/getUsers`

- **Roles:** Admin
- **Controller:** `getUsers` — [usuariosParking.controller.ts:29](../../src/routes/usuariosParking/usuariosParking.controller.ts#L29)
- **Service:** `getUsuarios` — [usuariosParking.service.ts:18](../../src/routes/usuariosParking/usuariosParking.service.ts#L18)
- **Lógica:** trae todos los ítems de la lista y los mapea con `toModel`.
- **Respuesta:** `UsuariosParkingDTO[]`

### `GET /usuarios/getUsers?field=<campo>&value=<valor>`

- **Roles:** Admin
- **Controller:** `getUsuariosBy` — [usuariosParking.controller.ts:41](../../src/routes/usuariosParking/usuariosParking.controller.ts#L41)
- **Service:** `getUsuarioBy` — [usuariosParking.service.ts:24](../../src/routes/usuariosParking/usuariosParking.service.ts#L24)
- **Lógica:** filtra la lista por `fields/<campo> eq '<valor>'`; si no hay resultados responde **404**.
- **Nota:** comparte ruta con el endpoint anterior; ver [observaciones](#observaciones).

### `POST /usuarios/createUser`

- **Roles:** Admin
- **Controller:** `postUsers` — [usuariosParking.controller.ts:58](../../src/routes/usuariosParking/usuariosParking.controller.ts#L58)
- **Service:** `createUsuarios` — [usuariosParking.service.ts:40](../../src/routes/usuariosParking/usuariosParking.service.ts#L40)
- **Body:** `{ Title: <correo>, Rol: "Admin" | "Usuario", Permitidos: boolean }`
- **Respuesta:** ítem creado, tal como lo devuelve Graph.

### `GET /usuarios/infoMe`

- **Roles:** cualquier token válido (no pasa por `AccessService`).
- **Controller:** `getInfoMe` — [usuariosParking.controller.ts:71](../../src/routes/usuariosParking/usuariosParking.controller.ts#L71)
- **Service:** `getInfoMe` — [usuariosParking.service.ts:49](../../src/routes/usuariosParking/usuariosParking.service.ts#L49) → `GraphRestService.getInfoMe` (`GET /me`).
- **Respuesta:** perfil de Microsoft Graph del usuario autenticado.

### `GET /usuarios/infoPhotoMe`

- **Roles:** cualquier token válido.
- **Controller:** `getInfoPhotoMe` — [usuariosParking.controller.ts:78](../../src/routes/usuariosParking/usuariosParking.controller.ts#L78)
- **Service:** `getInfoPhotoMe` — [usuariosParking.service.ts:54](../../src/routes/usuariosParking/usuariosParking.service.ts#L54) → `GraphRestService.getPhotoMe` (`GET /me/photo/$value`).
- **Respuesta:** binario de la foto de perfil.

### `GET /usuarios/getRole`

- **Roles:** cualquier token válido.
- **Controller:** `getMyRole` — [usuariosParking.controller.ts:85](../../src/routes/usuariosParking/usuariosParking.controller.ts#L85)
- **Service:** `getRole` — [usuariosParking.service.ts:59](../../src/routes/usuariosParking/usuariosParking.service.ts#L59)
- **Lógica:**
  1. Busca en la lista un ítem con `Title` = `upn` del token. Si existe, devuelve su `Rol`.
  2. Si no, consulta si el correo pertenece al grupo `OUTLOOK_GROUP_ID`; si pertenece devuelve `"Usuario"`.
  3. Si tampoco, responde **401** `El usuario no esta registrado en la app`.
- **Respuesta:** `"Admin"` o `"Usuario"`.

## Modelo `UsuariosParkingDTO`

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `ID` | string | ID del ítem. |
| `Title` | string | Correo (UPN) del usuario. |
| `Rol` | string | `Admin` o `Usuario`. |
| `Permitidos` | boolean | Indicador de permiso. |
