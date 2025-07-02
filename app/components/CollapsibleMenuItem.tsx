// React Core Imports
import { useEffect, useState } from "react";

// Remix Core Imports
import { Link } from "@remix-run/react";

// App Imports
import { useSidebar } from "~/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";

// Icons Imports
import { ChevronDown } from "lucide-react";

export default function CollapsibleMenuItem({
  triggerText,
  triggerIcon,
  elements,
}: {
  triggerText: any;
  triggerIcon: any;
  elements: any;
}) {
  const { open } = useSidebar();
  const [collapsibleOpen, setCollapsibleOpen] = useState<boolean>(false);

  // Manual handle open state of collapsible
  // for usage with close with sidebar.
  const handleOpenChange = (): undefined => {
    setCollapsibleOpen(!collapsibleOpen);
  };

  // Close collapsible when sidebar was closed.
  useEffect(() => {
    if (!open) {
      setCollapsibleOpen(false);
    }
  }, [open]);

  return (
    <Collapsible
      disabled={!open} // Disable open function when sidebar is closed
      open={collapsibleOpen}
      onOpenChange={handleOpenChange}
      className="group/collapsible"
    >
      <SidebarMenu className="m-0">
        <CollapsibleTrigger>
          <SidebarMenuItem>
            <SidebarMenuButton>
              {triggerIcon} <span>{triggerText}</span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid grid-cols-12">
            <div className="ps-3">
              <Separator orientation="vertical" className="col-span-1" />
            </div>
            <div className="col-span-11">
              {elements.map((el: any) => (
                <Link to={el.href}>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      {el.icon} <span>{el.text}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </Link>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </SidebarMenu>
    </Collapsible>
  );
}
