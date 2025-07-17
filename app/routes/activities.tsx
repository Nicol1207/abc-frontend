import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import AppLayout from "~/layouts/AppLayout";
import { requireAuth, requireTeacher, user, getSidebar } from "~/services/auth.server";
import { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { getActivities } from "~/services/loaders/teacher.server";
import { Dialog, DialogTrigger, DialogContent } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import EmojiPicker from "emoji-picker-react"; // Importa el componente de emoji
import { toast } from "~/hooks/use-toast";
import { useFetcher, useNavigate } from "@remix-run/react";
import { Notebook } from "lucide-react";

export const meta: MetaFunction = () => [
  { title: "Actividades | ABC Media" },
  { name: "description", content: "Actividades creadas por el profesor" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth({ request });

  const u = await user({ request });
  const sidebar = await getSidebar({ request });
  const activities = await getActivities({ request });

  console.log("Activities loader data:", activities);

  return {
    user: {
      ...u.user,
      role: u.rol,
    },
    sidebar,
    activities: activities.data || [],
  };
}

export default function Activities() {
  const loaderData = useLoaderData<any>();
  const actividades = loaderData.activities || [];

  const tipos: any = {
    sopa: "Sopa de letras",
    crucigrama: "Crucigrama",
    memoria: "Memoria",
  };

  // Estado para palabras seleccionadas y nuevas
  const [selectedWords, setSelectedWords] = useState<any[]>([]);
  const [newWord, setNewWord] = useState({ english: '', spanish: '', emoji: '' });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiButtonRef = useRef<any>(null);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [activityTitle, setActivityTitle] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [activityPoints, setActivityPoints] = useState(1);
  const [activityType, setActivityType] = useState("");
  const fetcher = useFetcher<any>();
  const navigate = useNavigate();

  // Maneja el cambio de los inputs de nueva palabra
  const handleNewWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.placeholder.toLowerCase();
    // Corrige el nombre para que coincida con las claves del estado
    let key = name;
    if (key === 'inglés') key = 'english';
    if (key === 'español') key = 'spanish';
    if (key === 'emoji') key = 'emoji';
    setNewWord({ ...newWord, [key]: e.target.value });
  };

  // Agrega la nueva palabra al listado
  const handleAddWord = () => {
    if (newWord.english && newWord.spanish && newWord.emoji) {
      setSelectedWords([
        ...selectedWords,
        {
          id: Date.now(),
          english: newWord.english,
          spanish: newWord.spanish,
          emoji: newWord.emoji,
        },
      ]);
      setNewWord({ english: '', spanish: '', emoji: '' });
    }
  };

  // Maneja el check de palabras seleccionadas
  const handleWordCheck = (id: number) => {
    setSelectedWords(selectedWords.map(w => w.id === id ? { ...w, checked: !w.checked } : w));
  };

  useEffect(() => {
    if (fetcher.data && fetcher.state === "idle") {
      if (fetcher.data.success === "success") {
        toast({
          title: "Éxito",
          description: "Actividad creada correctamente",
        });
        setShowCustomDialog(false);
        setActivityTitle("");
        setActivityDescription("");
        setSelectedWords([]);
      } else {
        toast({
          title: "Error",
          description: fetcher.data.message || "Error al crear la actividad",
          variant: "destructive",
        });
      }
    }
  }, [fetcher.data, fetcher.state])

  const handleCreateActivity = () => {
    if (!activityTitle) {
      toast({
        title: "Error",
        description: "Debe indicar el titulo de la actividad",
        variant: "destructive",
      });
      return;
    }
    if (!activityDescription) {
      toast({
        title: "Error",
        description: "Debe indicar la descripción de la actividad",
        variant: "destructive",
      });
      return;
    }
    if (!activityType) {
      toast({
        title: "Error",
        description: "Debe seleccionar el tipo de actividad",
        variant: "destructive",
      });
      return;
    }
    if (selectedWords.length === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos una palabra",
        variant: "destructive",
      });
      return;
    }
    if (activityPoints < 1) {
      toast({
        title: "Error",
        description: "Los puntos deben ser al menos 1",
        variant: "destructive",
      });
      return;
    }
    if (activityPoints > 20) {
      toast({
        title: "Error",
        description: "Los puntos no pueden ser mayores a 100",
        variant: "destructive",
      });
      return;
    }

    // Enviar datos al backend
    fetcher.submit(
      {
        title: activityTitle,
        description: activityDescription,
        type: activityType,
        points: activityPoints,
        words: JSON.stringify(selectedWords),
      },
      {
        method: "post",
        action: "/api/activities/create",
        encType: "application/x-www-form-urlencoded",
      }
    );
  };

  const getActivityRoute = (actividad: any) => {
    console.log(actividad);
    if (
      actividad.tipo === "Sopa de Letras" ||
      actividad.tipo === "sopa" ||
      actividad.tipo === 1 ||
      actividad.tipo === "1"
    ) {
      return `/activities/wordsearch/${actividad.id}`;
    }
    if (
      actividad.tipo === "Crucigrama" ||
      actividad.tipo === "crucigrama" ||
      actividad.tipo === 2 ||
      actividad.tipo === "2"
    ) {
      return `/activities/crossword/${actividad.id}`;
    }
    if (
      actividad.tipo === "Memoria" ||
      actividad.tipo === "memoria" ||
      actividad.tipo === 3 ||
      actividad.tipo === "3"
    ) {
      return `/activities/memory/${actividad.id}`;
    }
    return "#";
  };

  return (
    <>
      <AppLayout sidebarOptions={loaderData.sidebar} userData={loaderData.user}>
        <div className="w-full max-w-6xl mx-auto py-8">
          <div className="flex flex-col mb-4">
            <div className="w-full flex justify-between">
              <h1 className="text-4xl font-bold text-primary flex flex-row items-center gap-5"> <Notebook size={32} /> Actividades</h1>
              <button
                className={`bg-[#008999] text-white hover:bg-[#006f7a] transition-colors px-4 py-2 rounded shadow ${loaderData.user.role_id === 3 ? "hidden" : ""}`}
                onClick={() => setShowCustomDialog(true)}
              >
                Agregar actividad
              </button>
              {/* Custom Dialog */}
              {showCustomDialog && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fadeIn"
                  onClick={() => setShowCustomDialog(false)}
                >
                  <div
                    className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative animate-slideUp"
                    style={{ maxHeight: '90vh', overflowY: 'auto' }}
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
                      onClick={() => setShowCustomDialog(false)}
                    >
                      ×
                    </button>
                    <div className="flex flex-col gap-4">
                      {/* Título de la actividad */}
                      <label className="font-semibold text-sm text-gray-700">Título de la actividad</label>
                      <input
                        type="text"
                        className="border rounded px-3 py-2 bg-white text-black"
                        placeholder="Título"
                        value={activityTitle}
                        onChange={e => setActivityTitle(e.target.value)}
                      />
                      {/* Descripción de la actividad */}
                      <label className="font-semibold text-sm text-gray-700">Descripción</label>
                      <textarea
          className="border rounded px-3 py-2 bg-white text-black resize-none"
          placeholder="Descripción de la actividad"
          value={activityDescription}
          onChange={e => setActivityDescription(e.target.value)}
          rows={2}
        ></textarea>
                      {/* Puntos de la actividad */}
                      <label className="font-semibold text-sm text-gray-700">Puntos</label>
                      <input
                        type="number"
                        min={1}
                        className="border rounded px-3 py-2 bg-white text-black w-32"
                        placeholder="Puntos"
                        value={activityPoints}
                        onChange={e => setActivityPoints(Number(e.target.value))}
                      />
                      {/* Selección de tipo de actividad */}
                      <label className="font-semibold text-sm text-gray-700">Tipo de actividad</label>
                      <select
                        className="border rounded px-3 py-2 bg-white text-black"
                        value={activityType}
                        onChange={e => setActivityType(e.target.value)}
                      >
                        <option value="" disabled>Selecciona el tipo</option>
                        <option value="1">Sopa de letras</option>
                        <option value="2">Crucigrama</option>
                        <option value="3">Memoria</option>
                      </select>

                      {/* Selección y personalización de palabras */}
                      <label className="font-semibold text-sm text-gray-700">Selecciona palabras</label>
                      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border rounded p-2 bg-gray-50 mb-2">
                        {selectedWords.length === 0 ? (
                          <div className="col-span-2 text-center text-gray-400 text-sm">No hay palabras agregadas.</div>
                        ) : (
                          selectedWords.map((word) => (
                            <div className="flex items-center gap-2" key={word.id}>
                              <input
                                type="checkbox"
                                id={`word-${word.id}`}
                                checked={word.checked ?? true}
                                onChange={() => handleWordCheck(word.id)}
                              />
                              <label htmlFor={`word-${word.id}`} className="flex items-center gap-1 cursor-pointer">
                                <span>{word.emoji}</span>
                                <span className="font-medium">{word.english}</span>
                                <span className="text-xs text-gray-500">({word.spanish})</span>
                              </label>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Formulario para agregar nueva palabra */}
                      <label className="font-semibold text-sm text-gray-700">Agregar nueva palabra</label>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Inglés"
                          className="border rounded px-2 py-1 bg-white text-black"
                          value={newWord.english}
                          onChange={handleNewWordChange}
                        />
                        <input
                          type="text"
                          placeholder="Español"
                          className="border rounded px-2 py-1 bg-white text-black"
                          value={newWord.spanish}
                          onChange={handleNewWordChange}
                        />
                        <div className="flex items-center">
                          <button
                            ref={emojiButtonRef}
                            className="bg-[#008999] text-white px-2 py-1 text-xs rounded"
                            type="button"
                            onClick={() => setShowEmojiPicker(true)}
                          >
                            {newWord.emoji ? newWord.emoji : 'Seleccionar emoji'}
                          </button>
                        </div>
                      </div>
                      <button className="bg-[#004d5a] text-white w-fit mt-2 px-4 py-2 rounded" type="button" onClick={handleAddWord}>Agregar palabra</button>

                      {/* Botón para crear la actividad */}
                      <button className="bg-[#008999] text-white mt-4 px-4 py-2 rounded" type="button" onClick={handleCreateActivity}>Crear actividad</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Separator className="my-4 bg-[#004d5a]" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {actividades.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-12">
                No hay actividades creadas.
              </div>
            ) : (
              actividades.map((actividad: any) => (
                <Card key={actividad.id} className="transition-transform duration-200 hover:scale-105 hover:shadow-lg border border-[#008999]">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-black">
                      {actividad.titulo}
                    </CardTitle>
                    <CardDescription>
                      {actividad.descripcion}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="inline-block bg-[#008999] text-white text-xs px-3 py-1 rounded-full">
                      {tipos[actividad.tipo] || actividad.tipo}
                    </span>
                    <div className="flex justify-end mt-4">
                      <button
                        className="bg-[#008999] text-white px-4 py-2 rounded hover:bg-[#006f7a] transition-colors"
                        type="button"
                        onClick={() => {
                          const ruta = getActivityRoute(actividad);
                          console.log("Redirigiendo a:", ruta);
                          navigate(ruta);
                        }}
                      >
                        Ver
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </AppLayout>
      {/* Emoji picker fuera del modal y encima de todo */}
      {showEmojiPicker && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
          }}
        >
          <EmojiPicker
          onEmojiClick={(emoji) => {
            setNewWord({ ...newWord, emoji: emoji.emoji });
            setShowEmojiPicker(false);
          }}
          />
          <div className="flex justify-end p-2">
            <button className="bg-gray-300 text-black px-2 py-1 text-xs rounded" type="button" onClick={() => setShowEmojiPicker(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
