import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import AppLayout from "~/layouts/AppLayout";
import { getSidebar, requireAuth, user } from "~/services/auth.server";
import { Eye, Download } from "lucide-react";
import { Separator } from "~/components/ui/separator";

export const meta: MetaFunction = () => {
  return [
    { title: "ABC English" },
    { name: "description", content: "Sistema educativo de inglés" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth({ request });

  const u = await user({ request });
  const sidebar = await getSidebar({ request });

  return {
    user: {
      ...u.user,
      role: "Profesor",
    },
    sidebar: sidebar,
  };
}

export default function Index() {
  const loaderData = useLoaderData<any>();

  // Ejemplo de archivos de texto
  const files = [
    {
      name: "Guía de estudio 1",
      description: "Contenidos para el primer parcial",
      url: "/files/guia1.txt",
    },
    {
      name: "Guía de estudio 2",
      description: "Contenidos para el segundo parcial",
      url: "/files/guia2.txt",
    },
    {
      name: "Resumen de gramática",
      description: "Reglas gramaticales básicas",
      url: "/files/gramatica.txt",
    },
  ];

  return (
    <AppLayout
      sidebarOptions={loaderData.sidebar}
      userData={loaderData.user}
    >
      <div className="w-full max-w-6xl mx-auto py-8">
        <div className="flex flex-col mb-4">
          <h1 className="text-4xl font-bold text-primary">Archivos de Textos</h1>
        </div>
          <Separator className="my-4 bg-[#004d5a]" />
      <div className="overflow-x-auto rounded-2xl shadow-lg bg-gradient-to-br from-[#e0f7fa] via-[#b2dfdb] to-[#fffde7] p-6">
        <table className="min-w-full rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-[#008999] text-white">
              <th className="py-4 px-6 text-left font-semibold">Nombre</th>
              <th className="py-4 px-6 text-left font-semibold">Descripción</th>
              <th className="py-4 px-6 text-center font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, idx) => (
              <tr
                key={idx}
                className={`border-b last:border-b-0 ${idx % 2 === 0 ? "bg-white/80" : "bg-white/60"} hover:bg-[#e0f7fa] transition`}
              >
                <td className="py-4 px-6">{file.name}</td>
                <td className="py-4 px-6">{file.description}</td>
                <td className="py-4 px-6 flex gap-3 justify-center">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-bold transition shadow flex items-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    Ver
                  </a>
                  <a
                    href={file.url}
                    download
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold transition shadow flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Descargar
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </AppLayout>
  );
}
