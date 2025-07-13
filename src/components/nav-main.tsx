import {
  BookOpen,
  ChevronRight,
  Frame,
  NotebookPen,
  Network,
  Plus,
  Home,
} from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { useState } from "react";

// Tipagem do projeto
type Project = {
  id: number;
  name: string;
};

export function NavMain() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectName, setProjectName] = useState("");

  const handleCreateProject = () => {
    if (!projectName.trim()) return;

    const newProject: Project = {
      id: Date.now(), // ID único baseado em timestamp
      name: projectName.trim(),
    };

    setProjects((prev) => [...prev, newProject]);
    setProjectName(""); // limpar campo
  };

  return (
    <SidebarGroup>
      <Separator orientation="horizontal" className="mr-2 mb-2" />
      <SidebarMenu>
        <SidebarMenuButton asChild>
          <a href="/" className="flex items-center">
            <Home size={18} className="mr-2" />
            <span>Home</span>
          </a>
        </SidebarMenuButton>
        <SidebarGroupLabel>Projetos</SidebarGroupLabel>
        {/* Botão de criação de projeto */}
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Criar novo projeto">
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center w-full text-left">
                  <Plus className="mr-2" />
                  <span>Novo Projeto</span>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    Criar novo projeto
                  </DialogTitle>
                  <DialogDescription>
                    Adicione um nome para o seu projeto.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-2">
                  <div className="grid flex-1 gap-2">
                    <Label htmlFor="projeto" className="sr-only">
                      Projeto
                    </Label>
                    <Input
                      id="projeto"
                      placeholder="Ex: Invasão Rede X"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="text-white"
                    />
                  </div>
                </div>
                <DialogFooter className="sm:justify-start">
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCreateProject}
                    >
                      Salvar
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/* Listar projetos criados */}
        {projects.map((project) => (
          <Collapsible
            key={project.id}
            asChild
            defaultOpen={false}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={project.name}>
                  <Frame size={18} className="mr-2" />
                  <span>{project.name}</span>
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <a href={`/report`}>
                        <BookOpen size={16} className="mr-2" />
                        Relatórios
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>

                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <a href={`/api`}>
                        <Network size={16} className="mr-2" />
                        Testes de API
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>

                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <a href={`/projects/${project.id}/notes`}>
                        <NotebookPen size={16} className="mr-2" />
                        Notas
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
