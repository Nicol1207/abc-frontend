import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog";
import AppLayout from "~/layouts/AppLayout";
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

  // Obtener cursos activos para el select
  const apiUrl = "http://localhost:3000/api/courses";
  const token = await currentToken({request});
  let cursos = [];
  try {
    const res = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      cursos = data.data || [];
    }
  } catch (e) {
    // Si hay error, cursos vacío
    console.log("Error al obtener cursos:", e);
  }

  console.log("Cursos obtenidos:", cursos);

  return {
    user: {
      ...u.user,
      role: u.role,
    },
    sidebar: sidebar,
    cursos,
    token,
  };
}

export default function Index() {
  const loaderData = useLoaderData<any>();
  const [openRecompensas, setOpenRecompensas] = useState(false);
  const [openCursos, setOpenCursos] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<string>("");
  const [cursoListado, setCursoListado] = useState<string>("all");
  const [generando, setGenerando] = useState(false);

  // Genera el PDF de recompensas por curso usando jsPDF y jsPDF-autotable
  async function generarPDFRecompensasPorCurso(cursoId: string) {
    setGenerando(true);
    try {
      // Petición a la API para obtener los datos
      const res = await fetch(`http://localhost:3000/api/reports/rewards/${cursoId}`, {
        headers: {
          Authorization: `Bearer ${loaderData.token}`,
        }
      });
      if (!res.ok) throw new Error("Error al obtener datos del reporte");
      const data = await res.json();
      const estudiantes = data.data || [];

      // Obtiene el nombre del curso para el título
      const curso = loaderData.cursos.find((c: any) => c.id == cursoId);
      const nombreCurso = curso ? `${curso.section} - ${curso.teacher?.name || "Sin profesor"}` : `ID ${cursoId}`;


      // Crea el PDF
      const doc = new jsPDF();

      // Logo (ajusta la ruta si es necesario)
      const logoUrl = '/image.png'; // Debe estar en public/
      // Cargar imagen como base64
      const getImageBase64 = (url: string) => {
        return new Promise<string>((resolve, reject) => {
          const img = new window.Image();
          img.crossOrigin = 'Anonymous';
          img.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject('No context');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          };
          img.onerror = reject;
          img.src = url;
        });
      };

      // Espera la imagen y luego genera el PDF
      const logoBase64 = await getImageBase64(logoUrl);
      // Logo a la izquierda
      doc.addImage(logoBase64, 'PNG', 14, 10, 18, 18);

      // Fecha de emisión (derecha)
      const fecha = new Date();
      const fechaStr = fecha.toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.setFontSize(10);
      doc.text(`Fecha de emisión: ${fechaStr}`, 200, 14, { align: 'right' });

      // Nombre de la institución y dirección
      doc.setFontSize(13);
      doc.text('U.E.M. "Maestra Carmen Haydee Valdivieso"', 36, 16);
      doc.setFontSize(10);
      doc.text('Porlamar, Municipio Mariño', 36, 22);

      // Título del reporte
      doc.setFontSize(16);
      doc.text("Reporte de recompensas por curso", 14, 36);
      doc.setFontSize(12);
      doc.text(`Curso: ${nombreCurso}`, 14, 44);

      // Prepara los datos para la tabla
      const tableData = estudiantes.map((est: any, idx: number) => [
        idx + 1,
        est.name,
        est.email,
        est.total_puntos
      ]);

      autoTable(doc, {
        head: [["#", "Nombre", "Email/ID", "Total puntos"]],
        body: tableData,
        startY: 50,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [0, 137, 153] },
        didDrawPage: function (data) {
          // Número de página al pie
          const pageCount = doc.getNumberOfPages();
          doc.setFontSize(10);
          doc.text(`Página ${doc.getCurrentPageInfo().pageNumber} de ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 8,
            { align: 'center' }
          );
        }
      });

      doc.save(`recompensas_curso_${cursoId}.pdf`);
    } catch (err: any) {
      alert("Error generando el PDF: " + (err?.message || err));
    } finally {
      setGenerando(false);
    }
  }

  async function generarPDFListadoCursos(cursoId: string) {
    setGenerando(true);
    setTimeout(() => {
      setGenerando(false);
      if (cursoId === "all") {
        alert("PDF de listado de todos los cursos generado");
      } else {
        const curso = loaderData.cursos.find((c: any) => c.id == cursoId);
        alert(`PDF generado para el curso: ${curso?.section || cursoId}`);
      }
    }, 1200);
  }

  return (
    <AppLayout
      sidebarOptions={loaderData.sidebar}
      userData={loaderData.user}
    >
      <div className="w-full py-8">
        <h1 className="text-4xl font-bold text-primary">Reportes</h1>
        <Separator className="my-4 bg-[#004d5a]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card: Reporte de recompensas por curso */}
          <Card>
            <CardHeader>
              <CardTitle>Recompensas de estudiantes por curso</CardTitle>
              <CardDescription>Genera un reporte PDF con el total de recompensas obtenidas por los estudiantes de un curso específico.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setOpenRecompensas(true)} className="w-full bg-[#008999] hover:bg-[#33b0bb] text-white">Generar reporte</Button>
            </CardContent>
          </Card>
          {/* Card: Listado de cursos */}
          <Card>
            <CardHeader>
              <CardTitle>Listado de cursos</CardTitle>
              <CardDescription>Descarga un PDF con el listado de todos los cursos activos y sus profesores, o de un curso específico.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setOpenCursos(true)} className="w-full bg-[#008999] hover:bg-[#33b0bb] text-white">Generar reporte</Button>
            </CardContent>
          </Card>
        </div>

        {/* Modal para recompensas por curso */}
        <Dialog open={openRecompensas} onOpenChange={setOpenRecompensas}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Selecciona el curso</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={e => {
                e.preventDefault();
                if (cursoSeleccionado) {
                  generarPDFRecompensasPorCurso(cursoSeleccionado);
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
                {loaderData.cursos.map((curso: any) => (
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

        {/* Modal para listado de cursos */}
        <Dialog open={openCursos} onOpenChange={setOpenCursos}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generar PDF de cursos</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={e => {
                e.preventDefault();
                generarPDFListadoCursos(cursoListado);
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
                {loaderData.cursos.map((curso: any) => (
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
