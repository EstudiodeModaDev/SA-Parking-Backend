# Router `reserva`

[← Rutas y endpoints](../rutas.md) · [Flujo de datos](../flujo-de-datos.md)

Creación, consulta y cancelación de reservas de celdas por turno. Hay dos formas de reservar:

- **Rápida (`Quick`):** el backend elige al azar una celda libre del tipo de vehículo y turno pedidos.
- **Puntual (`Punt`):** el cliente indica la celda (`SpotId`) y el backend valida que se pueda reservar.

Cada una tiene variante **Usr** (la reserva queda a nombre del usuario autenticado, tomado del token) y **Adm** (el admin indica a nombre de quién).

## Archivos

| Archivo | Responsabilidad |
| --- | --- |
| [reservas.controller.ts](../../src/routes/reservas/reservas.controller.ts) | Endpoints, roles y bifurcación por rol (Admin/Usuario). |
| [reservas.service.ts](../../src/routes/reservas/reservas.service.ts) | Consultas, validaciones, asignación de celda y cancelación. |
| [reservas.module.ts](../../src/routes/reservas/reservas.module.ts) | Dependencias; importa `UsuariosParkingModule` y `ParkingSlotsModule`. |
| [dto/reservas.dto.ts](../../src/routes/reservas/dto/reservas.dto.ts) | `ReservasDTO`. |

Depende de [parkingSlots](parking-slots.md) (`ParkingSlotsService` y [turnos.ts](../../src/routes/parkingSlots/turnos.ts)) y de [usuarios](usuarios.md) (`getRole`).

**Lista de SharePoint:** `RESERVAS_LIST_NAME`

## Endpoints de consulta

### `GET /reserva`

- **Controller:** `getReservas` — [reservas.controller.ts:29](../../src/routes/reservas/reservas.controller.ts#L29)
- **Lógica:** obtiene el rol con `getRole` y:
  - **Admin** → `getAllActive` ([reservas.service.ts:49](../../src/routes/reservas/reservas.service.ts#L49)): todas las reservas con `Status = "Activa"`.
  - **Usuario** → `getUserActive` ([reservas.service.ts:30](../../src/routes/reservas/reservas.service.ts#L30)): reservas activas con `Title` = su correo.
- **Respuesta:** `ReservasDTO[]`

### `GET /reserva/history`

- **Controller:** `getReservasHistory` — [reservas.controller.ts:50](../../src/routes/reservas/reservas.controller.ts#L50)
- **Lógica:**
  - **Admin** → `getAllHistory` ([reservas.service.ts:43](../../src/routes/reservas/reservas.service.ts#L43)): todas las reservas.
  - **Usuario** → `getUserHistory` ([reservas.service.ts:20](../../src/routes/reservas/reservas.service.ts#L20)): reservas filtradas por `UserEmail` = su correo.

## Endpoints de creación

Body común:

```json
{
  "Turn": "Manana | Tarde | Día completo",
  "VehicleType": "Carro | Moto",
  "Date": "YYYY-MM-DD",
  "Codigo": "<código>",
  "Notify": true
}
```

Las variantes **Adm** agregan `Title` (correo) y `NombreUsuario`. Las variantes **Punt** agregan `SpotId` (el `Title` de la celda). Toda reserva se crea con `Status = "Activa"`.

### `POST /reserva/createQuickUsr`

- **Controller:** `createQuickResv` — [reservas.controller.ts:71](../../src/routes/reservas/reservas.controller.ts#L71)
- **Service:** `createQuickUsuario` — [reservas.service.ts:59](../../src/routes/reservas/reservas.service.ts#L59)
- **Lógica:** `validarDatosReserva` → `reservRandomSlot` → crea el ítem con `Title` = `upn` y `NombreUsuario` = `name` del token.

### `POST /reserva/createQuickAdm`

- **Controller:** `createQuickResvAdm` — [reservas.controller.ts:89](../../src/routes/reservas/reservas.controller.ts#L89)
- **Service:** `createQuickAdmin` — [reservas.service.ts:81](../../src/routes/reservas/reservas.service.ts#L81)
- **Lógica:** igual que la anterior, pero `Title` y `NombreUsuario` vienen del body.

### `POST /reserva/createPuntUsr`

- **Controller:** `createPuntResvUsr` — [reservas.controller.ts:113](../../src/routes/reservas/reservas.controller.ts#L113)
- **Service:** `createPuntualUsr` — [reservas.service.ts:103](../../src/routes/reservas/reservas.service.ts#L103)
- **Lógica:** `validarDatosReserva` → `validarCeldaPuntual` → crea el ítem a nombre del usuario del token.

### `POST /reserva/createPuntAdm`

- **Controller:** `createPuntResvAdm` — [reservas.controller.ts:101](../../src/routes/reservas/reservas.controller.ts#L101)
- **Service:** `createPuntualAdm` — [reservas.service.ts:124](../../src/routes/reservas/reservas.service.ts#L124)
- **Lógica:** igual que la anterior, con `Title` y `NombreUsuario` del body.

Todas devuelven los `fields` de la reserva creada.

## Endpoint de cancelación

### `PUT /reserva/cancelReserv/:id`

- **Controller:** `CancelReserv` — [reservas.controller.ts:131](../../src/routes/reservas/reservas.controller.ts#L131)
- **Lógica:** según el rol:
  - **Admin** → `cancelAdmin` ([reservas.service.ts:146](../../src/routes/reservas/reservas.service.ts#L146)): cambia `Status` a `"Cancelada"`.
  - **Usuario** → `cancelUsr` ([reservas.service.ts:149](../../src/routes/reservas/reservas.service.ts#L149)): comprueba que la reserva esté entre sus reservas activas; si no, **400**. Si sí, la cancela.

## Validaciones internas

| Método | Ubicación | Reglas | Error |
| --- | --- | --- | --- |
| `validarDatosReserva` | [reservas.service.ts:157](../../src/routes/reservas/reservas.service.ts#L157) | `Turn` debe ser `Manana`, `Tarde` o `Día completo`. | 400 |
| | | `VehicleType` debe ser `Carro` o `Moto`. | 400 |
| | | `Date` debe ser una fecha válida y no anterior a hoy. La ocupación se evalúa solo para ese día. | 400 |
| `validarCeldaPuntual` | [reservas.service.ts:166](../../src/routes/reservas/reservas.service.ts#L166) | Debe venir `SpotId`. | 400 |
| | | La celda debe existir. | 404 |
| | | La celda debe estar `Activa`. | 409 |
| | | `TipoCelda` debe coincidir con `VehicleType`. | 400 |
| | | El turno debe estar libre (`turnoDisponible`). | 409 |
| `reservRandomSlot` | [reservas.service.ts:185](../../src/routes/reservas/reservas.service.ts#L185) | Filtra celdas activas del tipo de vehículo y libres en el turno; elige una al azar. Si no hay, error. | 409 |

## Modelo `ReservasDTO`

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `ID` | string | ID del ítem. |
| `Title` | string | Correo del usuario de la reserva. |
| `Creadopor` | string | Quién la creó. |
| `NombreUsuario` | string | Nombre del usuario. |
| `Turn` | `"Manana" \| "Tarde" \| "Día completo"` | Turno. |
| `SpotId` | string | `Title` de la celda reservada. |
| `Status` | `"Activa" \| "Cancelada" \| "Terminada"` | Estado. |
| `VehicleType` | `"Carro" \| "Moto"` | Tipo de vehículo. |
| `Date` | string | Fecha de la reserva. |
| `Creado` | string | Fecha de creación. |
| `Codigo` | string | Código de la reserva. |
| `Notify` | boolean | Si se notifica al usuario. |
