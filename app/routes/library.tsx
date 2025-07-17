import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import AppLayout from "~/layouts/AppLayout";
import { getSidebar, requireAuth, requireTeacher, user } from "~/services/auth.server";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Plus, Eye, Library } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { getLibrary } from "~/services/loaders/teacher.server";
import { useFetcher } from "@remix-run/react";
import { toast } from "~/hooks/use-toast";

export const meta: MetaFunction = () => {
  return [
    { title: "ABC Media" },
    { name: "description", content: "Sistema educativo de inglés" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth({ request });
  await requireTeacher({ request });

  const u = await user({ request });
  const sidebar = await getSidebar({ request });
  const library = await getLibrary({ request });

  console.log("Library data:", library);

  return {
    user: {
      ...u.user,
      role: u.rol,
    },
    sidebar: sidebar,
    library: library.data,
  };
}

export default function Index() {
  const loaderData = useLoaderData<any>();
  const fetcher = useFetcher<any>();

  // Datos reales de la biblioteca desde el backend
  const temas = loaderData.library?.themes || [];
  const images = loaderData.library?.images || [];
  const videos = loaderData.library?.videos || [];
  const textos = loaderData.library?.textos || [];

  const tipos = [
    { label: "Temas", value: "temas" },
    { label: "Videos", value: "video" },
    { label: "Imágenes", value: "imagen" },
    { label: "Textos", value: "texto" },
  ];

  // Unifica recursos para filtrado y visualización
  const recursos = [
    ...videos.map((v: any) => ({
      id: v.id,
      titulo: v.titulo || v.title || "Video",
      tema: temas.find((t: any) => t.id === v.tema_id)?.titulo || "Sin tema",
      tipo: "video",
      descripcion: v.descripcion || "",
      url: v.url || v.link || "#",
    })),
    ...images.map((img: any) => ({
      id: img.id,
      titulo: img.titulo || img.title || "Imagen",
      tema: temas.find((t: any) => t.id === img.tema_id)?.titulo || "Sin tema",
      tipo: "imagen",
      descripcion: img.descripcion || "",
      url: img.url || img.link || "#",
    })),
    ...textos.map((txt: any) => ({
      id: txt.id,
      titulo: txt.titulo || txt.title || "Texto",
      tema: temas.find((t: any) => t.id === txt.tema_id)?.titulo || "Sin tema",
      tipo: "texto",
      descripcion: txt.descripcion || "",
      url: txt.url || txt.link || "#",
    })),
  ];

  const [filtroTipo, setFiltroTipo] = useState("temas");
  const [filtroTema, setFiltroTema] = useState("todos");

  // Estado para mostrar/ocultar el modal de carga de material
  const [showModal, setShowModal] = useState(false);

  // Estado para los campos del formulario
  const [nuevoMaterial, setNuevoMaterial] = useState({
    titulo: "",
    numero: "",
    color: "#008999",
    descripcion: "",
  });

  const recursosFiltrados = recursos.filter((r) => {
    const tipoOk = filtroTipo === "todos" || r.tipo === filtroTipo;
    const temaOk = filtroTema === "todos" || r.tema === filtroTema;
    return tipoOk && temaOk;
  });

  // Manejar cambios en los campos del formulario
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setNuevoMaterial((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNuevoMaterial((prev) => ({
      ...prev,
      archivo: e.target.files && e.target.files.length > 0 ? e.target.files[0] : null,
    }));
  }

  function handleCancelar() {
    setShowModal(false);
    setNuevoMaterial({
      titulo: "",
      numero: "",
      color: "#008999",
      descripcion: "",
    });
  }

  function handleSubir(e: React.FormEvent) {
    e.preventDefault();
    // Aquí iría la lógica para subir el material
    fetcher.submit(
      {
        titulo: nuevoMaterial.titulo,
        numero: nuevoMaterial.numero.toString(),
        color: nuevoMaterial.color,
        descripcion: nuevoMaterial.descripcion,
      },
      { method: "post", action: "/api/teacher/create_theme" }
    );
    setShowModal(false);
    // ...resetear formulario si es necesario
  }

  function hexToRgb(hex: string) {
    // Elimina el # si existe
    hex = hex.replace(/^#/, "");
    // Convierte valores cortos (#abc) a largos (#aabbcc)
    if (hex.length === 3) {
      hex = hex.split("").map((x) => x + x).join("");
    }
    const num = parseInt(hex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgb(${r}, ${g}, ${b})`;
  }

  function hexToRgbLabel(hex: string) {
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) {
      hex = hex.split("").map((x) => x + x).join("");
    }
    const num = parseInt(hex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `R: ${r}, G: ${g}, B: ${b}`;
  }

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.success === "success") {
        // Mostrar notificación de éxito
        toast({
          title: "Éxito",
          description: fetcher.data.toast.description || "Tema creado correctamente.",
        })
      } else if (fetcher.data.success === "error") {
        // Mostrar notificación de error
        toast({
          title: "Error",
          description: fetcher.data.toast.description || "Error al crear el tema.",
          variant: "destructive",
        });
      }
      // Resetear el formulario después de la creación
      setNuevoMaterial({
        titulo: "",
        numero: "",
        color: "#008999",
        descripcion: "",
      });
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <AppLayout
      sidebarOptions={loaderData.sidebar}
      userData={loaderData.user}
    >
      <div className="w-full max-w-6xl mx-auto py-8">
        <div className="flex flex-col mb-4">
          <h1 className="text-4xl font-bold text-primary flex flex-row items-center gap-5"> <Library size={32} /> Biblioteca</h1>
          <Separator className="my-4 bg-[#004d5a]" />
          <div className="flex gap-4 flex-wrap self-end">
            {/* Menú desplegable para filtrar por tipo de contenido */}
            {/* <select
              className="border border-[#008999] rounded-lg px-4 py-2 text-base bg-[#e0f7fa] text-[#008999] font-semibold focus:ring-2 focus:ring-[#008999] focus:bg-[#e0f7fa]"
              style={{ backgroundColor: "#e0f7fa" }}
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value)}
            >
              {tipos.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select> */}
            <Button
              className="bg-[#008999] text-white font-bold px-6 py-2 rounded-lg hover:bg-[#33b0bb] transition flex items-center gap-2"
              onClick={() => setShowModal(true)}
              type="button"
            >
              <Plus className="w-5 h-5" />
              Agregar tema
            </Button>
          </div>
        </div>
        {/* Modal para cargar material */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
              <h2 className="text-2xl font-bold mb-4 text-[#008999]">Agregar Tema</h2>
              <form onSubmit={handleSubir} className="flex flex-col gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-[#008999]">Tema # </label>
                  <input
                    type="number"
                    name="numero"
                    value={nuevoMaterial.numero}
                    onChange={handleInputChange}
                    min={1}
                    className="w-full border border-[#008999] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#008999] bg-white text-black font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#008999]">Título</label>
                  <input
                    type="text"
                    name="titulo"
                    value={nuevoMaterial.titulo}
                    onChange={handleInputChange}
                    className="w-full border border-[#008999] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#008999] bg-white text-black font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#008999]">Descripción</label>
                  <input
                    type="text"
                    name="descripcion"
                    value={nuevoMaterial.descripcion || ""}
                    onChange={handleInputChange}
                    className="w-full border border-[#008999] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#008999] bg-white text-black font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#008999]">Color de la tarjeta</label>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full border-2 border-[#008999] flex items-center justify-center shadow"
                      style={{ backgroundColor: nuevoMaterial.color }}
                    >
                      <input
                        type="color"
                        name="color"
                        value={nuevoMaterial.color}
                        onChange={handleInputChange}
                        className="opacity-0 w-10 h-10 cursor-pointer"
                        style={{ borderRadius: "9999px" }}
                      />
                    </div>
                    <span className="text-[#008999] font-semibold">
                      {hexToRgbLabel(nuevoMaterial.color)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-4 justify-end mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-[#008999] text-[#008999] hover:bg-[#e0f7fa]"
                    onClick={handleCancelar}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#008999] text-white font-bold hover:bg-[#33b0bb]"
                  >
                    Crear
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtroTipo === "temas" ? (
            temas.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-12">
                No hay temas disponibles.
              </div>
            ) : (
              temas.map((tema: any) => (
                <Card key={tema.id || tema.numero} className={`transition-transform duration-200 hover:scale-105 hover:shadow-lg border border-[#008999]`} style={{ backgroundColor: tema.color || "#e0f7fa" }}>
                  <CardHeader>
                    <CardTitle className={`text-lg font-bold text-black`}>
                      Tema #{tema.numero ?? tema.id}: {tema.titulo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2 text-sm text-black">{tema.descripcion}</div>
                    <Button
                      asChild
                      className="mt-2 w-full bg-[#008999] hover:bg-[#33b0bb] text-white font-bold flex items-center gap-2"
                    >
                      <a href={`/temas/${tema.id_temas}`}>
                        <Eye className="w-5 h-5" />
                        Ver
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))
            )
          ) : recursosFiltrados.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-12">
              No hay recursos para este filtro.
            </div>
          ) : (
            recursosFiltrados.map((recurso) => (
              <Card key={recurso.id} className="transition-transform duration-200 hover:scale-105 hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">{recurso.titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 text-sm text-gray-600">{recurso.descripcion}</div>
                  <div className="mb-2">
                    <span className="inline-block bg-[#008999] text-white text-xs px-3 py-1 rounded-full mr-2">{recurso.tema}</span>
                    <span className="inline-block bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full">{recurso.tipo.charAt(0).toUpperCase() + recurso.tipo.slice(1)}</span>
                  </div>
                  <Button asChild className="mt-2 w-full bg-[#008999] hover:bg-[#33b0bb] text-white font-bold">
                    <a href={recurso.url} target="_blank" rel="noopener noreferrer">
                      Ver recurso
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
