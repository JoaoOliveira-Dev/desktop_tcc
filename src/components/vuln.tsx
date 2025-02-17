import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { FaRegTrashAlt } from "react-icons/fa";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { vulnerabilidadesIniciais } from "../utils/vulns";
import { VulnType } from "../types/types";
import CVSSCalculator from "./cvsscalculator";

interface VulnProps {
  onAddOrUpdateVulnerability: (vulnerability: VulnType) => void;
  vulns: VulnType[];
  setVulns: React.Dispatch<React.SetStateAction<VulnType[]>>;
}

export default function Vuln({ onAddOrUpdateVulnerability, vulns, setVulns }: VulnProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [vulnerabilidades, setVulnerabilidades] = React.useState(
    vulnerabilidadesIniciais
  );

  // Estados para controlar as informações da vulnerabilidade selecionada
  const [nome, setNome] = React.useState("");
  const [descVuln, setDescVuln] = React.useState("");
  const [ativos, setAtivos] = React.useState("");
  const [referencia, setReferencia] = React.useState("");
  const [impacto, setImpacto] = React.useState("");
  const [reparo, setReparo] = React.useState("");
  const [poc, setPoc] = React.useState("");

  const [novaVuln, setNovaVuln] = React.useState("");

    // Função para lidar com os dados recebidos do CVSSCalculator
    const handleCVSSCalculation = (cvssData: {
      attackVector: string;
      attackComplexity: string;
      privilegesRequired: string;
      userInteraction: string;
      scope: string;
      confidentialityImpact: string;
      integrityImpact: string;
      availabilityImpact: string;
      score: number;
    }) => {
      const severity = getSeverityFromScore(cvssData.score);
      const vulnerability: VulnType = {
        id: crypto.randomUUID(),
        nome,
        descVuln,
        ativos,
        referencia,
        impacto,
        reparo,
        poc,
        severidade: severity,
        cvssData,
      };
      onAddOrUpdateVulnerability(vulnerability);
  
      // Limpa os campos após salvar
      setValue("")
      setNome("");
      setDescVuln("");
      setAtivos("");
      setReferencia("");
      setImpacto("");
      setReparo("");
      setPoc("");
    };
  
    // Função para determinar a severidade com base na pontuação CVSS
    const getSeverityFromScore = (score: number): string => {
      if (score >= 9.0) return "Critical";
      if (score >= 7.0) return "High";
      if (score >= 4.0) return "Medium";
      return "Low";
    };

  // Função para adicionar uma nova vulnerabilidade à lista
  const adicionarNovaVuln = () => {
    if (novaVuln.trim() !== "") {
      const novaVulnerabilidade = {
        value: novaVuln,
        label: novaVuln,
      };
      setVulnerabilidades([...vulnerabilidades, novaVulnerabilidade]);
      setValue(novaVuln);
      setNovaVuln("");
      setOpen(false);
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Vulnerabilidades</CardTitle>
        <CardDescription>
          Selecione ou crie novas vulnerabilidades encontradas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[300px] justify-between"
            >
              {value
                ? vulnerabilidades.find(
                    (vulnerabilidade) => vulnerabilidade.value === value
                  )?.label
                : "Lista de Vulns..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Procure a vulnerabilidade" />
              <CommandList>
                <CommandEmpty>
                  <div className="p-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      Nenhuma vulnerabilidade encontrada.
                    </p>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="text"
                        value={novaVuln}
                        onChange={(e) => setNovaVuln(e.target.value)}
                        placeholder="Digite uma nova vulnerabilidade"
                        className="flex-1 px-2 py-1 border rounded-md text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={adicionarNovaVuln}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {vulnerabilidades.map((vulnerabilidade) => (
                    <CommandItem
                      key={vulnerabilidade.value}
                      value={vulnerabilidade.value}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue);
                        setOpen(false);
                        setNome(vulnerabilidade.value);
                        setDescVuln(vulnerabilidade.desc || "");
                        setReferencia(vulnerabilidade.referencia || "");
                      }}
                    >
                      {vulnerabilidade.label}
                      <Check
                        className={cn(
                          "ml-auto",
                          value === vulnerabilidade.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {value && (
          <form className="grid w-full items-center gap-4 mt-5">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="link">Descrição da vulnerabilidade</Label>
              <Textarea
                id="link"
                placeholder="Anote a DESCRIÇÃO da vulnerabilidade"
                value={descVuln}
                onChange={(e) => setDescVuln(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="link">Ativo afetado</Label>
              <Textarea
                id="referencia"
                placeholder="Anote os ATIVOS da vulnerabilidade"
                value={ativos}
                onChange={(e) => setAtivos(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="link">Referência</Label>
              <Textarea
                id="referencia"
                placeholder="Anote as REFERÊNCIAS da vulnerabilidade"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="link">Impacto</Label>
              <Textarea
                id="impacto"
                placeholder="Anote os IMPACTOS da vulnerabilidade"
                value={impacto}
                onChange={(e) => setImpacto(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="link">Ação de reparo</Label>
              <Textarea
                id="reparo"
                placeholder="Anote as AÇÕES DE REPARO da vulnerabilidade"
                value={reparo}
                onChange={(e) => setReparo(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="link">Proof Of Concept</Label>
              <Textarea
                id="poc"
                placeholder="Anote as PROVAS DE CONCEITO da vulnerabilidade"
                value={poc}
                onChange={(e) => setPoc(e.target.value)}
              />
            </div>
            <CVSSCalculator onCalculate={handleCVSSCalculation} />
          </form>
        )}
        {/* Lista de Vulnerabilidades Adicionadas */}

        <Table className="mt-6">
          <TableHead className="w-[100px] text-center">#</TableHead>
          <TableHead>Vulnerabilidades</TableHead>
          <TableHead>Risco</TableHead>
          <TableBody>
            {vulns.length > 0 ? (
              vulns.map((vuln, index) => (
                <TableRow key={vuln.id}>
                  <TableCell className="text-center font-medium">
                    {String(index + 1).padStart(2, "0")}
                  </TableCell>
                  <TableCell>{vuln.nome}</TableCell>
                  <TableCell>{vuln.severidade}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      onClick={() => {
                        setVulns(vulns.filter((v) => v.id !== vuln.id));
                      }}
                      variant="destructive"
                      size="sm"
                      className="ml-7"
                    >
                      <FaRegTrashAlt />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center">
                  Nenhuma vulnerabilidade adicionada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </> 
  );
}
