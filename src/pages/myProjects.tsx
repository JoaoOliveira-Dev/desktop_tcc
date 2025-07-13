import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, ArrowRight, ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router";

type Project = {
  id: number;
  name: string;
};

const MeusProjetos = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const mockProjects: Project[] = [
      { id: 1, name: "Avaliação Web - Empresa X" },
      { id: 2, name: "Infraestrutura Interna" },
      { id: 3, name: "API REST - Cliente Y" },
    ];
    setProjects(mockProjects);
  }, []);

  return (
    <div className="p-6 space-y-6 text-white">
      {/* TOPO COM BOTÃO DE VOLTAR */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Voltar
          </Button>
        </div>
        <h1 className="text-2xl font-bold">Meus Projetos</h1>

        <Button variant="default">
          <Plus size={18} />
          Novo Projeto
        </Button>
      </div>

      {/* RESTANTE DA TELA */}
      {projects.length === 0 ? (
        <div className="text-muted-foreground text-sm mt-4">
          Nenhum projeto criado ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen size={20} />
                  {project.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-end">
                <Button variant="secondary">
                  Abrir <ArrowRight className="ml-2" size={16} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeusProjetos;
