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
        patch: {
          summary: "Actualizar reporte, validar riesgo o cambiar estado",
          description:
            "El autor puede corregir su reporte mientras siga en estado Registrado. La validación del nivel de riesgo y los cambios de estado quedan reservados a gestor y administrador; el estado Cerrado solo lo asigna un administrador.",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ReportUpdate" } } } },
          responses: {
            "200": { description: "Reporte actualizado" },
            "401": { description: "Sin sesión" },
            "403": { description: "Rol sin permiso o transición de estado no permitida" },
          },
        },
        delete: {
          summary: "Eliminar reporte",
          description: "Disponible únicamente para el rol administrador.",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "Reporte eliminado" },
            "401": { description: "Sin sesión" },
            "403": { description: "Solo un administrador puede eliminar" },
          },
        },
      },
      "/dashboard": {
        get: {
          summary: "Indicadores del sistema",
          description: "Disponible para gestor y administrador.",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Estadísticas principales" },
            "401": { description: "Sin sesión" },
            "403": { description: "Rol sin permiso" },
          },
        },
      },
      "/users": {
        get: {
          summary: "Listar usuarios",
          description: "Disponible únicamente para el rol administrador.",
          security: [{ bearerAuth: [] }],
          responses: { "200": { description: "Listado de usuarios" }, "403": { description: "Rol sin permiso" } },
        },
      },
      "/users/{id}": {
        patch: {
          summary: "Asignar rol a un usuario",
          description: "Disponible únicamente para el rol administrador.",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/RoleUpdate" } } } },
          responses: { "200": { description: "Rol actualizado" }, "403": { description: "Rol sin permiso" } },
        },
      },
    },
    components: {
      securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
      schemas: {
        Register: { type: "object", properties: { name: { type: "string" }, email: { type: "string" }, password: { type: "string" } } },
        Login: { type: "object", properties: { email: { type: "string" }, password: { type: "string" } } },
        Report: {
          type: "object",
          properties: {
            title: { type: "string" }, infrastructureType: { type: "string" }, damageType: { type: "string" }, description: { type: "string" }, city: { type: "string" }, neighborhood: { type: "string" }, address: { type: "string" }, riskLevel: { type: "string", enum: ["Bajo", "Medio", "Alto", "Crítico"] }
          },
          description: "El estado inicial no se recibe por parámetro: todo reporte se crea en Registrado.",
        },
        ReportUpdate: {
          type: "object",
          properties: {
            riskLevel: { type: "string", enum: ["Bajo", "Medio", "Alto", "Crítico"] },
            validateRisk: { type: "boolean", description: "Confirma el nivel de riesgo. Solo gestor o administrador." },
            status: {
              type: "string",
              enum: ["Registrado", "En revisión", "Priorizado", "En atención", "Solucionado", "Cerrado"],
              description: "Debe respetar el flujo: Registrado, En revisión, Priorizado o En atención, Solucionado y Cerrado.",
            },
            note: { type: "string", description: "Nota de soporte, obligatoria al pasar a En atención y a Solucionado." },
          },
        },
        RoleUpdate: {
          type: "object",
          properties: { role: { type: "string", enum: ["ciudadano", "gestor", "admin"] } },
        },
      },
    },
  };

  return NextResponse.json(spec);
}
