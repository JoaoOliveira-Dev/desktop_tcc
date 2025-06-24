import {
  BookOpen,
  ChevronRight,
  Frame,
  House,
  type LucideIcon,
} from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  return (
    <SidebarGroup>
      <Separator orientation="horizontal" className="mr-2 mb-2" />
      <SidebarMenu>
        {/* <SidebarMenuButton
          asChild
          className="size-16 flex flex-col items-center justify-center"
        >
          <a href="/" className="text-center">
            <span>Início</span>
          </a>
        </SidebarMenuButton>
        <SidebarMenuButton
          asChild
          className="size-16 flex flex-col items-center justify-center"
        >
          <a href="/api" className="text-center">
            <Frame />
            <span>API's</span>
          </a>
        </SidebarMenuButton>
        <SidebarMenuButton
          asChild
          className="size-16 flex flex-col items-center justify-center"
        >
          <a href="/report" className="text-center">
            <BookOpen />
            <span>Relatório</span>
          </a>
        </SidebarMenuButton>
        <SidebarMenuButton
          asChild
          className="size-16 flex flex-col items-center justify-center"
        >
          <a href="/notes" className="text-center">
            <BookOpen />
            <span>Notas</span>
          </a>
        </SidebarMenuButton> */}
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <a href={subItem.url}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
