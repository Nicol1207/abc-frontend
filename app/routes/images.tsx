// app/routes/images.tsx
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import AppLayout from "~/layouts/AppLayout";
import { getSidebar, requireAuth, user } from "~/services/auth.server";
import { Separator } from "~/components/ui/separator";
import { getThemes } from "~/services/loaders/student.server"; // Make sure this path is correct

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
  const themesData = await getThemes({ request }); // Renamed to avoid conflict

  // Access the 'themes' array from the data returned by getThemes
  const themes = themesData.themes || [];

  console.log("Themes loaded:", themes); // Log the actual themes array

  return {
    user: {
      ...u.user,
      role: u.rol, // Corrected from u.role to u.rol based on other files
    },
    sidebar: sidebar,
    themes: themes, // Pass the themes array to the component
  };
}

export default function Index() {
  const loaderData = useLoaderData<typeof loader>(); // Use typeof loader for better type inference
  const themes = loaderData.themes; // Get the themes array

  // Define an array of Tailwind background and text color pairs
  // This will be used to cycle through different colors for each card
  const cardColors = [
    { bg: "bg-blue-100", text: "text-blue-900", border: "border-blue-500", hoverBg: "hover:bg-blue-200" },
    { bg: "bg-green-100", text: "text-green-900", border: "border-green-500", hoverBg: "hover:bg-green-200" },
    { bg: "bg-purple-100", text: "text-purple-900", border: "border-purple-500", hoverBg: "hover:bg-purple-200" },
    { bg: "bg-orange-100", text: "text-orange-900", border: "border-orange-500", hoverBg: "hover:bg-orange-200" },
    { bg: "bg-red-100", text: "text-red-900", border: "border-red-500", hoverBg: "hover:bg-red-200" },
    { bg: "bg-yellow-100", text: "text-yellow-900", border: "border-yellow-500", hoverBg: "hover:bg-yellow-200" },
  ];

  return (
    <AppLayout
      sidebarOptions={loaderData.sidebar}
      userData={loaderData.user}
    >
      <div className="w-full max-w-6xl mx-auto py-8">
        <div className="flex flex-col mb-4">
          <h1 className="text-4xl font-bold text-primary">Temas</h1>
          <Separator className="my-4 bg-[#004d5a]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 text-lg">No hay temas disponibles en este momento.</p>
          ) : (
            themes.map((theme: any, index: number) => {
              const colors = cardColors[index % cardColors.length]; // Cycle through colors
              return (
                <Card
                  key={theme.id_temas} // Use unique ID from theme
                  className={`transition-transform duration-200 hover:scale-105 hover:shadow-lg ${colors.bg} border-2 ${colors.border}`}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className={`text-xl font-medium ${colors.text}`}>
                      Tema #{theme.numero}: {theme.titulo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {theme.descripcion}
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button
                        asChild
                        className={`${colors.bg.replace('100', '200')} ${colors.text} font-bold ${colors.hoverBg} border-2 ${colors.border} shadow-none`}
                      >
                        {/* Link to the specific theme's content. Assuming '/temas' is the route for contents of a theme */}
                        <Link to={`/temas/${theme.id_temas}`}>Ver Contenido</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}