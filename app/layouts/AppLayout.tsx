// Remix Core Imports
import { MetaFunction, Link } from "@remix-run/react";

// App Components Imports
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import AppSidebar from "~/components/AppSidebar";
import { Separator } from "~/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Toaster } from "~/components/ui/toaster";

// Layout Metadata
export const meta: MetaFunction = () => {
  return [
    { title: "2G Producciones" },
    { name: "description", content: "Sistema de Gestión 2G Producciones" },
  ];
};

export default function AppLayout({
  children,
  sidebarOptions,
  userData,
}: {
  children: React.ReactNode;
  sidebarOptions: any;
  userData: any;
}) {
  return (
    <SidebarProvider>
      <AppSidebar sidebarOptions={sidebarOptions} userData={userData} />
      <div className="flex flex-col w-full h-screen p-2">
        <main className="w-full h-full overflow-y-auto p-5 gap-4 bg-gradient-to-br from-[#e0f7fa] via-[#b2dfdb] to-[#fffde7] bg-center rounded">
          <div>{children}</div>
          <Toaster />
        </main>
      </div>
    </SidebarProvider>
  );
}
