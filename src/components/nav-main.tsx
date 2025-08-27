import {
  BookOpen,
  ChevronRight,
  Frame,
  NotebookPen,
  Network,
  Plus,
  Home,
  Trash2,
  BadgeIcon,
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

import { useEffect, useState } from "react";

// Tipagem do projeto
type Project = {
  id: number;
  name: string;
};

export function NavMain() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    window.electron.getProjects().then(setProjects);
  }, []);

  const handleCreateProject = async () => {
    if (!projectName.trim()) return; // Não salva se o nome estiver vazio

    const newProject: Project = {
      id: Date.now(), // Gera um ID único baseado no tempo atual
      name: projectName.trim(),
    };

    // Chama a função do backend via preload
    const updatedProjects = await window.electron.saveProject(newProject);

    // Atualiza o estado do frontend com a lista retornada pelo backend
    setProjects(updatedProjects);

    // Limpa o campo de input e fecha o dialog
    setProjectName("");
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
                  {/* Botão Editar */}
                  <SidebarMenuSubItem>
                    <Dialog>
                      <DialogTrigger asChild>
                        <SidebarMenuSubButton><BadgeIcon size={16}/> Editar</SidebarMenuSubButton>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md text-white">
                        <DialogHeader>
                          <DialogTitle>Editar projeto</DialogTitle>
                        </DialogHeader>
                        <Input
                          defaultValue={project.name}
                          onChange={(e) =>
                            setProjects((prev) =>
                              prev.map((p) =>
                                p.id === project.id
                                  ? { ...p, name: e.target.value }
                                  : p
                              )
                            )
                          }
                          className="text-white"
                        />
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button
                              onClick={async () => {
                                const updatedProjects =
                                  await window.electron.editProject(
                                    project.id,
                                    {
                                      name: projects.find(
                                        (p) => p.id === project.id
                                      )?.name,
                                    }
                                  );
                                setProjects(updatedProjects);
                              }}
                            >
                              Salvar
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </SidebarMenuSubItem>

                  {/* Botão Deletar */}
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      onClick={async () => {
                        const updatedProjects =
                          await window.electron.deleteProject(project.id);
                        setProjects(updatedProjects);
                      }}
                    >
                      <Trash2 size={16}/> Deletar
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>

                  {/* Links do projeto */}
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
                      <a href={`/api/${project.id}`}>
                        <Network size={16} className="mr-2" />
                        Testes de API
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>

                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <a href={`/notes/${project.id}`}>
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
