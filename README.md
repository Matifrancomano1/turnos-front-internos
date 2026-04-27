# TurnoApp — Frontend v2

Sistema SaaS de gestión de turnos y servicios técnicos.

## Setup rápido

```bash
cp .env.example .env        # configurar VITE_API_URL
npm install
npm run dev                 # → http://localhost:5173
```

---

## Rutas

| URL | Tipo | Descripción |
|---|---|---|
| `/solicitar/:slug` | 🌐 Pública | Formulario de solicitud de turno (sin login) |
| `/turno/:token` | 🌐 Pública | Estado del turno + aceptar/rechazar cotización + cancelar |
| `/panel/login` | 🔒 Auth | Login de operadores y admins |
| `/panel/dashboard` | 🔒 Panel | KPIs y últimos turnos |
| `/panel/turnos` | 🔒 Panel | Gestión completa de turnos |
| `/panel/agenda` | 🔒 Panel | FullCalendar + bloqueos |
| `/panel/cotizaciones` | 🔒 Panel | Cola de cotizaciones pendientes |
| `/panel/reportes` | 🔒 Panel | Gráficos y exportación Excel |
| `/panel/configuracion` | 🔒 Panel | Horarios y catálogo de servicios |

---

## Flujo del cliente (sin login)

```
1. Negocio comparte:  https://app.com/solicitar/mi-empresa
2. Cliente llena el formulario en 3 pasos:
   Paso 1 → Elige servicio + describe el problema
   Paso 2 → Elige fecha preferida + horario
   Paso 3 → Ingresa nombre, email y WhatsApp
3. Sistema crea el turno con estado SOLICITADO
4. Sistema envía link único:  https://app.com/turno/TOKEN_UNICO
5. Desde ese link el cliente puede:
   - Ver estado actual del turno
   - Ver y aceptar/rechazar la cotización
   - Cancelar (solo con ≥48hs de anticipación)
```

---

## Stack

- **React 18** + TypeScript + Vite
- **Tailwind CSS** (sin shadcn — clases puras del POC)
- **TanStack Query v5** — fetching y caché
- **React Hook Form** + **Zod** — formularios con validación
- **Zustand** — estado global (auth persistido)
- **Axios** — HTTP con interceptor de auto-refresh JWT
- **FullCalendar v6** — agenda
- **Recharts** — gráficos
- **Sonner** — notificaciones toast
- **date-fns** — manejo de fechas

---

## Backend esperado

El frontend consume los siguientes endpoints adicionales (públicos, sin JWT):

```
GET  /api/v1/public/empresas/:slug              → datos de la empresa
GET  /api/v1/public/empresas/:slug/servicios    → catálogo activo
GET  /api/v1/public/empresas/:slug/disponibilidad?fecha=&servicioId=
POST /api/v1/public/empresas/:slug/turnos       → crea turno (body: nombre, email, whatsapp, servicioId, fechaPreferida, horaPreferida, descripcion)
                                                  responde: { turnoId, tokenAcceso, estado, mensaje }

GET  /api/v1/public/turnos/:token               → estado del turno por token único
POST /api/v1/public/turnos/:token/cotizacion/aceptar
POST /api/v1/public/turnos/:token/cotizacion/rechazar
DELETE /api/v1/public/turnos/:token             → cancelar (query: motivo)
```

El campo `tokenAcceso` es un UUID o JWT de corta vida generado al crear el turno,
enviado al cliente por WhatsApp y email.
