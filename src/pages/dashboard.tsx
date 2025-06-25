import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  NotebookPen,
  FileText,
  Network,
  FolderSearch,
} from "lucide-react";

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6 w-full text-white">
      {/* Cabeçalho da Home */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Painel do Pentester</h1>
        <Button variant="default" className="flex gap-2">
          <Plus size={18} />
          Novo Projeto
        </Button>
      </div>

      {/* Cards de atalhos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderSearch size={20} />
              Meus Projetos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Acesse todos os projetos criados e continue sua investigação.
            </p>
            <Button variant="secondary" className="mt-4 w-full">
              Ver Projetos
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <NotebookPen size={20} />
              Anotações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Revise ou edite as últimas anotações feitas durante seus testes.
            </p>
            <Button variant="secondary" className="mt-4 w-full">
              Acessar Notas
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              Relatórios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Exporte relatórios profissionais baseados em seus achados.
            </p>
            <Button variant="secondary" className="mt-4 w-full">
              Criar Relatório
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network size={20} />
              Testes de API
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Envie requisições e registre falhas diretamente na plataforma.
            </p>
            <Button variant="secondary" className="mt-4 w-full">
              Testar API
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
