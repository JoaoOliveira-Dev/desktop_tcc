import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { SidebarMenu, SidebarMenuButton } from "@/components/ui/sidebar";

export function ThemeSwitcher() {
  // Estado para controlar o modo escuro
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

  // Definir o tema padrão como dark ao montar o componente
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <SidebarMenu>
      <SidebarMenuButton
        size="lg"
        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-transparent cursor-default data-[active=true]:bg-transparent w-fit aspect-square flex justify-center"
        onClick={toggleTheme}
      >
        {isDarkMode ? (
          <Moon className="cursor-pointer" />
        ) : (
          <Sun className="cursor-pointer" />
        )}
      </SidebarMenuButton>
    </SidebarMenu>
  );
}
