import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import AppLayout from "~/layouts/AppLayout";
import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

import { currentToken, getSidebar, requireAdmin, requireAuth, user } from "~/services/auth.server";
import { Separator } from "~/components/ui/separator";
import { ChartAreaIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog";
import { generarPDFRecompensasPorCurso, generarPDFListadoCursos } from "~/lib/reportesPDF";

export const meta: MetaFunction = () => {
  return [
    { title: "ABC Media" },
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
  let cursos = [];
  let token;
  try {
    token = await currentToken({request});
    // Dashboard principal
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
      console.error(`Error al cargar dashboard (${res.status}):`, errorText);
      throw new Error(`Error al cargar dashboard (${res.status}): ${errorText}`);
    }
    dashboardData = await res.json();
    // Obtener cursos activos para el select de reportes
    const cursosRes = await fetch("http://localhost:3000/api/courses", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (cursosRes.ok) {
      const data = await cursosRes.json();
      cursos = data.data || [];
    }
  } catch (err: any) {
    console.error("Error en fetch dashboard/cursos:", err);
    throw new Error(`Error en fetch dashboard/cursos: ${err?.message || err}`);
  }

  return json({
    user: {
      ...u.user,
      role: u.role,
    },
    sidebar: sidebar,
    dashboard: dashboardData,
    cursos,
    token,
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

  const [openRecompensas, setOpenRecompensas] = React.useState(false);
  const [openCursos, setOpenCursos] = React.useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = React.useState("");
  const [cursoListado, setCursoListado] = React.useState("all");
  const [generando, setGenerando] = React.useState(false);

  return (
    <AppLayout
      sidebarOptions={loaderData.sidebar}
      userData={loaderData.user}
    >
      <div className="w-full max-w-7xl mx-auto py-4 overflow-hidden">
        <div className="flex flex-col mb-2">
          <h1 className="text-4xl font-bold text-primary flex flex-row items-center gap-5"> <ChartAreaIcon size={32} /> Dashboard</h1>
          <Separator className="my-2 bg-[#004d5a]" />
        </div>
        {/* Cards resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <span className="text-2xl font-bold text-primary">{cantidadProfesores}</span>
            <span className="text-gray-600 mt-2 text-sm">Profesores</span>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <span className="text-2xl font-bold text-primary">{cantidadCursos}</span>
            <span className="text-gray-600 mt-2 text-sm">Cursos activos</span>
          </div>
          <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <span className="text-2xl font-bold text-primary">{cantidadEstudiantes}</span>
            <span className="text-gray-600 mt-2 text-sm">Estudiantes totales</span>
          </div>
        </div>
        {/* Gráficos en una sola fila */}
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          {/* Gráfico de barras: Estudiantes con más accesos */}
          <div className="bg-white rounded-lg shadow p-4 flex-1 min-w-[280px]">
            <h2 className="text-lg font-semibold mb-2 text-primary">Estudiantes con más accesos al software</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={estudiantesAccesos} layout="vertical" margin={{ left: 20, right: 20 }}>
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="nombre" type="category" width={80} fontSize={12} />
                <RechartsTooltip />
                <Bar dataKey="accesos" fill="#0097a7" barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Gráfico de pastel: Material más utilizado */}
          <div className="bg-white rounded-lg shadow p-4 flex-1 min-w-[280px] flex flex-col items-center">
            <h2 className="text-lg font-semibold mb-2 text-primary text-center">Material más utilizado por los estudiantes</h2>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={materialesUtilizados}
                  dataKey="usos"
                  nameKey="nombre"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  label={false}
                >
                  {materialesUtilizados.map((entry: { nombre: string; usos: number }, index: number) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Legend fontSize={12} />
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Gráfico de barras: Estudiantes con más puntos (horizontal, altura ajustada) */}
          <div className="bg-white rounded-lg shadow p-4 flex-1 min-w-[280px]">
            <h2 className="text-lg font-semibold mb-2 text-primary">Estudiantes con más Recompensas</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={estudiantesPuntos} layout="vertical" margin={{ left: 40, right: 20 }}>
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="nombre" type="category" width={120} fontSize={12} />
                <RechartsTooltip />
                <Bar dataKey="puntos" fill="#26c6da" barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Cards de reportes PDF */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Card: Reporte de recompensas por curso */}
          <div className="bg-white rounded-lg shadow flex flex-col h-full p-4">
            <div className="mb-2">
              <span className="font-bold text-lg">Recompensas de estudiantes por curso</span>
              <p className="text-sm text-gray-600">Genera un reporte PDF con el total de recompensas obtenidas por los estudiantes de un curso específico.</p>
            </div>
            <div className="flex-1" />
            <div className="mt-auto">
              <button
                className="w-full bg-[#008999] hover:bg-[#33b0bb] text-white py-2 rounded"
                onClick={() => setOpenRecompensas(true)}
              >Generar reporte</button>
            </div>
          </div>
          {/* Card: Listado de cursos */}
          <div className="bg-white rounded-lg shadow flex flex-col h-full p-4">
            <div className="mb-2">
              <span className="font-bold text-lg">Listado de cursos</span>
              <p className="text-sm text-gray-600">Descarga un PDF con el listado de todos los cursos activos y sus profesores, o de un curso específico.</p>
            </div>
            <div className="flex-1" />
            <div className="mt-auto">
              <button
                className="w-full bg-[#008999] hover:bg-[#33b0bb] text-white py-2 rounded"
                onClick={() => setOpenCursos(true)}
              >Generar reporte</button>
            </div>
          </div>
        </div>
        {/* Modales para selección de curso y generación de PDF */}
        <Dialog open={openRecompensas} onOpenChange={setOpenRecompensas}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Selecciona el curso</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={e => {
                e.preventDefault();
                if (cursoSeleccionado) {
                  generarPDFRecompensasPorCurso({ cursoId: cursoSeleccionado, token: loaderData.token, cursos: loaderData.cursos });
                  setOpenRecompensas(false);
                }
              }}
              className="flex flex-col gap-4"
            >
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-black"
                value={cursoSeleccionado}
                onChange={e => setCursoSeleccionado(e.target.value)}
                required
              >
                <option value="">-- Selecciona un curso --</option>
                {loaderData.cursos?.map((curso: any) => (
                  <option key={curso.id} value={curso.id}>
                    {curso.section} - {curso.teacher?.name || "Sin profesor"}
                  </option>
                ))}
              </select>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenRecompensas(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={!cursoSeleccionado || generando} className="bg-[#008999] hover:bg-[#33b0bb] text-white">
                  {generando ? "Generando..." : "Generar PDF"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={openCursos} onOpenChange={setOpenCursos}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generar PDF de cursos</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={e => {
                e.preventDefault();
                generarPDFListadoCursos({ cursoId: cursoListado, token: loaderData.token, cursosData: loaderData.cursos });
                setOpenCursos(false);
              }}
              className="flex flex-col gap-4"
            >
              <label className="font-semibold">Selecciona un curso o todos:</label>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-black"
                value={cursoListado}
                onChange={e => setCursoListado(e.target.value)}
              >
                <option value="all">Todos los cursos</option>
                {loaderData.cursos?.map((curso: any) => (
                  <option key={curso.id} value={curso.id}>
                    {curso.section} - {curso.teacher?.name || "Sin profesor"}
                  </option>
                ))}
              </select>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenCursos(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={generando} className="bg-[#008999] hover:bg-[#33b0bb] text-white">
                  {generando ? "Generando..." : "Generar PDF"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
