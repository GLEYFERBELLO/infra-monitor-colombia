import { NextResponse } from "next/server";

export async function GET() {
  const spec = {
    openapi: "3.0.0",
    info: {
      title: "InfraMonitor Colombia API",
      version: "1.0.0",
      description: "API REST para monitoreo preventivo de infraestructura pública y comunitaria.",
    },
    servers: [{ url: "/api" }],
    paths: {
      "/auth/register": {
        post: {
          summary: "Registrar usuario",
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Register" } } } },
          responses: { "201": { description: "Usuario registrado" }, "409": { description: "Correo duplicado" } },
        },
      },
      "/auth/login": {
        post: {
          summary: "Iniciar sesión",
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Login" } } } },
          responses: { "200": { description: "Sesión iniciada" }, "401": { description: "Credenciales inválidas" } },
        },
      },
      "/reports": {
        get: { summary: "Listar reportes", responses: { "200": { description: "Listado de reportes" } } },
        post: {
          summary: "Crear reporte",
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Report" } } } },
          responses: { "201": { description: "Reporte creado" }, "401": { description: "No autorizado" } },
        },
      },
      "/reports/{id}": {
        get: { summary: "Consultar reporte", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Reporte encontrado" } } },
        patch: { summary: "Actualizar reporte", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Reporte actualizado" } } },
        delete: { summary: "Eliminar reporte", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Reporte eliminado" } } },
      },
      "/dashboard": { get: { summary: "Indicadores del sistema", responses: { "200": { description: "Estadísticas principales" } } } },
    },
    components: {
      securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
      schemas: {
        Register: { type: "object", properties: { name: { type: "string" }, email: { type: "string" }, password: { type: "string" } } },
        Login: { type: "object", properties: { email: { type: "string" }, password: { type: "string" } } },
        Report: {
          type: "object",
          properties: {
            title: { type: "string" }, infrastructureType: { type: "string" }, damageType: { type: "string" }, description: { type: "string" }, city: { type: "string" }, neighborhood: { type: "string" }, address: { type: "string" }, riskLevel: { type: "string", enum: ["Bajo", "Medio", "Alto", "Crítico"] }, status: { type: "string" }
          },
        },
      },
    },
  };

  return NextResponse.json(spec);
}
