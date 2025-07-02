import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import AppLayout from "~/layouts/AppLayout";
import { getSidebar, requireAdmin, requireAuth, user } from "~/services/auth.server";
import { EditIcon, TrashIcon, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { Separator } from "~/components/ui/separator";
import { getTeachers } from "~/services/loaders/admin.server";
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

  const teachers = await getTeachers({ request });

  return {
    user: {
      ...u.user,
      role: u.rol,
    },
    sidebar: sidebar,
    teachers: teachers.data,
  };
}

export default function Index() {
  const loaderData = useLoaderData<any>();
  const profesores = loaderData.teachers || [];

  // Estado para el modal de edición y el profesor seleccionado
  const [showEditModal, setShowEditModal] = useState(false);
  const [profesorEdit, setProfesorEdit] = useState<any>(null);

  // Estado para el modal de agregar profesor
  const [showAddModal, setShowAddModal] = useState(false);
  const [nuevoProfesor, setNuevoProfesor] = useState({
    nombre: "",
    apellido: "",
    name: "",
    correo: "",
    password: "",
  });

  // Estado para mostrar/ocultar la contraseña en el modal de agregar profesor
  const [showPassword, setShowPassword] = useState(false);

  // New state for password visibility in edit modal
  const [showEditPassword, setShowEditPassword] = useState(false);

  // New state for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<any>(null); // State to store the teacher object to be deleted

  const fetcher = useFetcher<any>();

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

  function handleEditProfesor(profesor: any) {
    setProfesorEdit({
      id: profesor.id,
      name: profesor.name,
      email: profesor.email,
      // Do not pre-fill password for security reasons
      password: "",
    });
    setShowEditModal(true);
  }

  function handleEditInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setProfesorEdit((prev: any) => ({ ...prev, [name]: value }));
  }

  function handleEditCancel() {
    setShowEditModal(false);
    setProfesorEdit(null);
    setShowEditPassword(false); // Reset password visibility
  }

  function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    fetcher.submit(
      {
        id: profesorEdit.id,
        name: profesorEdit.name,
        email: profesorEdit.email,
        password: profesorEdit.password, // Send password if it's been changed
      },
      {
        method: "put", // Use PUT for updates
        action: `/api/admin/edit_teacher/${profesorEdit.id}`, // Route for updating a teacher
      }
    );
    setShowEditModal(false);
    setProfesorEdit(null);
    setShowEditPassword(false); // Reset password visibility
  }

  function handleAddInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setNuevoProfesor((prev) => ({ ...prev, [name]: value }));
  }

  function handleAddCancel() {
    setShowAddModal(false);
    setNuevoProfesor({
      nombre: "",
      apellido: "",
      name: "",
      correo: "",
      password: "",
    });
  }

  function handleAddSave(e: React.FormEvent) {
    e.preventDefault();
    fetcher.submit(
        {
            name: nuevoProfesor.name, // Concatenate name and last name
            email: nuevoProfesor.correo,
            password: nuevoProfesor.password,
        },
        {
            method: "post",
            action: "/api/admin/create_teacher",
        }
    );
    setShowAddModal(false);
    setNuevoProfesor({
      nombre: "",
      apellido: "",
      name: "",
      correo: "",
      password: "",
    });
  }

  // Function to open the delete confirmation modal
  function handleDeleteTeacher(teacher: any) {
    setTeacherToDelete(teacher);
    setShowDeleteModal(true);
  }

  // Function to confirm and submit the delete request
  function confirmDeleteTeacher() {
    if (teacherToDelete) {
      fetcher.submit(
        { teacher_id: teacherToDelete.id }, // Send the teacher's ID
        { method: "delete", action: `/api/admin/delete_teacher/${teacherToDelete.id}` } // Use the new delete_teacher route
      );
    }
    setShowDeleteModal(false);
    setTeacherToDelete(null);
  }

  return (
    <AppLayout
      sidebarOptions={loaderData.sidebar}
      userData={loaderData.user}
    >
      <div className="w-full max-w-6xl mx-auto py-8">
        <div className="flex flex-col mb-4">
          <h1 className="text-4xl font-bold text-primary">Profesores</h1>
          <Separator className="my-4 bg-[#004d5a]" />
          <div className="flex justify-end mb-6">
            <button
              className="bg-[#008999] text-white font-bold px-5 py-2 rounded-lg hover:bg-[#33b0bb] transition flex items-center gap-2"
              onClick={() => setShowAddModal(true)}
            >
              + Agregar Profesor
            </button>
          </div>
        </div>
        {/* Modal para agregar profesor */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
              <h2 className="text-2xl font-bold mb-4 text-[#008999]">Añadir Profesor</h2>
              <form onSubmit={handleAddSave} className="flex flex-col gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-[#008999] bg-white px-1 rounded">Nombre y Apellido</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nombre y Apellido"
                    value={nuevoProfesor.name}
                    onChange={handleAddInputChange}
                    className="w-full border border-[#008999] rounded-lg px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#008999]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#008999]">Correo</label>
                  <input
                    type="email"
                    name="correo"
                    value={nuevoProfesor.correo}
                    onChange={handleAddInputChange}
                    placeholder="Correo"
                    className="w-full border border-[#008999] rounded-lg px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#008999]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#008999]">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={nuevoProfesor.password}
                      onChange={handleAddInputChange}
                      placeholder="Contraseña"
                      className="w-full border border-[#008999] rounded-lg px-3 py-2 pr-10 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#008999]"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#008999] hover:text-[#33b0bb] focus:outline-none"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
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
        <div className="bg-white rounded-xl shadow p-6 border border-[#008999] relative">
          <div>
            <table className="min-w-full mt-2 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-[#e0f7fa] text-[#008999]">
                  <th className="py-2 px-4 text-left font-semibold">Nombre</th>
                  <th className="py-2 px-4 text-left font-semibold">Correo</th>
                  <th className="py-2 px-4 text-left font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {profesores.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 py-6">
                      No hay profesores registrados.
                    </td>
                  </tr>
                ) : (
                  profesores.map((prof: any) => (
                    <tr key={prof.id} className="border-b last:border-b-0">
                      <td className="py-2 px-4">{prof.name}</td>
                      <td className="py-2 px-4">{prof.email}</td>
                      <td className="py-2 px-4">
                        <div className="flex gap-2">
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white rounded p-2 transition"
                            title="Modificar"
                            onClick={() => handleEditProfesor(prof)}
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button
                            className="bg-red-500 hover:bg-red-600 text-white rounded p-2 transition"
                            title="Eliminar"
                            onClick={() => handleDeleteTeacher(prof)}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Modal para editar profesor */}
        {showEditModal && profesorEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
              <h2 className="text-2xl font-bold mb-4 text-[#008999]">Modificar Profesor</h2>
              <form onSubmit={handleEditSave} className="flex flex-col gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-[#008999]">Nombre</label>
                  <input
                    type="text"
                    name="name"
                    value={profesorEdit.name}
                    onChange={handleEditInputChange}
                    className="w-full border border-[#008999] rounded-lg px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#008999]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#008999]">Correo</label>
                  <input
                    type="email"
                    name="email"
                    value={profesorEdit.email}
                    onChange={handleEditInputChange}
                    className="w-full border border-[#008999] rounded-lg px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#008999]"
                    required
                  />
                </div>
                {/* Optional: Password field for editing, similar to add modal */}
                <div>
                  <label className="block font-semibold mb-1 text-[#008999]">Nueva Contraseña (opcional)</label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? "text" : "password"}
                      name="password"
                      value={profesorEdit.password}
                      onChange={handleEditInputChange}
                      placeholder="Dejar en blanco para no cambiar"
                      className="w-full border border-[#008999] rounded-lg px-3 py-2 pr-10 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#008999]"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#008999] hover:text-[#33b0bb] focus:outline-none"
                      onClick={() => setShowEditPassword((v) => !v)}
                      tabIndex={-1}
                    >
                      {showEditPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-4 justify-end mt-2">
                  <button
                    type="button"
                    className="border border-[#008999] text-[#008999] px-4 py-2 rounded-lg font-bold hover:bg-[#e0f7fa] transition"
                    onClick={handleEditCancel}
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
        {/* Modal para confirmar eliminación de profesor */}
        {showDeleteModal && teacherToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
              <h2 className="text-2xl font-bold mb-4 text-[#ef4444]">
                Confirmar Eliminación de Profesor
              </h2>
              <p className="text-lg mb-6">
                ¿Está seguro de que desea eliminar al profesor{" "}
                <span className="font-semibold">{teacherToDelete.name}</span>? Esta acción no se puede deshacer.
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
                  onClick={confirmDeleteTeacher}
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