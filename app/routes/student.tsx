import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import AppLayout from "~/layouts/AppLayout";
import { getSidebar, requireAuth, user } from "~/services/auth.server";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { getStudent, getTeacher } from "~/services/loaders/student.server";
import { Star } from "lucide-react";

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
  const teacher = await getTeacher({ request });
  const student = await getStudent({ request });

  console.log("Cargando datos del estudiante:", student.data);

  // profesor de inglés asignado
  const englishTeacher = {
    name: teacher.data.name,
    email: teacher.data.email,
    subject: "Inglés"
  };

  return {
    user: {
      ...u.user,
      role: u.role,
    },
    sidebar: sidebar,
    englishTeacher,
    student
  };
}

export default function Index() {
  const loaderData = useLoaderData<any>();
  const { user, englishTeacher } = loaderData;
  // Simulación de puntos (ajusta según tu backend)
  const points = loaderData.student?.points ?? 0;

  return (
    <AppLayout
      sidebarOptions={loaderData.sidebar}
      userData={loaderData.user}
    >
      <div className="flex flex-col w-full h-full px-2 py-6">
        <h1 className="text-4xl font-bold text-primary drop-shadow text-center rounded-xl px-6 py-6 mb-4 bg-white/80 shadow-md">
          {`¡Bienvenido, ${user?.name || "Estudiante"}!`}
        </h1>
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl mx-auto mb-4">
          <Card className="flex-1 min-w-[260px] bg-white/90 flex flex-col justify-start h-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-indigo-700">Tu información</CardTitle>
              <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-full">
                <Star className="text-yellow-500 w-6 h-6 fill-yellow-400" />
                <span className="font-bold text-lg text-yellow-700">{loaderData.student.data.recompensas}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-2"><b>Nombre:</b> {user.name}</div>
              <div className="mb-2"><b>Email:</b> {user.email}</div>
              <div className="mb-2"><b>Rol:</b> {user.role}</div>
              <div className="mb-2"><b>Profesor de Inglés:</b> {englishTeacher.name}</div>
              <div className="mb-2"><b>Email del profesor:</b> {englishTeacher.email}</div>
            </CardContent>
          </Card>
          <Card className="flex-1 min-w-[260px] bg-white/90 flex flex-col justify-start h-auto">
            <CardHeader>
              <CardTitle className="text-indigo-700 w-full">Frase de motivación</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex flex-col items-center justify-center h-40 w-full">
                <div className="italic text-lg text-indigo-900 text-center max-w-xs flex items-center h-full">
                  "The best way to predict the future is to create it."
                </div>
                <div className="text-sm text-indigo-400 mt-2 text-center w-full">- Peter Drucker</div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-row gap-6 w-full max-w-5xl mx-auto justify-center mt-0">
          <DashboardButton
            color="bg-blue-500"
            hover="hover:bg-blue-600"
            icon="📚"
            label="Temas"
            to="/student_themes"
            className="flex-1 min-w-[260px]"
          />
          <DashboardButton
            color="bg-green-500"
            hover="hover:bg-green-600"
            icon="📒✏️"
            label="Actividades"
            to="/activities"
            className="flex-1 min-w-[260px]"
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
