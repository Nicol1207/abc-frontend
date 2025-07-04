
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import AppLayout from "~/layouts/AppLayout";
import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

import { currentToken, getSidebar, requireAdmin, requireAuth, user } from "~/services/auth.server";
import { Separator } from "~/components/ui/separator";

export const meta: MetaFunction = () => {
  return [
    { title: "ABC English" },
    { name: "description", content: "Sistema educativo de inglés" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth({ request });
  await requireAdmin({ request });

  const u = await user({ request });
  const sidebar = await getSidebar({ request });

  // Llamada a la API para dashboard
  const apiUrl = process.env.API_URL || "http://localhost:3000/api/dashboard";
  const cookie = request.headers.get("cookie") || "";
  let dashboardData;
  try {
    const token = await currentToken({request});
    const res = await fetch(apiUrl, {
      headers: {
        Cookie: cookie,
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
    if (!res.ok) {
      const errorText = await res.text();
      // Mostrar error detallado en la terminal
      console.error(`Error al cargar dashboard (${res.status}):`, errorText);
      throw new Error(`Error al cargar dashboard (${res.status}): ${errorText}`);
    }
    dashboardData = await res.json();
  } catch (err: any) {
    // Mostrar error detallado en la terminal
    console.error("Error en fetch dashboard:", err);
    throw new Error(`Error en fetch dashboard: ${err?.message || err}`);
  }

  return json({
    user: {
      ...u.user,
      role: u.role,
    },
    sidebar: sidebar,
    dashboard: dashboardData,
  });
}

export default function Index() {
  const loaderData = useLoaderData<any>();
  const dashboard = loaderData.dashboard;

  const estudiantesAccesos: { nombre: string; accesos: number }[] = dashboard.estudiantesAccesos || [];
  const estudiantesPuntos: { nombre: string; puntos: number }[] = dashboard.estudiantesPuntos || [];
  const materialesUtilizados: { nombre: string; usos: number }[] = dashboard.materialesUtilizados || [];
  const cantidadProfesores = dashboard.cantidadProfesores || 0;
  const cantidadCursos = dashboard.cantidadCursos || 0;
  const cantidadEstudiantes = dashboard.cantidadEstudiantes || 0;
  const pieColors = ["#0097a7", "#26c6da", "#80deea", "#b2ebf2"];

  return (
    <AppLayout
      sidebarOptions={loaderData.sidebar}
      userData={loaderData.user}
    >
      <div className="w-full max-w-7xl mx-auto py-8">
        <div className="flex flex-col mb-4">
          <h1 className="text-4xl font-bold text-primary">Dashboard</h1>
          <Separator className="my-4 bg-[#004d5a]" />
        </div>
        {/* Cards resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <span className="text-3xl font-bold text-primary">{cantidadProfesores}</span>
            <span className="text-gray-600 mt-2">Profesores</span>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <span className="text-3xl font-bold text-primary">{cantidadCursos}</span>
            <span className="text-gray-600 mt-2">Cursos activos</span>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <span className="text-3xl font-bold text-primary">{cantidadEstudiantes}</span>
            <span className="text-gray-600 mt-2">Estudiantes totales</span>
          </div>
        </div>
        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfico de barras: Estudiantes con más accesos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-primary">Estudiantes con más accesos al software</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={estudiantesAccesos} layout="vertical" margin={{ left: 30, right: 30 }}>
                <XAxis type="number" />
                <YAxis dataKey="nombre" type="category" width={120} />
                <RechartsTooltip />
                <Bar dataKey="accesos" fill="#0097a7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Gráfico de pastel: Material más utilizado */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4 text-primary text-center">Material más utilizado por los estudiantes</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={materialesUtilizados}
                  dataKey="usos"
                  nameKey="nombre"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {materialesUtilizados.map((entry: { nombre: string; usos: number }, index: number) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Legend />
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Gráfico de barras: Estudiantes con más puntos (ancho completo, barras verticales) */}
          <div className="bg-white rounded-lg shadow p-6 col-span-1 lg:col-span-3">
            <h2 className="text-xl font-semibold mb-4 text-primary">Estudiantes con más Recompensas</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={estudiantesPuntos} margin={{ left: 30, right: 30 }}>
                <XAxis dataKey="nombre" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="puntos" fill="#26c6da" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
