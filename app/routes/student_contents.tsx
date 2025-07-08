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
import { Eye } from "lucide-react";
import { Dialog as ConfirmDialog, DialogContent as ConfirmDialogContent, DialogHeader as ConfirmDialogHeader, DialogTitle as ConfirmDialogTitle, DialogFooter as ConfirmDialogFooter } from "~/components/ui/dialog";

export const meta: MetaFunction = () => [
  { title: "ABC English" },
  { name: "description", content: "Sistema educativo de inglés" },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAuth({ request });

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
  });
  const [contentType, setContentType] = useState<string>("1"); // 1: imagen, 2: video, 3: texto
  const [dragActive, setDragActive] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{ type: "image" | "video" | null, url: string, title: string }>({ type: null, url: "", title: "" });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const viewFetcher = useFetcher();

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, files } = e.target;
    if (name === "archivo") {
      setNuevoContenido((prev) => ({ ...prev, archivo: files && files.length > 0 ? files[0] : null }));
      setDragActive(false);
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
    setNuevoContenido({ contenido: "", archivo: null });
  }

  function handleDialogSave(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("contenido", nuevoContenido.contenido);
    if (nuevoContenido.archivo) {
      formData.append("file", nuevoContenido.archivo);
    }
    formData.append("id_tipocontenido_fk", contentType);
    formData.append("id_tema_fk", id+"");

    fetcher.submit(
      formData,
      {
        method: "post",
        encType: "multipart/form-data",
        action: `/api/teacher/create_content/${id}`,
      }
    );
    setShowDialog(false);
    setNuevoContenido({ contenido: "", archivo: null });
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
  function handlePreview(type: "image" | "video", url: string, title: string) {
    setPreviewData({ type, url, title });
    setPreviewOpen(true);
  }

  // Actualizar la lista localmente tras eliminar
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && fetcher.data.success === "success") {
      toast({
        title: "Eliminado",
        description: "El contenido ha sido eliminado correctamente.",
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

  // Función para ver contenido y contar la vista
  async function handleViewContent(item: any, type: "image" | "video" | "text") {
    const formData = new FormData();
    formData.append("contentId", item.id_contenido);
    viewFetcher.submit(formData, {
      method: "post",
      action: "/api/student/view_content",
    });
    // Espera a que la petición termine antes de mostrar el contenido
    // Si quieres esperar la respuesta, puedes usar un useEffect sobre viewFetcher.data
    if (type === "image") {
      setPreviewData({ type: "image", url: item.url, title: item.titulo });
      setPreviewOpen(true);
    } else if (type === "video") {
      setPreviewData({ type: "video", url: item.url, title: item.titulo });
      setPreviewOpen(true);
    } else if (type === "text") {
      window.open(item.url, "_blank");
    }
  }

  return (
    <AppLayout sidebarOptions={loaderData.sidebar} userData={loaderData.user}>
      <div className="w-full max-w-6xl mx-auto py-8">
        <div className="flex flex-col mb-4">
          <h1 className="text-4xl font-bold text-primary">Contenidos por Tema</h1>
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
                      {/* <Button
                        className="bg-[#008999] hover:bg-[#33b0bb] text-white font-bold px-6 py-2 rounded-lg"
                        onClick={() => {setShowDialog(true); setContentType("1")}}
                        type="button"
                      >
                        Agregar contenido
                      </Button> */}
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
                                      onClick={() => handleViewContent(item, "image")}
                                    >
                                      <Eye />
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
                      {/* <Button
                        className="bg-[#008999] hover:bg-[#33b0bb] text-white font-bold px-6 py-2 rounded-lg"
                        onClick={() => {setShowDialog(true); setContentType("2")}}
                        type="button"
                      >
                        Agregar contenido
                      </Button> */}
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
                                    {item.url && !item.url.includes("localhost") && !item.url.startsWith("/") ? (
                                      <Button
                                        asChild
                                        variant="ghost"
                                        size="icon"
                                        title="Ver video externo"
                                      >
                                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                                          <Eye />
                                        </a>
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        title="Ver video"
                                        onClick={() => handleViewContent(item, "video")}
                                      >
                                        <Eye />
                                      </Button>
                                    )}
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
                      {/* <Button
                        className="bg-[#008999] hover:bg-[#33b0bb] text-white font-bold px-6 py-2 rounded-lg"
                        onClick={() => {setShowDialog(true); setContentType("3")}}
                        type="button"
                      >
                        Agregar contenido
                      </Button> */}
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
                                      onClick={() => handleViewContent(item, "text")}
                                    >
                                      <Eye />
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{previewData.title}</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center items-center min-h-[200px]">
              {previewData.type === "image" && (
                <img src={previewData.url} alt={previewData.title} className="max-h-96 max-w-full rounded-lg" />
              )}
              {previewData.type === "video" && (
                <video src={previewData.url} controls className="max-h-96 max-w-full rounded-lg" />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
