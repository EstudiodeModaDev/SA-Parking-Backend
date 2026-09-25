# Router `parkingSlots`

[← Rutas y endpoints](../rutas.md) · [Flujo de datos](../flujo-de-datos.md)

Celdas de parqueo. Además del CRUD, calcula la **ocupación por turno** de cada celda a partir de las reservas activas. Su service lo reutiliza el router de [reservas](reservas.md) para asignar y validar celdas.

## Archivos

| Archivo | Responsabilidad |
| --- | --- |
| [parkingSlots.controller.ts](../../src/routes/parkingSlots/parkingSlots.controller.ts) | Endpoints y roles. |
| [parkingSlots.service.ts](../../src/routes/parkingSlots/parkingSlots.service.ts) | CRUD de celdas y cálculo de ocupación. |
| [fechas.ts](../../src/routes/parkingSlots/fechas.ts) | Normalización de fechas a `YYYY-MM-DD` en hora de Colombia (`normalizarFecha`, `fechaHoy`). |
| [turnos.ts](../../src/routes/parkingSlots/turnos.ts) | Tipos y funciones de turnos (`Manana`, `Tarde`, `Día completo`). |
| [parkingSlots.module.ts](../../src/routes/parkingSlots/parkingSlots.module.ts) | Dependencias; exporta `ParkingSlotsService`. |
| [dto/ParkingSlots.dto.ts](../../src/routes/parkingSlots/dto/ParkingSlots.dto.ts) | `ParkingSlotDTO` y `ParkingSlotDeactivateDTO` (todos los campos opcionales, para ediciones). |

**Listas de SharePoint:** `PARKING_SLOTS_LIST_NAME` (celdas) y `RESERVAS_LIST_NAME` (para la ocupación).

## Endpoints

### `GET /parkingSlots/getSlots`

- **Roles:** Admin, Usuario
- **Controller:** `getSlots` — [parkingSlots.controller.ts:27](../../src/routes/parkingSlots/parkingSlots.controller.ts#L27)
- **Service:** `getParkingSlots` — [parkingSlots.service.ts:16](../../src/routes/parkingSlots/parkingSlots.service.ts#L16)
- **Lógica:**
  1. En paralelo: trae las celdas con `Activa = "Activa"` y calcula la ocupación con `getOcupacion` ([parkingSlots.service.ts:42](../../src/routes/parkingSlots/parkingSlots.service.ts#L42)).
  0. Query opcional `?date=YYYY-MM-DD` (por defecto, hoy en hora de Colombia). Fecha inválida → **400**.
  2. `getOcupacion` lee las reservas con `Status = "Activa"`, descarta las que no son de la fecha consultada (la `Date` se normaliza con `normalizarFecha` de [fechas.ts](../../src/routes/parkingSlots/fechas.ts), porque SharePoint la devuelve en UTC) y, por cada una, marca el turno ocupado de su `SpotId` con `ocuparTurno` ([turnos.ts:15](../../src/routes/parkingSlots/turnos.ts#L15)). `Día completo` ocupa mañana y tarde.
  3. A cada celda se le agrega `Ocupacion: { Manana, Tarde }`.
- **Respuesta:** `ParkingSlotDTO[]` con `Ocupacion`.

### `POST /parkingSlots/createSlot`

- **Roles:** Admin
- **Controller:** `CreateSlot` — [parkingSlots.controller.ts:40](../../src/routes/parkingSlots/parkingSlots.controller.ts#L40)
- **Service:** `createSlot` — [parkingSlots.service.ts:58](../../src/routes/parkingSlots/parkingSlots.service.ts#L58)
- **Body:** `{ Title, TipoCelda, Itinerancia, Activa }`

### `PUT /parkingSlots/inactiveSlot/:id`

- **Roles:** Admin
- **Controller:** `InactiveSlot` — [parkingSlots.controller.ts:53](../../src/routes/parkingSlots/parkingSlots.controller.ts#L53)
- **Service:** `putSlot` — [parkingSlots.service.ts:68](../../src/routes/parkingSlots/parkingSlots.service.ts#L68) con `{ Activa: "Inactiva" }`.

### `PUT /parkingSlots/activeSlot/:id`

- **Roles:** Admin
- **Controller:** `activeSlot` — [parkingSlots.controller.ts:68](../../src/routes/parkingSlots/parkingSlots.controller.ts#L68)
- **Service:** `putSlot` con `{ Activa: "Activa" }`.

### `PUT /parkingSlots/editSlot/:id`

- **Roles:** Admin
- **Controller:** `editSlot` — [parkingSlots.controller.ts:83](../../src/routes/parkingSlots/parkingSlots.controller.ts#L83)
- **Service:** `putSlot` con el body recibido (`ParkingSlotDeactivateDTO`).

## Métodos usados por otros routers

| Método | Usado por | Descripción |
| --- | --- | --- |
| `getParkingSlots` | `reservasService.reservRandomSlot` | Celdas activas con ocupación, para elegir una libre al azar. |
| `getSlotByTitle` — [parkingSlots.service.ts:29](../../src/routes/parkingSlots/parkingSlots.service.ts#L29) | `reservasService.validarCeldaPuntual` | Una celda por `Title` con su ocupación. |

Las funciones de [turnos.ts](../../src/routes/parkingSlots/turnos.ts) (`esTurnoValido`, `turnoDisponible`) también se usan en reservas.

## Modelo `ParkingSlotDTO`

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `ID` | string | ID del ítem. |
| `Title` | string | Código de la celda. Es el valor que las reservas guardan en `SpotId`. |
| `TipoCelda` | `"Carro" \| "Moto"` | Tipo de vehículo. |
| `Itinerancia` | `"Empleado Itinerante" \| "Directivo" \| "Empleado Fijo"` | A quién está destinada. |
| `Activa` | `"Activa" \| "Inactiva"` | Estado. |
| `Ocupacion` | `{ Manana: boolean, Tarde: boolean }` | Solo en lecturas; calculada, no se guarda. |

