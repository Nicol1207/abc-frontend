import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import AppLayout from "~/layouts/AppLayout";
import { currentToken, getSidebar, requireAdmin, requireAuth, requireTeacher, user } from "~/services/auth.server";
import { EditIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Separator } from "~/components/ui/separator";
import { getCourses, getTeachers } from "~/services/loaders/admin.server";
import { Combobox } from "~/components/Combobox";
import { useFetcher } from "@remix-run/react";
import { toast } from "~/hooks/use-toast";

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
  const courses = await getCourses({ request });
  const teachers = await getTeachers({ request });
  const token = await currentToken({ request });

  console.log(courses)

  return {
    user: {
      ...u.user,
      role: u.rol,
    },
    sidebar: sidebar,
    courses: courses,
    teachers: teachers.data,
    token: token,
  };
}

export default function Index() {
  const fetcher = useFetcher<any>();
  const loaderData = useLoaderData<any>();

  // Usar los cursos reales del loader
  const cursos = loaderData.courses.data || [];

  // Ajustar profesoresCombo para usar loaderData.teachers
  const profesoresCombo =
    (loaderData.teachers || []).map((p: any) => ({
      value: String(p.id),
      label: p.name,
      correo: p.correo || p.email, // usa correo o email según tu backend
    }));

  // Estado para mostrar/ocultar el modal de añadir curso
  const [showAddModal, setShowAddModal] = useState(false);
  const [nuevoCurso, setNuevoCurso] = useState({
    profesorId: "",
    correoProfesor: "",
    seccion: "",
  });

  // New state for student edit/delete modals
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState({
    id: null,
    name: "",
    email: "", // Use email as document_number for consistency with students.tsx
  });
  const [showDeleteStudentModal, setShowDeleteStudentModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<any>(null);

  // Estado y lógica para añadir estudiante por curso
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [currentCourseId, setCurrentCourseId] = useState<string | null>(null);
  const [nuevoEstudiante, setNuevoEstudiante] = useState({
    first_name: "",
    last_name: "",
    document_number: "",
  });

  function handleAddInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setNuevoCurso((prev) => ({ ...prev, [name]: value }));
  }

  function handleProfesorChange(value: string) {
    const prof = profesoresCombo.find((p: any) => p.value === value);
    setNuevoCurso((prev) => ({
      ...prev,
      profesorId: value,
      correoProfesor: prof && prof.correo ? prof.correo : "",
    }));
  }

  function handleAddCancel() {
    setShowAddModal(false);
    setNuevoCurso({
      profesorId: "",
      correoProfesor: "",
      seccion: "",
    });
  }

  function handleAddSave(e: React.FormEvent) {
    e.preventDefault();
    // Aquí iría la lógica para guardar el curso
    fetcher.submit(
      {
        teacher_id: nuevoCurso.profesorId,
        section: nuevoCurso.seccion,
      },
      {
        method: "post",
        action: "/api/admin/create_course",
      }
    )
    setShowAddModal(false);
    setNuevoCurso({
      profesorId: "",
      correoProfesor: "",
      seccion: "",
    });
  }

  function handleDeleteCourse(courseId: string) {
    // Aquí iría la lógica para eliminar el curso
    fetcher.submit(
      { course_id: courseId },
      {
        method: "delete",
        action: `/api/admin/delete_course/${courseId}`,
      }
    );
  }

  // Functions for student actions (copied/adapted from students.tsx)
  function handleEditStudent(student: any) {
    setStudentToEdit({
      id: student.id,
      name: student.name,
      email: student.email,
    });
    setShowEditStudentModal(true);
  }

  function handleDeleteStudent(student: any) {
    setStudentToDelete(student);
    setShowDeleteStudentModal(true);
  }

  function confirmDeleteStudent() {
    if (studentToDelete) {
      fetcher.submit(
        { id: studentToDelete.id },
        { method: "POST", action: `/api/teacher/delete_student/${studentToDelete.id}` }
      );
    }
    setShowDeleteStudentModal(false);
    setStudentToDelete(null);
  }

  function handleEditStudentSave(e: React.FormEvent) {
    e.preventDefault();
    fetcher.submit(
      {
        id: studentToEdit.id,
        name: studentToEdit.name,
        document_number: studentToEdit.email, // document_number is used in the backend for email
      },
      { method: "POST", action: `/api/teacher/edit_student/${studentToEdit.id}` }
    );
    setShowEditStudentModal(false);
    setStudentToEdit({
      id: null,
      name: "",
      email: "",
    });
  }

  function handleAddStudentInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setNuevoEstudiante((prev) => ({ ...prev, [name]: value }));
  }

  function handleAddStudentCancel() {
    setShowAddStudentModal(false);
    setCurrentCourseId(null);
    setNuevoEstudiante({
      first_name: "",
      last_name: "",
      document_number: "",
    });
  }

  function handleAddStudentClick(courseId: string) {
    setCurrentCourseId(courseId);
    setShowAddStudentModal(true);
  }

  function handleAddStudentSave(e: React.FormEvent) {
    e.preventDefault();
    if (!currentCourseId) return;
    fetch(`http://localhost:3000/api/teacher/${currentCourseId}/add-student`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loaderData.token}`,
      },
      body: JSON.stringify({
        first_name: nuevoEstudiante.first_name,
        last_name: nuevoEstudiante.last_name,
        document_number: nuevoEstudiante.document_number,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
          toast({
            title: data.toast?.title || "Estudiante añadido",
            description: data.toast?.description || "El estudiante fue añadido correctamente.",
          });
          window.location.reload();
      })
      .catch((e: any) => {
        console.log("Error al añadir estudiante:", e);  
        toast({
          title: "Error",
          description: "No se pudo conectar con el backend.",
          variant: "destructive",
        });
      });
    setShowAddStudentModal(false);
    setCurrentCourseId(null);
    setNuevoEstudiante({
      first_name: "",
      last_name: "",
      document_number: "",
    });
  }

  // Manejo de respuestas del fetcher
    useEffect(() => {
      if (fetcher.data) {
        if (fetcher.data.success === "success") {
          toast({
              title: fetcher.data.toast.title,
              description: fetcher.data.toast.description,
          })
          window.location.reload(); // Recargar la página para reflejar los cambios
        } else if (fetcher.data.success === "error") {
          toast({
              title: fetcher.data.toast.title,
              description: fetcher.data.toast.description,
              variant: "destructive",
          })
        }
      }
    }, [fetcher.state, fetcher.data]);

  return (
    <AppLayout
      sidebarOptions={loaderData.sidebar}
      userData={loaderData.user}
    >
      <div className="w-full max-w-6xl mx-auto py-8">
        <div className="flex flex-col mb-4">
          <h1 className="text-4xl font-bold text-primary">Cursos</h1>
          <Separator className="my-4 bg-[#004d5a]" />
          {/* Botón para agregar curso */}
          <div className="flex justify-end mb-6">
            <button
              className="bg-[#008999] text-white font-bold px-5 py-2 rounded-lg hover:bg-[#33b0bb] transition flex items-center gap-2"
              onClick={() => setShowAddModal(true)}
            >
              + Agregar Curso
            </button>
          </div>
        </div>
        {/* Modal para añadir curso */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
              <h2 className="text-2xl font-bold mb-4 text-[#008999]">Añadir Curso</h2>
              <form onSubmit={handleAddSave} className="flex flex-col gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-[#008999]">Profesor</label>
                  <Combobox
                    value={nuevoCurso.profesorId}
                    setValue={handleProfesorChange}
                    options={profesoresCombo}
                    placeholder="Selecciona un profesor"
                    label="Selecciona un profesor"
                    empty="No hay profesores"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#008999]">Correo del profesor</label>
                  <input
                    type="email"
                    name="correoProfesor"
                    value={nuevoCurso.correoProfesor}
                    // El campo se llena automáticamente, así que no se debe editar manualmente
                    onChange={() => {}}
                    placeholder="Correo del profesor"
                    className="w-full border border-[#008999] rounded-lg px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#008999]"
                    required
                    disabled
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#008999]">Sección</label>
                  <input
                    type="text"
                    name="seccion"
                    value={nuevoCurso.seccion}
                    onChange={handleAddInputChange}
                    placeholder="Sección"
                    className="w-full border border-[#008999] rounded-lg px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#008999]"
                    required
                  />
                </div>
                <div className="flex gap-4 justify-end mt-2">
                  <button
                    type="button"
                    className="border border-[#008999] text-[#008999] px-4 py-2 rounded-lg font-bold hover:bg-[#e0f7fa] transition"
                    onClick={handleAddCancel}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-[#008999] text-white font-bold px-4 py-2 rounded-lg hover:bg-[#33b0bb] transition"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {cursos.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 border border-[#008999] text-center text-gray-500 text-lg font-semibold">
            No existe ningún curso.
          </div>
        ) : (
          cursos.map((curso: any) => (
            <div key={curso.id} className="bg-white rounded-xl shadow p-6 border border-[#008999] relative mb-8">
              {/* Botones para eliminar curso y añadir estudiante */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  className="bg-[#008999] hover:bg-[#33b0bb] text-white font-bold px-4 py-1 rounded-lg"
                  onClick={() => handleAddStudentClick(curso.id)}
                >
                  Añadir estudiantes
                </button>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-1 font-bold transition"
                  title="Eliminar curso"
                  onClick={() => handleDeleteCourse(curso.id)}
                >
                  Eliminar curso
                </button>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <div className="text-xl font-bold text-[#008999]">{curso.teacher.name}</div>
                  <div className="text-gray-600">{curso.teacher.email}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Sección: <span className="font-semibold">{curso.section}</span>
                  </div>
                </div>
              </div>
              <div>
                <table className="min-w-full mt-2 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-[#e0f7fa] text-[#008999]">
                      <th className="py-2 px-4 text-left font-semibold">Nombre y Apellido</th>
                      <th className="py-2 px-4 text-left font-semibold">Cédula</th>
                      <th className="py-2 px-4 text-left font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(curso.students && curso.students.length > 0) ? (
                      curso.students.map((est: any) => (
                        <tr key={est.id} className="border-b last:border-b-0">
                          <td className="py-2 px-4">{est.name}</td>
                          <td className="py-2 px-4">{est.email}</td>
                          <td className="py-2 px-4">
                            <div className="flex gap-2">
                              <button
                                className="bg-blue-500 hover:bg-blue-600 text-white rounded p-2 transition"
                                title="Modificar"
                                onClick={() => handleEditStudent(est)}
                              >
                                <EditIcon className="w-4 h-4" />
                              </button>
                              <button
                                className="bg-red-500 hover:bg-red-600 text-white rounded p-2 transition"
                                title="Eliminar"
                                onClick={() => handleDeleteStudent(est)}
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center text-gray-400 py-6">
                          No hay estudiantes en este curso.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
        {/* Modal para añadir estudiante */}
        {showAddStudentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
              <h2 className="text-2xl font-bold mb-4 text-[#008999]">
                Añadir Estudiante
              </h2>
              <form onSubmit={handleAddStudentSave} className="flex flex-col gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-[#008999] bg-white px-1 rounded">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    placeholder="Nombre"
                    value={nuevoEstudiante.first_name}
                    onChange={handleAddStudentInputChange}
                    className="w-full border border-[#008999] rounded-lg px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#008999]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#008999] bg-white px-1 rounded">
                    Apellido
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    placeholder="Apellido"
                    value={nuevoEstudiante.last_name}
                    onChange={handleAddStudentInputChange}
                    className="w-full border border-[#008999] rounded-lg px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#008999]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#008999] bg-white px-1 rounded">
                    Cédula
                  </label>
                  <input
                    type="text"
                    name="document_number"
                    placeholder="Cédula"
                    value={nuevoEstudiante.document_number}
                    onChange={handleAddStudentInputChange}
                    className="w-full border border-[#008999] rounded-lg px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#008999]"
                    required
                  />
                </div>
                <div className="flex gap-4 justify-end mt-2">
                  <button
                    type="button"
                    className="border border-[#008999] text-[#008999] px-4 py-2 rounded-lg font-bold hover:bg-[#e0f7fa] transition"
                    onClick={handleAddStudentCancel}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-[#008999] text-white font-bold px-4 py-2 rounded-lg hover:bg-[#33b0bb] transition"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Modal para editar estudiante */}
        {showEditStudentModal && studentToEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
              <h2 className="text-2xl font-bold mb-4 text-[#008999]">
                Editar Estudiante
              </h2>
              <form onSubmit={handleEditStudentSave} className="flex flex-col gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-[#008999] bg-white px-1 rounded">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nombre"
                    value={studentToEdit.name}
                    onChange={(e) =>
                      setStudentToEdit({ ...studentToEdit, name: e.target.value })
                    }
                    className="w-full border border-[#008999] rounded-lg px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#008999]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#008999] bg-white px-1 rounded">
                    Cédula
                  </label>
                  <input
                    type="text"
                    name="document_number" // Keep name as document_number for consistency, but it holds email
                    placeholder="Cédula"
                    value={studentToEdit.email}
                    onChange={(e) =>
                      setStudentToEdit({
                        ...studentToEdit,
                        email: e.target.value,
                      })
                    }
                    className="w-full border border-[#008999] rounded-lg px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#008999]"
                    required
                  />
                </div>
                <div className="flex gap-4 justify-end mt-2">
                  <button
                    type="button"
                    className="border border-[#008999] text-[#008999] px-4 py-2 rounded-lg font-bold hover:bg-[#e0f7fa] transition"
                    onClick={() => setShowEditStudentModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-[#008999] text-white font-bold px-4 py-2 rounded-lg hover:bg-[#33b0bb] transition"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Modal para confirmar eliminación de estudiante */}
        {showDeleteStudentModal && studentToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
              <h2 className="text-2xl font-bold mb-4 text-[#ef4444]">
                Confirmar Eliminación de Estudiante
              </h2>
              <p className="text-lg mb-6">
                ¿Está seguro de que desea eliminar al estudiante{" "}
                <span className="font-semibold">{studentToDelete.name}</span>? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-4 justify-end mt-2">
                <button
                  type="button"
                  className="border border-[#008999] text-[#008999] px-4 py-2 rounded-lg font-bold hover:bg-[#e0f7fa] transition"
                  onClick={() => setShowDeleteStudentModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="bg-[#ef4444] text-white font-bold px-4 py-2 rounded-lg hover:bg-[#b91c1c] transition"
                  onClick={confirmDeleteStudent}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}