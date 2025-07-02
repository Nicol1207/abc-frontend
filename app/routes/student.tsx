import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import AppLayout from "~/layouts/AppLayout";
import { getSidebar, requireAuth, user } from "~/services/auth.server";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export const meta: MetaFunction = () => {
  return [
    { title: "ABC English" },
    { name: "description", content: "Sistema educativo de inglés" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth({ request });

  const u = await user({request});
  const sidebar = await getSidebar({request});

  console.log("Cargando datos del estudiante:", u);

  // profesor de inglés asignado
  const englishTeacher = {
    name: "Prof. María González",
    email: "maria.gonzalez@abcenglish.com",
    subject: "Inglés"
  };

  return {
    user: {
      ...u.user,
      role: u.role,
    },
    sidebar: sidebar,
    englishTeacher,
  };
}

export default function Index() {
  const loaderData = useLoaderData<any>();
  const { user, englishTeacher } = loaderData;

  return (
    <AppLayout
      sidebarOptions={loaderData.sidebar}
      userData={loaderData.user}
    >
      <div className="flex flex-col min-h-screen  px-2 py-8 overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl mx-auto mb-8 gap-6">
          <h1 className="text-4xl font-bold text-primary drop-shadow text-center md:text-left flex-1  rounded-xl px-6 py-4">
            {`¡Bienvenido, ${user?.name || "Estudiante"}!`}
          </h1>
          <div className="w-full md:w-auto flex-1 flex justify-center">
            <Card className="bg-blue-50 border-blue-200 min-w-[260px] max-w-md w-full">
              <CardHeader>
                <CardTitle className="text-indigo-700">Frase de motivación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="italic text-lg text-indigo-900 text-center">
                  "The best way to predict the future is to create it."
                </div>
                <div className="text-right text-sm text-indigo-400 mt-2">- Peter Drucker</div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl mx-auto mb-8">
          <Card className="flex-1 min-w-[260px]">
            <CardHeader>
              <CardTitle className="text-blue-600">Tu información</CardTitle>
            </CardHeader>
            <CardContent>
              <div><b>Nombre:</b> {user.name}</div>
              <div><b>Email:</b> {user.email}</div>
              <div><b>Rol:</b> {user.role}</div>
            </CardContent>
          </Card>
          <Card className="flex-1 min-w-[260px]">
            <CardHeader>
              <CardTitle className="text-green-600">Tu profesor de Inglés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-semibold text-lg">{englishTeacher.name}</div>
              <div className="text-muted-foreground text-sm">{englishTeacher.email}</div>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-row gap-8 w-full max-w-4xl mx-auto justify-center flex-1 items-center">
          <DashboardButton
            color="bg-yellow-400"
            hover="hover:bg-yellow-500"
            icon="🎬"
            label="Videos"
            to="/text"
            className="flex-1"
            
          />
          <DashboardButton
            color="bg-sky-400"
            hover="hover:bg-sky-500"
            icon="🖼️"
            label="Imágenes"
            to="/images"
            className="flex-1"
          />
          <DashboardButton
            color="bg-rose-400"
            hover="hover:bg-rose-500"
            icon="📖"
            label="Textos"
            to="/video"
            className="flex-1"
          />
        </div>
      </div>
    </AppLayout>
  );
}

// Botón grande y colorido usando shadcn/ui Button
function DashboardButton({
  color,
  hover,
  icon,
  label,
  to,
  className = ""
}: {
  color: string,
  hover: string,
  icon: string,
  label: string,
  to: string,
  className?: string
}) {
  return (
    <Button
      asChild
      className={`flex flex-col items-center justify-center ${color} ${hover} text-white rounded-2xl shadow-xl w-full h-44 text-2xl font-bold transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${className}`}
      style={{ boxShadow: "0 4px 24px #e0e7ff" }}
    >
      <a href={to}>
        <span className="text-5xl mb-2 block">{icon}</span>
        {label}
      </a>
    </Button>
  );
}
