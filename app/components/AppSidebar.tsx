// Remix Core Imports
import { Link, useLoaderData } from "@remix-run/react";
import { useFetcher } from "@remix-run/react";
import { SquareLibrary } from 'lucide-react';
import { Images } from 'lucide-react';
import { Video } from 'lucide-react';
import { BookA } from 'lucide-react';

// App Components Imports
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupContent,
} from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import CollapsibleMenuItem from "~/components/CollapsibleMenuItem.jsx";

// Icons Imports
import {
  LogOutIcon,
  UserCircleIcon,
  ChevronRight,
  UserPen,
  House,
  Text,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "~/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

const icons = [<UserPen />, <SquareLibrary />, <Images />,  <Video />, <BookA />, <House/>, <Text />];

export default function AppSidebar({
  sidebarOptions,
  userData,
}: {
  sidebarOptions: any;
  userData: any;
}) {
  const fetcher = useFetcher();
  const [loading, setLoading] = useState<any>(false);

  const handleLogout = () => {
    fetcher.submit(null, {
      method: "DELETE",
      action: "/api/logout",
    });
  };

  return loading ? (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton disabled className="flex h-12 gap-3 text-nowrap">
              <UserCircleIcon />
              <Skeleton className="w-full h-6" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <Separator />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton disabled className="text-nowrap">
                  <Skeleton className={"w-4 h-4 rounded-full"} />
                  <Skeleton className="w-full h-4" />
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton disabled className="text-nowrap">
                  <Skeleton className={"w-4 h-4 rounded-full"} />
                  <Skeleton className="w-full h-4" />
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton disabled className="text-nowrap">
                  <Skeleton className={"w-4 h-4 rounded-full"} />
                  <Skeleton className="w-full h-4" />
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton disabled className="text-nowrap">
                  <Skeleton className={"w-4 h-4 rounded-full"} />
                  <Skeleton className="w-full h-4" />
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton disabled className="text-nowrap">
                  <Skeleton className={"w-4 h-4 rounded-full"} />
                  <Skeleton className="w-full h-4" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  ) : (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader className="bg-[#008999] rounded-t-lg text-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="flex h-12 gap-3 text-nowrap">
              <img
                src="/image.png"
                alt="ABC English"
                className="h-12"
              />
              <div className="flex flex-col">
                <div className="flex h-full font-bold gap-2">ABC English</div>
                <div>Sistema Educativo</div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <Separator />
      </SidebarHeader>
      <SidebarContent className="bg-[#008999] text-white">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {JSON.parse(sidebarOptions).map((option: any) => {
                if (option.type === 1) {
                  return (
                    <SidebarMenuItem key={option.id}>
                      <Link to={option.route}>
                        <SidebarMenuButton className="text-nowrap flex relative">
                          {icons[option.icon]} <span>{option.label}</span>{" "}
                          <ChevronRight className="absolute right-2" />
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  );
                } else if (option.type === 2) {
                  return (
                    <CollapsibleMenuItem
                      key={option.id}
                      triggerText={option.label}
                      triggerIcon={icons[option.icon]}
                      elements={option.options.map((opt: any) => ({
                        icon: icons[opt.icon],
                        text: opt.label,
                        href: opt.route,
                      }))}
                    />
                  );
                }
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-[#008999] text-white rounded-b-lg">
        <Separator />
        {userData.role !== "Estudiante" ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton className="flex h-12 gap-3 text-nowrap w-full hover:text-black">
                    <UserCircleIcon />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{userData.name}</span>
                      <span className="text-xs font-light text-inherit">
                        {userData.role}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[var(--radix-popper-anchor-width)] w-full">
              <DropdownMenuItem asChild>
                <Button onClick={handleLogout} variant="ghost" className="w-full justify-start">
                  <LogOutIcon className="rotate-180" />
                  Cerrar Sesión
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={handleLogout} variant="ghost" className="w-full justify-start mt-2">
            <LogOutIcon className="rotate-180" />
            Cerrar Sesión
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
