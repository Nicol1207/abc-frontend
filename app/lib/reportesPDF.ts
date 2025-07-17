// Funciones reutilizables para generación de PDFs de reportes
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function generarPDFConexionPorCurso({cursoId, token, cursosData}: {cursoId: string, token: string, cursosData?: any}) {
  // Si no se pasa cursosData, se hace fetch
  let cursos = cursosData;
  if (!cursosData) {
    const res = await fetch(`http://localhost:3000/api/reports/students/${cursoId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Error al obtener datos del reporte");
    const data = await res.json();
    cursos = cursoId === "all" ? data.data || [] : [data.data];
  }
  const doc = new jsPDF();
  const logoUrl = '/image.png';
  const logoBase64 = await getImageBase64(logoUrl);
  doc.addImage(logoBase64, 'PNG', 14, 10, 18, 18);
  const fecha = new Date();
  const fechaStr = fecha.toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFontSize(10);
  doc.text(`Fecha de emisión: ${fechaStr}`, 200, 14, { align: 'right' });
  doc.setFontSize(13);
  doc.text('U.E.M. "Maestra Carmen Haydee Valdivieso"', 36, 16);
  doc.setFontSize(10);
  doc.text('Porlamar, Municipio Mariño', 36, 22);
  doc.setFontSize(16);
  doc.text("Tiempo de conexión de estudiantes", 14, 36);
  let startY = 44;
  cursos.forEach((curso, idx) => {
    doc.setFontSize(12);
    doc.text(`Curso: ${curso.section} | Profesor: ${curso.teacher}`, 14, startY);
    doc.setFontSize(10);
    const estudiantes = curso.students || [];
    autoTable(doc, {
      head: [["#", "Nombre", "Cédula", "Tiempo de conexión (min)"]],
      body: estudiantes.length > 0
        ? estudiantes.map((est, i) => [i + 1, est.name, est.email, est.tiempo_conexion ?? "-"])
        : [[{ content: "No hay estudiantes en el curso", colSpan: 4, styles: { halign: 'center', fontStyle: 'italic' } }]],
      startY: startY + 10,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 137, 153] },
      didDrawPage: function (data) {
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(`Página ${doc.getCurrentPageInfo().pageNumber} de ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: 'center' }
        );
      }
    });
    startY = doc.lastAutoTable.finalY + 12;
  });
  doc.save(`conexion_estudiantes_${cursoId}.pdf`);
}

export async function generarPDFRecompensasPorCurso({cursoId, token, cursos, estudiantesData}: {cursoId: string, token: string, cursos?: any[], estudiantesData?: any[]}) {
  let estudiantes = estudiantesData;
  if (!estudiantesData) {
    const res = await fetch(`http://localhost:3000/api/reports/rewards/${cursoId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Error al obtener datos del reporte");
    const data = await res.json();
    estudiantes = data.data || [];
  }
  const curso = cursos?.find((c: any) => c.id == cursoId);
  const nombreCurso = curso ? `${curso.section} - ${curso.teacher?.name || "Sin profesor"}` : `ID ${cursoId}`;
  const doc = new jsPDF();
  const logoUrl = '/image.png';
  const logoBase64 = await getImageBase64(logoUrl);
  doc.addImage(logoBase64, 'PNG', 14, 10, 18, 18);
  const fecha = new Date();
  const fechaStr = fecha.toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFontSize(10);
  doc.text(`Fecha de emisión: ${fechaStr}`, 200, 14, { align: 'right' });
  doc.setFontSize(13);
  doc.text('U.E.M. "Maestra Carmen Haydee Valdivieso"', 36, 16);
  doc.setFontSize(10);
  doc.text('Porlamar, Municipio Mariño', 36, 22);
  doc.setFontSize(16);
  doc.text("Reporte de recompensas por curso", 14, 36);
  doc.setFontSize(12);
  doc.text(`Curso: ${nombreCurso}`, 14, 44);
  const tableData = estudiantes.map((est, idx) => [idx + 1, est.name, est.email, est.total_puntos]);
  autoTable(doc, {
    head: [["#", "Nombre", "Cédula", "Total puntos"]],
    body: tableData.length > 0
      ? tableData
      : [[{ content: "No hay estudiantes en el curso", colSpan: 4, styles: { halign: 'center', fontStyle: 'italic' } }]],
    startY: 50,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [0, 137, 153] },
    didDrawPage: function (data) {
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
}

export async function generarPDFListadoCursos({cursoId, token, cursosData}: {cursoId: string, token: string, cursosData?: any}) {
  let cursos = cursosData;
  if (!cursosData) {
    const res = await fetch(`http://localhost:3000/api/reports/courses/${cursoId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Error al obtener datos del reporte");
    const data = await res.json();
    cursos = cursoId === "all" ? data.data || [] : [data.data];
  }
  const doc = new jsPDF();
  const logoUrl = '/image.png';
  const logoBase64 = await getImageBase64(logoUrl);
  doc.addImage(logoBase64, 'PNG', 14, 10, 18, 18);
  const fecha = new Date();
  const fechaStr = fecha.toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFontSize(10);
  doc.text(`Fecha de emisión: ${fechaStr}`, 200, 14, { align: 'right' });
  doc.setFontSize(13);
  doc.text('U.E.M. "Maestra Carmen Haydee Valdivieso"', 36, 16);
  doc.setFontSize(10);
  doc.text('Porlamar, Municipio Mariño', 36, 22);
  doc.setFontSize(16);
  doc.text("Listado de cursos", 14, 36);
  let startY = 44;
  cursos.forEach((curso, idx) => {
    doc.setFontSize(12);
    doc.text(`Curso: ${curso.section} | Profesor: ${curso.teacher}`, 14, startY);
    doc.setFontSize(10);
    const estudiantes = curso.students || [];
    autoTable(doc, {
      head: [["#", "Nombre", "Email/ID", "Tiempo de conexión"]],
      body: estudiantes.length > 0
        ? estudiantes.map((est, i) => [i + 1, est.name, est.email, est.time])
        : [[{ content: "No hay estudiantes en el curso", colSpan: 4, styles: { halign: 'center', fontStyle: 'italic' } }]],
      startY: startY + 10,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 137, 153] },
      didDrawPage: function (data) {
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(`Página ${doc.getCurrentPageInfo().pageNumber} de ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: 'center' }
        );
      }
    });
    startY = doc.lastAutoTable.finalY + 12;
  });
  doc.save(`listado_cursos_${cursoId}.pdf`);
}

// Utilidad para cargar imagen base64
export function getImageBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
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
}
