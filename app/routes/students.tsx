import { Separator } from "~/components/ui/separator";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import AppLayout from "~/layouts/AppLayout";
import { Button } from "~/components/ui/button";
import { EditIcon, TrashIcon } from "lucide-react";
import {
  getSidebar,
  requireAuth,
  requireTeacher,
  user,
} from "~/services/auth.server";
import { useEffect, useState } from "react";
import { getCourse, getStudents } from "~/services/loaders/teacher.server";
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
  await requireTeacher({ request });

  const u = await user({ request });
  const sidebar = await getSidebar({ request });
  const students = await getStudents({
    request,
    teacher_id: u.user.id,
  });

  const course = await getCourse({ request, teacher_id: u.user.id });

  console.log("Course:", students.data);

  return {
    user: {
      ...u.user,
      role: "Profesor",
    },
    sidebar: sidebar,
    students: students.data,
    course: course.data,
  };
}

export default function Index() {
  const fetcher = useFetcher<any>();
  const loaderData = useLoaderData<any>();

  // Estado para mostrar/ocultar el modal de añadir estudiante
  const [showAddModal, setShowAddModal] = useState(false);
  const [nuevoEstudiante, setNuevoEstudiante] = useState({
    first_name: "",
    last_name: "",
    document_number: "",
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [estudianteEdit, setEstudianteEdit] = useState({
    id: null, // Add an ID to uniquely identify the student being edited
    name: "",
    document_number: "", // This will hold the email for editing
  });
  // Nuevo estado para el modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<any>(null);

  function handleEditEstudiante(student: any) {
    console.log()
    setEstudianteEdit({
      id: student.id, // Assuming student.user.id is the unique identifier
      name: student.name,
      document_number: student.email, // Use email as document_number for consistency with display
    });
    setShowEditModal(true);
  }

  // Función para manejar la eliminación
  function handleDeleteEstudiante(student: any) {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  }

  function confirmDelete() {
    if (studentToDelete) {
      fetcher.submit(
        { id: studentToDelete.id },
        { method: "POST", action: `/api/teacher/delete_student/${studentToDelete.id}` }
      );
    }
    setShowDeleteModal(false);
    setStudentToDelete(null);
  }

  function handleAddInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setNuevoEstudiante((prev) => ({ ...prev, [name]: value }));
  }

  function handleAddCancel() {
    setShowAddModal(false);
    setNuevoEstudiante({
      first_name: "",
      last_name: "",
      document_number: "",
    });
  }

  function handleAddSave(e: React.FormEvent) {
    e.preventDefault();
    // Aquí iría la lógica para guardar el estudiante
    fetcher.submit(
      {
        first_name: nuevoEstudiante.first_name,
        last_name: nuevoEstudiante.last_name,
        document_number: nuevoEstudiante.document_number,
      },
      { method: "POST", action: "/api/teacher/create_student" }
    );
    setShowAddModal(false);
    setNuevoEstudiante({
      first_name: "",
      last_name: "",
      document_number: "",
    });
  }

  function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    // Aquí iría la lógica para guardar el estudiante editado
    fetcher.submit(
      {
        id: estudianteEdit.id, // Pass the student's ID for the update operation
        name: estudianteEdit.name,
        document_number: estudianteEdit.document_number, // This will be the updated email
      },
      { method: "POST", action: `/api/teacher/edit_student/${estudianteEdit.id}` }
    );
    setShowEditModal(false);
    setEstudianteEdit({
      id: null,
      name: "",
      document_number: "",
    });
  }

  const columns = [
    {
      label: "Nombre",
      renderCell: (item: any) => item.first_name,
    },
    {
      label: "Apellido",
      renderCell: (item: any) => item.last_name,
    },
    {
      label: "Cédula",
      renderCell: (item: any) => item.document_number,
    },
    {
      label: "Acciones",
      renderCell: (item: any) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="bg-blue-500 text-white w-max h-max p-2"
          >
            <EditIcon />
          </Button>
          <Button
            variant="outline"
            className="bg-red-500 text-white w-max h-max p-2"
          >
            <TrashIcon />
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.success === "success") {
        // Handle success case, e.g., show a toast notification
        window.location.reload(); // Reload the page to reflect changes
        toast({
          title: "Éxito",
          description: fetcher.data.toast.description,
        })
        console.log("Operación exitosa:", fetcher.data.toast);
      } else if (fetcher.data.success === "error") {
        // Handle error case, e.g., show an error notification
        toast({
          title: "Error",
          description: fetcher.data.toast.description,
          variant: "destructive",
        });
        console.error("Error:", fetcher.data.toast);
      }
      // Reset the fetcher state after handling the response
      // This line `fetcher.state = "idle";` is not how fetcher state is managed in Remix.
      // The state automatically resets to 'idle' after data is loaded or action completes.
      // Manual manipulation of `fetcher.state` is not recommended and might not work as expected.
      // Instead, rely on the `fetcher.state` and `fetcher.data` provided by Remix.
    }
  } , [fetcher.state, fetcher.data]);

  return (
    <AppLayout
      sidebarOptions={loaderData.sidebar}
      userData={loaderData.user}
    >
      <div className="w-full max-w-6xl mx-auto py-8">
        <div className="flex flex-col mb-4">
          <h1 className="text-4xl font-bold text-primary">Estudiantes</h1>
          <Separator className="my-4 bg-[#004d5a]" />
          <div className="w-full border border-[#197080] rounded-xl overflow-hidden bg-white">
            <div className="bg-[#d9f4f9] flex justify-between px-10 py-6 items-center">
              <div className="text-2xl font-bold flex items-center justify-center">
                Seccion: {loaderData.course?.section}
              </div>
              <button
                className="bg-[#008999] hover:bg-[#33b0bb] text-white font-bold px-6 py-2 rounded-lg"
                onClick={() => setShowAddModal(true)}
              >
                Añadir estudiantes
              </button>
            </div>
            <div className="overflow-x-auto px-8 pb-8 mt-4">
              <table className="min-w-full rounded-xl border border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th className="bg-[#d9f4f9] text-[#008999] font-bold text-lg py-3 px-4 text-left rounded-tl-xl">
                      Nombre y Apellido
                    </th>
                    <th className="bg-[#d9f4f9] text-[#008999] font-bold text-lg py-3 px-4 text-left">
                      Cédula
                    </th>
                    <th className="bg-[#d9f4f9] text-[#008999] font-bold text-lg py-3 px-4 text-left">
                      Tiempo de Conexión
                    </th>
                    <th className="bg-[#d9f4f9] text-[#008999] font-bold text-lg py-3 px-4 text-left rounded-tr-xl">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {!loaderData.students || loaderData.students?.length === 0 ? (
                    <tr className="border-b border-[#e0e0e0] last:border-b-0">
                      <td colSpan={3} align="center" valign="middle">
                        No hay estudiantes
                      </td>
                    </tr>
                  ) : (
                    loaderData.students.map((item: any) => (
                      <tr
                        key={item.email}
                        className="border-b border-[#e0e0e0] last:border-b-0"
                      >
                        <td className="py-4 px-4">{item.name}</td>
                        <td className="py-4 px-4">{item.email}</td>
                        <td className="py-4 px-4">
                          {item.connection_time ? item.connection_time : "N/A"}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="bg-[#3498fd] hover:bg-[#1565c0] text-white w-9 h-9 p-0 rounded flex items-center justify-center"
                              title="Editar"
                              onClick={() => handleEditEstudiante(item)} // Call handleEditEstudiante on click
                            >
                              <EditIcon className="w-5 h-5" />
                            </Button>
                            <Button
                              variant="outline"
                              className="bg-[#ef4444] hover:bg-[#b91c1c] text-white w-9 h-9 p-0 rounded flex items-center justify-center"
                              title="Eliminar"
                              onClick={() => handleDeleteEstudiante(item)} // Call handleDeleteEstudiante on click
                            >
                              <TrashIcon className="w-5 h-5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* Modal para añadir estudiante */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
              <h2 className="text-2xl font-bold mb-4 text-[#008999]">
                Añadir Estudiante
              </h2>
              <form onSubmit={handleAddSave} className="flex flex-col gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-[#008999] bg-white px-1 rounded">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    placeholder="Nombre"
                    value={nuevoEstudiante.first_name}
                    onChange={handleAddInputChange}
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
                    onChange={handleAddInputChange}
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
                    onChange={handleAddInputChange}
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
        {/* Modal para editar estudiante */}
        {showEditModal && estudianteEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
              <h2 className="text-2xl font-bold mb-4 text-[#008999]">
                Editar Estudiante
              </h2>
              <form onSubmit={handleEditSave} className="flex flex-col gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-[#008999] bg-white px-1 rounded">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nombre"
                    value={estudianteEdit.name}
                    onChange={(e) =>
                      setEstudianteEdit({ ...estudianteEdit, name: e.target.value })
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
                    value={estudianteEdit.document_number}
                    onChange={(e) =>
                      setEstudianteEdit({
                        ...estudianteEdit,
                        document_number: e.target.value,
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
                    onClick={() => setShowEditModal(false)}
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
        {/* Modal para confirmar eliminación */}
        {showDeleteModal && studentToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
              <h2 className="text-2xl font-bold mb-4 text-[#ef4444]">
                Confirmar Eliminación
              </h2>
              <p className="text-lg mb-6">
                ¿Está seguro de que desea eliminar al estudiante{" "}
                <span className="font-semibold">{studentToDelete.name}</span>? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-4 justify-end mt-2">
                <button
                  type="button"
                  className="border border-[#008999] text-[#008999] px-4 py-2 rounded-lg font-bold hover:bg-[#e0f7fa] transition"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="bg-[#ef4444] text-white font-bold px-4 py-2 rounded-lg hover:bg-[#b91c1c] transition"
                  onClick={confirmDelete}
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