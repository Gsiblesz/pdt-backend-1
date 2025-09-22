# PDT Backend — API de Registros

Backend Node.js/Express con Prisma y PostgreSQL (Neon). Expone endpoints para crear, listar y borrar registros enviados por el frontend.

URL pública (Render):

- https://pdt-backend-1.onrender.com

## Endpoints

- POST /registros
  - Crea un registro. El cuerpo se guarda completo en la columna JSON `data` y se copia `fecha` a una columna plana para indexado.
  - 201: retorna el registro creado.
  - 400: error de validación o payload inválido.

- GET /registros
  - Lista todos los registros, ordenados por `createdAt` descendente.
  - 200: array de registros.

- DELETE /registros
  - Elimina todos los registros. Úsalo con cuidado.
  - 200: `{ deleted: <count> }`.

- DELETE /registros/:id
  - Elimina un único registro por `id`.
  - 200: `{ deleted: <id> }` si existía.
  - 400: `ID inválido` si `:id` no es numérico.
  - 404: `{ error: "Registro no encontrado" }` si ya no existe (manejo Prisma P2025).

## Modelo de datos (Prisma)

La tabla principal es `Registro` (fragmento):

```prisma
model Registro {
  id        Int      @id @default(autoincrement())
  fecha     String   @default("")
  data      Json
  createdAt DateTime @default(now())
}
```

El frontend envía un payload como:

```json
{
  "fecha": "2025-09-22",
  "tempAmbiente": "25",
  "humedad": "48",
  "personal": "6",
  "amasadoras": [
    {
      "nombre": "Amasadora 3",
      "tipoMasa": "Tradicional",
      "hielo": "No",
      "lote": "5",
      "tempMasa": "25",
      "observaciones": "bien",
      "procesos": [
        { "id": 1, "minutos": 10, "segundos": 5, "startTime": 1695390000000, "endTime": 1695390605000 }
      ]
    }
  ]
}
```

## Desarrollo local

Requisitos:
- Node 18+
- PostgreSQL (o Neon) y `DATABASE_URL` válida

Variables de entorno (archivo `.env`):

```
DATABASE_URL="postgresql://user:pass@host:port/db?schema=public"
```

Instalación y ejecución:

```powershell
# Instalar dependencias
npm install

# Generar cliente Prisma y aplicar migraciones
npx prisma generate
npx prisma migrate deploy

# Iniciar servidor (por defecto en 3000)
npm start
```

Nota: en producción (Render) se ejecuta `postinstall` con `prisma generate` y `prisma migrate deploy` automáticamente.

## Pruebas rápidas (PowerShell)

- GET
```powershell
(Invoke-RestMethod -Uri https://pdt-backend-1.onrender.com/registros -Method GET) | ConvertTo-Json -Depth 4
```

- POST
```powershell
$body = @{ fecha = '2025-09-22'; tempAmbiente = '25'; humedad = '48'; personal = '6'; amasadoras = @(@{ nombre='Amasadora 3'; tipoMasa='Tradicional'; hielo='No'; tempMasa='25'; observaciones='ok'; procesos=@() }) } | ConvertTo-Json
Invoke-RestMethod -Uri https://pdt-backend-1.onrender.com/registros -Method POST -ContentType 'application/json' -Body $body
```

- DELETE (todos)
```powershell
Invoke-RestMethod -Uri https://pdt-backend-1.onrender.com/registros -Method DELETE
```

- DELETE (por id)
```powershell
Invoke-WebRequest -Uri https://pdt-backend-1.onrender.com/registros/123 -Method DELETE | Select-Object -ExpandProperty StatusCode
```

## Errores comunes

- 404 al borrar por id: el registro ya no existe (esperado).
- 400 `ID inválido`: el parámetro `:id` no es un entero.
- 500 al crear: payload con tipos inesperados o `DATABASE_URL` incorrecta.
- CORS: el servidor permite `*` por defecto. Para restringir, edita `server.js` y configura `cors()`.

## Despliegue (Render)

- Variables necesarias: `DATABASE_URL`
- Script de inicio: `npm start`
- Postinstall: `prisma generate && prisma migrate deploy`
- Logs y errores: panel de Render → Logs del servicio
