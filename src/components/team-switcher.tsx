import * as React from "react"
import { Moon, Sun } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "./ui/button"

export function ThemeSwitcher() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  // Função para alternar o tema
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className=" aspect-square size-10 items-center justify-center ">
              <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
        >
          {isDarkMode ? (
            <Moon className="" />
          ) : (
            <Sun className="" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
              </div>   
            </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
