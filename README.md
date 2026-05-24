# InfraMonitor Colombia

Plataforma web funcional para registrar, consultar y priorizar reportes de infraestructura pública y comunitaria en Colombia.

## Tecnologías

- Next.js
- ReactJS
- TypeScript
- MongoDB Atlas
- Mongoose
- Axios
- Context API
- Hooks: useState, useEffect, useContext y useReducer
- API REST
- Swagger UI
- Vercel

## Instalación local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Luego abre:

```txt
http://localhost:3000
```

## Variables de entorno

```env
MONGODB_URI=mongodb+srv://USUARIO:CLAVE@cluster0.xxxxx.mongodb.net/infra_monitor?retryWrites=true&w=majority
JWT_SECRET=cambia_esta_clave_por_una_segura
NEXT_PUBLIC_APP_NAME=InfraMonitor Colombia
```

## Rutas principales

- `/` landing page
- `/register` registro
- `/login` inicio de sesión
- `/dashboard` panel de indicadores
- `/reports` listado de reportes
- `/reports/new` crear reporte
- `/reports/[id]` detalle de reporte
- `/api-docs` documentación Swagger

## API REST

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/reports`
- `POST /api/reports`
- `GET /api/reports/[id]`
- `PATCH /api/reports/[id]`
- `DELETE /api/reports/[id]`
- `GET /api/dashboard`
- `GET /api/swagger`

## Despliegue en Vercel

1. Subir el proyecto a GitHub.
2. Importar el repositorio desde Vercel.
3. Configurar variables de entorno.
4. Deploy.
