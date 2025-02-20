import * as React from "react";
import { Moon, Sun } from "lucide-react";

import { SidebarMenu, SidebarMenuButton } from "@/components/ui/sidebar";

export function ThemeSwitcher() {
  const [isDarkMode, setIsDarkMode] = React.useState(true);

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
      <SidebarMenuButton
        size="lg"
        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-transparent cursor-default data-[active=true]:bg-transparent w-fit aspect-square flex justify-center"
        onClick={toggleTheme}
      >
        {isDarkMode ? <Moon className="" /> : <Sun className="" />}
      </SidebarMenuButton>
    </SidebarMenu>
  );
}
