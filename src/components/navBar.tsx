import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Moon, Sun } from "lucide-react";

export function NavBar() {
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
    <div className="flex justify-between items-center p-4 bg-background text-foreground">
      {/* Logo e Links de Navegação */}
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Home</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink asChild>
                {/* <Link href="/">Home</Link> */}
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>About</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink asChild>
                {/* <Link href="/about">About</Link> */}
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Botão de Alternância de Tema */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
      >
        {isDarkMode ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  );
}