import { BookOpen, ChevronRight, Frame, House, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  return (
    <SidebarGroup >
      <Separator orientation="horizontal" className="mr-2 mb-2" />
      <SidebarMenu className="flex flex-col items-center space-y-4">
        <SidebarMenuButton asChild className="size-16 flex flex-col items-center justify-center">
          <a href="/" className="text-center">
            <House /> {/* Ajuste o tamanho do ícone conforme necessário */}
            <span>Início</span>
          </a>
        </SidebarMenuButton>
        <SidebarMenuButton asChild className="size-16 flex flex-col items-center justify-center">
          <a href="API's" className="text-center">
            <Frame />
            <span>API's</span>
          </a>
        </SidebarMenuButton>
        <SidebarMenuButton asChild className="size-16 flex flex-col items-center justify-center">
          <a href="/report" className="text-center">
            <BookOpen />
            <span>Relatório</span>
          </a>
        </SidebarMenuButton>
        <SidebarMenuButton asChild className="size-16 flex flex-col items-center justify-center">
          <a href="/notes" className="text-center">
            <BookOpen />
            <span>Notas</span>
          </a>
        </SidebarMenuButton>
        {/* {items.map((item) => (
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
        ))} */}
      </SidebarMenu>
    </SidebarGroup>
  )
}
