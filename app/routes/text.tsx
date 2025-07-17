import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import AppLayout from "~/layouts/AppLayout";
import { getSidebar, requireAuth, user } from "~/services/auth.server";
import { Separator } from "~/components/ui/separator";

export const meta: MetaFunction = () => {
  return [
    { title: "ABC Media" },
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
  return (
    <AppLayout
      sidebarOptions={loaderData.sidebar}
      userData={loaderData.user}
    >
      <div className="w-full max-w-6xl mx-auto py-8">
        <div className="flex flex-col mb-4">
          <h1 className="text-4xl font-bold text-primary">Textos</h1>
        </div>
          <Separator className="my-4 bg-[#004d5a]" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Tarjetas con animación de hover y fondos de colores */}
        <Card className="transition-transform duration-200 hover:scale-105 hover:shadow-lg bg-yellow-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xl font-medium">
              Tema # 1:
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Genera un reporte detallado de un evento específico.
            </div>
            <div className="flex justify-end mt-4">
              <Button
                asChild
                className="bg-yellow-200 text-yellow-900 font-bold hover:bg-yellow-300 border-2 border-yellow-500 shadow-none"
              >
                <Link to="/texts/1">Ver</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-transform duration-200 hover:scale-105 hover:shadow-lg bg-sky-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xl font-medium">
              Tema # 1:
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Genera un reporte detallado de un evento específico.
            </div>
            <div className="flex justify-end mt-4">
              <Button
                asChild
                className="bg-sky-200 text-sky-900 font-bold hover:bg-sky-300 border-2 border-sky-500 shadow-none"
              >
                <Link to="/texts/2">Ver</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-transform duration-200 hover:scale-105 hover:shadow-lg bg-rose-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xl font-medium">
              Tema # 1:
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Genera un reporte detallado de un evento específico.
            </div>
            <div className="flex justify-end mt-4">
              <Button
                asChild
                className="bg-rose-200 text-rose-900 font-bold hover:bg-rose-300 border-2 border-rose-500 shadow-none"
              >
                <Link to="/texts/3">Ver</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-transform duration-200 hover:scale-105 hover:shadow-lg bg-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xl font-medium">
              Tema # 1:
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Genera un reporte detallado de un evento específico.
            </div>
            <div className="flex justify-end mt-4">
              <Button
                asChild
                className="bg-green-200 text-green-900 font-bold hover:bg-green-300 border-2 border-green-500 shadow-none"
              >
                <Link to="/texts/4">Ver</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-transform duration-200 hover:scale-105 hover:shadow-lg bg-purple-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xl font-medium">
              Tema # 1:
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Genera un reporte detallado de un evento específico.
            </div>
            <div className="flex justify-end mt-4">
              <Button
                asChild
                className="bg-purple-200 text-purple-900 font-bold hover:bg-purple-300 border-2 border-purple-600 shadow-none"
              >
                <Link to="/texts/5">Ver</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-transform duration-200 hover:scale-105 hover:shadow-lg bg-orange-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xl font-medium">
              Tema # 1:
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Genera un reporte detallado de un evento específico.
            </div>
            <div className="flex justify-end mt-4">
              <Button
                asChild
                className="bg-orange-200 text-orange-900 font-bold hover:bg-orange-300 border-2 border-orange-500 shadow-none"
              >
                <Link to="/texts/6">Ver</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </AppLayout>
  );
}
