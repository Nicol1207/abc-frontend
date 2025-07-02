import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import AppLayout from "~/layouts/AppLayout";
import { useEffect, useState } from "react";
import { getSidebar, requireAdmin, requireAuth, user } from "~/services/auth.server";
import { Separator } from "~/components/ui/separator";

export const meta: MetaFunction = () => {
  return [
    { title: "ABC English" },
    { name: "description", content: "Sistema educativo de inglés" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth({ request });
  await requireAdmin({ request });

  const u = await user({request});
  const sidebar = await getSidebar({request});

  console.log(u)

  return {
    user: {
      ...u.user,
      role: u.role,
    },
    sidebar: sidebar,
  };
}

export default function Index() {
  const loaderData = useLoaderData<any>();

  // Simulación de datos (reemplaza por datos reales del backend)
  const topIngresos = [
    { nombre: "Juan Pérez", ingresos: 42 },
    { nombre: "Ana Gómez", ingresos: 39 },
    { nombre: "Luis Torres", ingresos: 35 },
  ];
  const topRecompensas = [
    { nombre: "Ana Gómez", recompensas: 15 },
    { nombre: "Juan Pérez", recompensas: 12 },
    { nombre: "María Ruiz", recompensas: 10 },
  ];
  const materiasPopulares = [
    { materia: "Inglés", abiertos: 120 },
    { materia: "Matemáticas", abiertos: 98 },
    { materia: "Ciencias", abiertos: 87 },
  ];

  // Animación simple de conteo
  function AnimatedNumber({ value }: { value: number }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
      let start = 0;
      const end = value;
      if (start === end) return;
      let increment = end > start ? 1 : -1;
      let stepTime = Math.abs(Math.floor(1000 / (end - start)));
      const timer = setInterval(() => {
        start += increment;
        setDisplay(start);
        if (start === end) clearInterval(timer);
      }, stepTime > 40 ? stepTime : 40);
      return () => clearInterval(timer);
    }, [value]);
    return <span className="font-bold text-lg transition-all duration-500">{display}</span>;
  }

  // Tarjeta animada
  function Card({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 hover:scale-105 transition-transform duration-300 border border-[#e0f7fa] ${className}`}>
        {children}
      </div>
    );
  }

  // Barra de progreso animada
  function ProgressBar({ value, max }: { value: number; max: number }) {
    const percent = Math.round((value / max) * 100);
    return (
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div
          className="bg-[#008999] h-3 rounded-full transition-all duration-700"
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    );
  }

  return (
    <AppLayout
      sidebarOptions={loaderData.sidebar}
      userData={loaderData.user}
    >
      <div className="w-full max-w-6xl mx-auto py-8">
        <div className="flex flex-col mb-4">
          <h1 className="text-4xl font-bold text-primary">Inicio</h1>
          <Separator className="my-4 bg-[#004d5a]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Estudiantes que más ingresan */}
          <Card>
            <h2 className="text-xl font-bold mb-4 text-[#008999] flex items-center gap-2">
              <span className="animate-bounce"></span> Estudiantes que más ingresan
            </h2>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-2">Nombre</th>
                  <th className="text-left py-2">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {topIngresos.map((est, idx) => (
                  <tr key={idx} className="hover:bg-[#e0f7fa] transition">
                    <td className="py-1">{est.nombre}</td>
                    <td className="py-1">
                      <AnimatedNumber value={est.ingresos} />
                      <ProgressBar value={est.ingresos} max={topIngresos[0].ingresos} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          {/* Estudiantes con más recompensas */}
          <Card>
            <h2 className="text-xl font-bold mb-4 text-[#008999] flex items-center gap-2">
              <span className="animate-bounce"></span> Estudiantes con más recompensas
            </h2>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-2">Nombre</th>
                  <th className="text-left py-2">Recompensas</th>
                </tr>
              </thead>
              <tbody>
                {topRecompensas.map((est, idx) => (
                  <tr key={idx} className="hover:bg-[#e0f7fa] transition">
                    <td className="py-1">{est.nombre}</td>
                    <td className="py-1">
                      <AnimatedNumber value={est.recompensas} />
                      <ProgressBar value={est.recompensas} max={topRecompensas[0].recompensas} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          {/* Materias más abiertas */}
          <Card>
            <h2 className="text-xl font-bold mb-4 text-[#008999] flex items-center gap-2">
              <span className="animate-bounce"></span> Materias más abiertas
            </h2>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-2">Materia</th>
                  <th className="text-left py-2">Veces abiertas</th>
                </tr>
              </thead>
              <tbody>
                {materiasPopulares.map((mat, idx) => (
                  <tr key={idx} className="hover:bg-[#e0f7fa] transition">
                    <td className="py-1">{mat.materia}</td>
                    <td className="py-1">
                      <AnimatedNumber value={mat.abiertos} />
                      <ProgressBar value={mat.abiertos} max={materiasPopulares[0].abiertos} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
      <style>
        {`
          .animate-fade-in {
            animation: fadeIn 1s;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px);}
            to { opacity: 1; transform: translateY(0);}
          }
        `}
      </style>
    </AppLayout>
  );
}
