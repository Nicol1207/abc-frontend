import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import AppLayout from "~/layouts/AppLayout";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { getSidebar, requireAuth, user } from "~/services/auth.server";
import { BookOpen } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth({ request });
  const u = await user({ request });
  const sidebar = await getSidebar({ request });
  return {
    user: {
      ...u.user,
      role: u.role,
    },
    sidebar: sidebar,
  };
}

export default function UserManual() {
  const loaderData = useLoaderData<any>();
  return (
    <AppLayout
      sidebarOptions={loaderData.sidebar}
      userData={loaderData.user}
    >
      <div className="w-full mx-auto py-8">
        <h1 className="text-3xl font-bold text-primary mb-4 flex flex-row items-center gap-5"> <BookOpen size={32} /> Manual de Usuario</h1>
        <Separator className="my-4 bg-[#004d5a]" />
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-2">Visualiza el manual directamente aquí:</h2>
            <div className="w-full h-[600px] border rounded overflow-hidden">
              <iframe
                src="/manual.pdf"
                title="Manual de Usuario"
                width="100%"
                height="100%"
                className="border-none"
                allow="fullscreen"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
