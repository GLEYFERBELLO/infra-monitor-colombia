"use client";

import SwaggerUI from "swagger-ui-react";
import Navbar from "@/components/Navbar";

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-2 text-3xl font-black text-slate-950">Documentación REST con Swagger</h1>
        <p className="mb-8 text-slate-500">Endpoints principales del backend de InfraMonitor Colombia.</p>
        <SwaggerUI url="/api/swagger" />
      </section>
    </main>
  );
}
