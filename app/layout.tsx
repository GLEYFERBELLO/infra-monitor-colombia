import type { Metadata } from "next";
import "./globals.css";
import "swagger-ui-react/swagger-ui.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "InfraMonitor Colombia",
  description: "Monitoreo preventivo de infraestructura pública y comunitaria en Colombia",
  icons: {
    icon: "/inframonitor.png",
    shortcut: "/inframonitor.png",
    apple: "/inframonitor.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
