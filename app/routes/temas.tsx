import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useFetcher, useLoaderData, useParams } from "@remix-run/react";
import AppLayout from "~/layouts/AppLayout";
import { getSidebar, requireAuth, requireTeacher, user } from "~/services/auth.server";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog";
import { useEffect, useState } from "react";
import { Separator } from "~/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { getContents } from "~/services/loaders/teacher.server";
import { toast } from "~/hooks/use-toast";
import { Book, Eye } from "lucide-react";
import { Dialog as ConfirmDialog, DialogContent as ConfirmDialogContent, DialogHeader as ConfirmDialogHeader, DialogTitle as ConfirmDialogTitle, DialogFooter as ConfirmDialogFooter } from "~/components/ui/dialog";

export const meta: MetaFunction = () => [
  { title: "ABC Media" },
  { name: "description", content: "Sistema educativo de inglés" },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAuth({ request });
  await requireTeacher({ request });

  const {id} = params;

  const u = await user({ request });
  const sidebar = await getSidebar({ request });

  const contents = await getContents({ request, theme_id: id });

  console.log("Contents loaded:", contents.data);

  const imagenes = contents.data.images;
  const videos = contents.data.videos;
  const textos = contents.data.documents;

  return {
    user: {
      ...u.user,
      role: u.rol,
    },
    sidebar,
    imagenes,
    videos,
    textos,
  };
}

export default function Temas() {
  const { id } = useParams<any>();
  const fetcher = useFetcher<any>();
  const loaderData = useLoaderData<any>();
  const [tab, setTab] = useState("imagenes");
  const [showDialog, setShowDialog] = useState(false);
  const [nuevoContenido, setNuevoContenido] = useState({
    contenido: "",
    archivo: null as File | null,
    tipoCarga: "archivo", // "archivo" o "link"
    link: "",
  });
  const [contentType, setContentType] = useState<string>("1"); // 1: imagen, 2: video, 3: texto
  const [dragActive, setDragActive] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{ type: "image" | "video" | "pdf" | null, url: string, title: string }>({ type: null, url: "", title: "" });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, files, type } = e.target as any;
    if (name === "archivo") {
      setNuevoContenido((prev) => ({ ...prev, archivo: files && files.length > 0 ? files[0] : null }));
      setDragActive(false);
    } else if (name === "tipoCarga") {
      setNuevoContenido((prev) => ({ ...prev, tipoCarga: value, archivo: null, link: "" }));
    } else {
      setNuevoContenido((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setNuevoContenido((prev) => ({ ...prev, archivo: e.dataTransfer.files[0] }));
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function handleDialogClose() {
    setShowDialog(false);
    setNuevoContenido({ contenido: "", archivo: null, tipoCarga: "archivo", link: "" });
  }

  function handleDialogSave(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("contenido", nuevoContenido.contenido);
    formData.append("id_tipocontenido_fk", contentType);
    formData.append("id_tema_fk", id+"");
    formData.append("tipoCarga", nuevoContenido.tipoCarga);
    if (nuevoContenido.tipoCarga === "archivo" && nuevoContenido.archivo) {
      formData.append("file", nuevoContenido.archivo);
    }
    if (nuevoContenido.tipoCarga === "link" && nuevoContenido.link) {
      formData.append("link", nuevoContenido.link);
    }

    fetcher.submit(
      formData,
      {
        method: "post",
        encType: "multipart/form-data",
        action: `/api/teacher/create_content/${id}`,
      }
    );
    setShowDialog(false);
    setNuevoContenido({ contenido: "", archivo: null, tipoCarga: "archivo", link: "" });
  }

  // Helper para obtener los datos según el tab
  function getDataByTab(tab: string) {
    if (tab === "imagenes") return loaderData.imagenes;
    if (tab === "videos") return loaderData.videos;
    if (tab === "textos") return loaderData.textos;
    return [];
  }

  // Helper para el título del tab
  function getTabTitle(tab: string) {
    if (tab === "imagenes") return "Imágenes";
    if (tab === "videos") return "Videos";
    if (tab === "textos") return "Textos";
    return "";
  }

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.success === "success") {
        handleDialogClose();
        // Aquí podrías mostrar un mensaje de éxito
        toast({
            title: "Éxito",
            description: "Contenido agregado correctamente.",
        })
      } else if (fetcher.data.success === "error") {
        // Aquí podrías mostrar un mensaje de error
        toast({
            title: "Error",
            description: fetcher.data.message,
            variant: "destructive",
        })
      }
    }
  }, [fetcher.state, fetcher.data]);

  // Función para abrir el modal de vista previa
  function handlePreview(type: "image" | "video" | "pdf", url: string, title: string) {
    setPreviewData({ type, url, title });
    setPreviewOpen(true);
  }

  // Eliminar contenido usando fetcher Remix
  function handleDeleteContent(id: number) {
    setDeleteId(id);
    setShowDeleteDialog(true);
  }

  function confirmDelete() {
    if (!deleteId) return;
    const formData = new FormData();
    formData.append("id", deleteId.toString());
    fetcher.submit(formData, {
      method: "post",
      action: "/api/teacher/eliminar_contenido",
    });
    setShowDeleteDialog(false);
    setDeleteId(null);
  }

  // Actualizar la lista localmente tras eliminar
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && fetcher.data.success === "success") {
      toast({
        title: fetcher.data.toast?.title,
        description: fetcher.data.toast?.description,
      });
      window.location.reload();
    } else if (fetcher.state === "idle" && fetcher.data && fetcher.data.success === "error") {
      toast({
        title: "Error",
        description: fetcher.data.toast?.description || "No se pudo eliminar el contenido.",
        variant: "destructive",
      });
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <AppLayout sidebarOptions={loaderData.sidebar} userData={loaderData.user}>
      <div className="w-full max-w-6xl mx-auto py-8">
        <div className="flex flex-col mb-4">
          <h1 className="text-4xl font-bold text-primary flex flex-row items-center gap-5"> <Book size={32} /> Contenidos por Tema</h1>
          <Separator className="my-4 bg-[#004d5a]" />
          <div className="w-full border border-[#197080] rounded-xl overflow-hidden bg-white">
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="flex justify-center py-6 w-full px-4 gap-2">
                <TabsTrigger value="imagenes" className="flex-1 px-4 mx-0">Imágenes</TabsTrigger>
                <TabsTrigger value="videos" className="flex-1 px-4 mx-0">Videos</TabsTrigger>
                <TabsTrigger value="textos" className="flex-1 px-4 mx-0">Textos</TabsTrigger>
              </TabsList>
              <div className="px-8 pb-8 pt-6">
                <TabsContent value="imagenes">
                  <Card className="border-none shadow-none">
                    <CardHeader className="flex flex-row justify-between items-center p-0 mb-4">
                      <CardTitle className="text-2xl font-bold text-[#008999]">{getTabTitle("imagenes")}</CardTitle>
                      <Button
                        className="bg-[#008999] hover:bg-[#33b0bb] text-white font-bold px-6 py-2 rounded-lg"
                        onClick={() => {setShowDialog(true); setContentType("1")}}
                        type="button"
                      >
                        Agregar contenido
                      </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="min-w-full rounded-xl border border-separate border-spacing-0 bg-white">
                          <thead>
                            <tr>
                              <th className="w-1/2 bg-[#d9f4f9] text-[#008999] font-bold text-lg py-3 px-4 text-center rounded-tl-xl">
                                Título
                              </th>
                              <th className="w-1/2 bg-[#d9f4f9] text-[#008999] font-bold text-lg py-3 px-4 text-center rounded-tr-xl">
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {loaderData.imagenes.length === 0 ? (
                              <tr>
                                <td colSpan={2} className="w-1/2 text-center py-4">No hay imágenes</td>
                              </tr>
                            ) : loaderData.imagenes.map((item: any) => (
                              <tr key={item.id} className="border-b border-[#e0e0e0] last:border-b-0">
                                <td className="w-1/2 py-4 px-4 text-center">{item.titulo}</td>
                                <td className="w-1/2 py-4 px-4 text-center">
                                  <div className="flex justify-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      title="Ver imagen"
                                      onClick={() => handlePreview("image", item.url, item.titulo)}
                                    >
                                      <Eye />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      title="Eliminar imagen"
                                      onClick={() => handleDeleteContent(item.id_contenido)}
                                      style={{ color: '#e53935' }}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="videos">
                  <Card className="border-none shadow-none">
                    <CardHeader className="flex flex-row justify-between items-center p-0 mb-4">
                      <CardTitle className="text-2xl font-bold text-[#008999]">{getTabTitle("videos")}</CardTitle>
                      <Button
                        className="bg-[#008999] hover:bg-[#33b0bb] text-white font-bold px-6 py-2 rounded-lg"
                        onClick={() => {setShowDialog(true); setContentType("2")}}
                        type="button"
                      >
                        Agregar contenido
                      </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="min-w-full rounded-xl border border-separate border-spacing-0 bg-white">
                          <thead>
                            <tr>
                              <th className="w-1/2 bg-[#d9f4f9] text-[#008999] font-bold text-lg py-3 px-4 text-center rounded-tl-xl">
                                Título
                              </th>
                              <th className="w-1/2 bg-[#d9f4f9] text-[#008999] font-bold text-lg py-3 px-4 text-center rounded-tr-xl">
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {loaderData.videos.length === 0 ? (
                              <tr>
                                <td colSpan={2} className="w-1/2 text-center py-4">No hay videos</td>
                              </tr>
                            ) : loaderData.videos.map((item: any) => (
                              <tr key={item.id} className="border-b border-[#e0e0e0] last:border-b-0">
                                <td className="w-1/2 py-4 px-4 text-center">{item.titulo}</td>
                                <td className="w-1/2 py-4 px-4 text-center">
                                  <div className="flex justify-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      title="Ver video"
                                      onClick={() => handlePreview("video", item.url, item.titulo)}
                                    >
                                      <Eye />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      title="Eliminar video"
                                      onClick={() => handleDeleteContent(item.id_contenido)}
                                      style={{ color: '#e53935' }}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="textos">
                  <Card className="border-none shadow-none">
                    <CardHeader className="flex flex-row justify-between items-center p-0 mb-4">
                      <CardTitle className="text-2xl font-bold text-[#008999]">{getTabTitle("textos")}</CardTitle>
                      <Button
                        className="bg-[#008999] hover:bg-[#33b0bb] text-white font-bold px-6 py-2 rounded-lg"
                        onClick={() => {setShowDialog(true); setContentType("3")}}
                        type="button"
                      >
                        Agregar contenido
                      </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="min-w-full rounded-xl border border-separate border-spacing-0 bg-white">
                          <thead>
                            <tr>
                              <th className="w-1/2 bg-[#d9f4f9] text-[#008999] font-bold text-lg py-3 px-4 text-center rounded-tl-xl">
                                Título
                              </th>
                              <th className="w-1/2 bg-[#d9f4f9] text-[#008999] font-bold text-lg py-3 px-4 text-center rounded-tr-xl">
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {loaderData.textos.length === 0 ? (
                              <tr>
                                <td colSpan={2} className="w-1/2 text-center py-4">No hay textos</td>
                              </tr>
                            ) : loaderData.textos.map((item: any) => (
                              <tr key={item.id} className="border-b border-[#e0e0e0] last:border-b-0">
                                <td className="w-1/2 py-4 px-4 text-center">{item.titulo}</td>
                                <td className="w-1/2 py-4 px-4 text-center">
                                  <div className="flex justify-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      title="Ver archivo"
                                      onClick={() => {
                                        if (item.url && item.url.toLowerCase().endsWith('.pdf')) {
                                          handlePreview("pdf", item.url, item.titulo);
                                        } else {
                                          window.open(item.url, "_blank");
                                        }
                                      }}
                                    >
                                      <Eye />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      title="Eliminar archivo"
                                      onClick={() => handleDeleteContent(item.id_contenido)}
                                      style={{ color: '#e53935' }}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Contenido</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleDialogSave} className="flex flex-col gap-4 mt-2">
              <div>
                <label className="block font-semibold mb-1 text-[#008999]">Título</label>
                <input
                  type="text"
                  name="contenido"
                  value={nuevoContenido.contenido}
                  onChange={handleInputChange}
                  className="w-full border border-[#008999] rounded-lg px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#008999]"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#008999]">Tipo de carga</label>
                <select
                  name="tipoCarga"
                  value={nuevoContenido.tipoCarga}
                  onChange={handleInputChange}
                  className="w-full border border-[#008999] rounded-lg px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#008999]"
                >
                  <option value="archivo">Archivo</option>
                  <option value="link">Link</option>
                </select>
              </div>
              {nuevoContenido.tipoCarga === "archivo" && (
                <div>
                  <label className="block font-semibold mb-1 text-[#008999]">Archivo</label>
                  <div
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg px-4 py-8 cursor-pointer transition-colors ${
                      dragActive ? "border-[#33b0bb] bg-[#e0f7fa]" : "border-[#008999] bg-white"
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => document.getElementById("file-input-tema")?.click()}
                    style={{ minHeight: "120px" }}
                  >
                    <input
                      id="file-input-tema"
                      type="file"
                      name="archivo"
                      accept="*"
                      onChange={handleInputChange}
                      className="hidden"
                    />
                    {nuevoContenido.archivo ? (
                      <div className="text-[#008999] font-semibold truncate">
                        {nuevoContenido.archivo.name}
                      </div>
                    ) : (
                      <div className="text-[#008999] font-semibold text-center">
                        {dragActive
                          ? "Suelta el archivo aquí"
                          : "Arrastra y suelta un archivo aquí o haz clic para seleccionar"}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {nuevoContenido.tipoCarga === "link" && (
                <div>
                  <label className="block font-semibold mb-1 text-[#008999]">Enlace</label>
                  <input
                    type="url"
                    name="link"
                    value={nuevoContenido.link}
                    onChange={handleInputChange}
                    className="w-full border border-[#008999] rounded-lg px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#008999]"
                    placeholder="https://..."
                    required
                  />
                </div>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        {/* Modal de vista previa */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent className={previewData.type === "pdf" ? "max-w-5xl w-full" : ""}>
            <DialogHeader>
              <DialogTitle>Vista previa: {previewData.title}</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center items-center min-h-[200px]">
              {previewData.type === "image" && (
                <img src={previewData.url} alt={previewData.title} className="max-h-96 max-w-full rounded-lg" />
              )}
              {previewData.type === "video" && (
                previewData.url && !previewData.url.includes("localhost") && !previewData.url.startsWith("/") ? (
                  <a
                    href={previewData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-lg"
                  >
                    Abrir video externo en otra pestaña
                  </a>
                ) : (
                  <video controls className="max-h-96 max-w-full rounded-lg">
                    <source src={previewData.url} type="video/mp4" />
                    <track
                      kind="subtitles"
                      src={
                        previewData.url
                          ? previewData.url
                              .replace(/^https?:\/\/[^/]+\/storage\//, "/")
                              .replace(/\.[^.]+$/, ".vtt")
                          : ""
                      }
                      srcLang="es"
                      label="Español"
                      default
                    />
                    Tu navegador no soporta la etiqueta de video.
                  </video>
                )
              )}
              {previewData.type === "pdf" && (
                <iframe
                  src={previewData.url}
                  title={previewData.title}
                  width="100%"
                  height="700px"
                  style={{ border: "none", minWidth: "900px", maxWidth: "1200px", maxHeight: "700px" }}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
        <ConfirmDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <ConfirmDialogContent>
            <ConfirmDialogHeader>
              <ConfirmDialogTitle>¿Eliminar contenido?</ConfirmDialogTitle>
            </ConfirmDialogHeader>
            <div className="py-4 text-center text-lg">Esta acción no se puede deshacer. ¿Deseas continuar?</div>
            <ConfirmDialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={confirmDelete}>Eliminar</Button>
            </ConfirmDialogFooter>
          </ConfirmDialogContent>
        </ConfirmDialog>
      </div>
    </AppLayout>
  );
}
