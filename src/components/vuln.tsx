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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  vulnerabilidadesIniciais,
  type VulnerabilityPreset,
} from "../utils/vulns";
import { VulnType } from "../types/types";
import CVSSCalculator from "./cvsscalculator";
import RichTextEditor from "./richTextEditor";

interface VulnProps {
  onAddOrUpdateVulnerability: (vulnerability: VulnType) => void;
  vulns: VulnType[];
  setVulns: React.Dispatch<React.SetStateAction<VulnType[]>>;
}

export default function Vuln({ onAddOrUpdateVulnerability, vulns, setVulns }: VulnProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [vulnerabilidades, setVulnerabilidades] = React.useState(
    vulnerabilidadesIniciais
  );

  // Estados para controlar as informações da vulnerabilidade selecionada
  const [nome, setNome] = React.useState("");
  const [titulo, setTitulo] = React.useState("");
  const [categoria, setCategoria] = React.useState("");
  const [subcategoria, setSubcategoria] = React.useState("");
  const [owasp, setOwasp] = React.useState("");
  const [cwe, setCwe] = React.useState("");
  const [descVuln, setDescVuln] = React.useState("");
  const [ativos, setAtivos] = React.useState("");
  const [referencia, setReferencia] = React.useState("");
  const [impacto, setImpacto] = React.useState("");
  const [reparo, setReparo] = React.useState("");
  const [poc, setPoc] = React.useState("");
  const [pocLegenda, setPocLegenda] = React.useState("");
  const [retestStatus, setRetestStatus] = React.useState("");
  const [retestDescricao, setRetestDescricao] = React.useState("");
  const [currentCvssData, setCurrentCvssData] =
    React.useState<VulnType["cvssData"]>(undefined);
  const [currentSeverity, setCurrentSeverity] = React.useState("");

  const [novaVuln, setNovaVuln] = React.useState("");

  function clearForm() {
    setEditingId(null);
    setValue("");
    setNome("");
    setTitulo("");
    setCategoria("");
    setSubcategoria("");
    setOwasp("");
    setCwe("");
    setDescVuln("");
    setAtivos("");
    setReferencia("");
    setImpacto("");
    setReparo("");
    setPoc("");
    setPocLegenda("");
    setRetestStatus("");
    setRetestDescricao("");
    setCurrentCvssData(undefined);
    setCurrentSeverity("");
  }

  function saveVulnerability(cvssData?: VulnType["cvssData"]) {
    if (!nome.trim()) {
      alert("Selecione ou crie uma vulnerabilidade antes de salvar.");
      return;
    }

    const selectedCvssData = cvssData ?? currentCvssData;

    if (!selectedCvssData) {
      alert("Calcule o CVSS antes de salvar esta vulnerabilidade.");
      return;
    }

    const severity = getSeverityFromScore(selectedCvssData.score);
    const vulnerability: VulnType = {
      id: editingId ?? crypto.randomUUID(),
      nome,
      titulo: titulo.trim() || nome,
      categoria,
      subcategoria,
      owasp,
      cwe,
      descVuln,
      ativos,
      referencia,
      impacto,
      reparo,
      poc,
      pocLegenda,
      retestStatus,
      retestDescricao,
      severidade: severity,
      cvssData: selectedCvssData,
    };

    onAddOrUpdateVulnerability(vulnerability);
    clearForm();
  }

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
    setCurrentCvssData(cvssData);
    setCurrentSeverity(getSeverityFromScore(cvssData.score));
    saveVulnerability(cvssData);
  };

  // Função para determinar a severidade com base na pontuação CVSS
  const getSeverityFromScore = (score: number): string => {
    if (score <= 0) return "Info";
    if (score >= 9.0) return "Critical";
    if (score >= 7.0) return "High";
    if (score >= 4.0) return "Medium";
    return "Low";
  };

  function selectTemplateVulnerability(
    vulnerability: VulnerabilityPreset,
    currentValue: string
  ) {
    const nextValue = currentValue === value ? "" : currentValue;

    setEditingId(null);
    setValue(nextValue);
    setOpen(false);
    setNome(nextValue ? vulnerability.value : "");
    setTitulo(nextValue ? vulnerability.titulo || vulnerability.value : "");
    setCategoria(nextValue ? vulnerability.categoria || "" : "");
    setSubcategoria(nextValue ? vulnerability.subcategoria || "" : "");
    setOwasp(nextValue ? vulnerability.owasp || "" : "");
    setCwe(nextValue ? vulnerability.cwe || "" : "");
    setDescVuln(nextValue ? vulnerability.desc || "" : "");
    setReferencia(nextValue ? vulnerability.referencia || "" : "");
    setAtivos("");
    setImpacto(nextValue ? vulnerability.impacto || "" : "");
    setReparo(nextValue ? vulnerability.reparo || "" : "");
    setPoc(nextValue ? vulnerability.poc || "" : "");
    setPocLegenda(nextValue ? vulnerability.pocLegenda || "" : "");
    setRetestStatus(nextValue ? vulnerability.retestStatus || "" : "");
    setRetestDescricao(nextValue ? vulnerability.retestDescricao || "" : "");
    setCurrentCvssData(nextValue ? vulnerability.cvssData : undefined);
    setCurrentSeverity(
      nextValue && vulnerability.cvssData
        ? getSeverityFromScore(vulnerability.cvssData.score)
        : ""
    );
  }

  function editVulnerability(vulnerability: VulnType) {
    if (
      !vulnerabilidades.some((item) => item.value === vulnerability.nome)
    ) {
      setVulnerabilidades((prev) => [
        ...prev,
        { value: vulnerability.nome, label: vulnerability.nome },
      ]);
    }

    setEditingId(vulnerability.id);
    setValue(vulnerability.nome);
    setNome(vulnerability.nome);
    setTitulo(vulnerability.titulo || vulnerability.nome);
    setCategoria(vulnerability.categoria || "");
    setSubcategoria(vulnerability.subcategoria || "");
    setOwasp(vulnerability.owasp || "");
    setCwe(vulnerability.cwe || "");
    setDescVuln(vulnerability.descVuln);
    setAtivos(vulnerability.ativos);
    setReferencia(vulnerability.referencia);
    setImpacto(vulnerability.impacto);
    setReparo(vulnerability.reparo);
    setPoc(vulnerability.poc);
    setPocLegenda(vulnerability.pocLegenda || "");
    setRetestStatus(vulnerability.retestStatus || "");
    setRetestDescricao(vulnerability.retestDescricao || "");
    setCurrentCvssData(vulnerability.cvssData);
    setCurrentSeverity(vulnerability.severidade);
  }

  // Função para adicionar uma nova vulnerabilidade à lista
  const adicionarNovaVuln = () => {
    if (novaVuln.trim() !== "") {
      const novaVulnerabilidade = {
        value: novaVuln,
        label: novaVuln,
      };
      setVulnerabilidades([...vulnerabilidades, novaVulnerabilidade]);
      setValue(novaVuln);
      setNome(novaVuln);
      setTitulo(novaVuln);
      setCategoria("");
      setSubcategoria("");
      setOwasp("");
      setCwe("");
      setDescVuln("");
      setAtivos("");
      setReferencia("");
      setImpacto("");
      setReparo("");
      setPoc("");
      setPocLegenda("");
      setRetestStatus("");
      setRetestDescricao("");
      setCurrentCvssData(undefined);
      setCurrentSeverity("");
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
                        selectTemplateVulnerability(
                          vulnerabilidade,
                          currentValue
                        );
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
            {editingId && (
              <div className="rounded-md border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-300">
                Editando vulnerabilidade adicionada. Clique em salvar para
                atualizar a linha selecionada.
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="vuln-title">Título no relatório</Label>
                <Input
                  id="vuln-title"
                  value={titulo}
                  onChange={(event) => setTitulo(event.target.value)}
                  placeholder="Ex: Aplicação suscetível a XSS no parâmetro nome"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="vuln-category">Categoria</Label>
                <Input
                  id="vuln-category"
                  value={categoria}
                  onChange={(event) => setCategoria(event.target.value)}
                  placeholder="Ex: A03: Injection"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="vuln-subcategory">Subcategoria</Label>
                <Input
                  id="vuln-subcategory"
                  value={subcategoria}
                  onChange={(event) => setSubcategoria(event.target.value)}
                  placeholder="Ex: Reflected XSS"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="vuln-owasp">OWASP</Label>
                <Input
                  id="vuln-owasp"
                  value={owasp}
                  onChange={(event) => setOwasp(event.target.value)}
                  placeholder="Ex: OWASP Top 10 2021 - A01"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="vuln-cwe">CWE</Label>
                <Input
                  id="vuln-cwe"
                  value={cwe}
                  onChange={(event) => setCwe(event.target.value)}
                  placeholder="Ex: CWE-79"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="vuln-description">Descrição da vulnerabilidade</Label>
              <RichTextEditor
                placeholder="Anote a DESCRIÇÃO da vulnerabilidade"
                value={descVuln}
                onChange={setDescVuln}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="vuln-assets">Ativo afetado</Label>
              <RichTextEditor
                placeholder="Anote os ATIVOS da vulnerabilidade"
                value={ativos}
                onChange={setAtivos}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="vuln-reference">Referência</Label>
              <RichTextEditor
                placeholder="Anote as REFERÊNCIAS da vulnerabilidade"
                value={referencia}
                onChange={setReferencia}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="vuln-impact">Impacto</Label>
              <RichTextEditor
                placeholder="Anote os IMPACTOS da vulnerabilidade"
                value={impacto}
                onChange={setImpacto}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="vuln-remediation">Mitigação / Ação de reparo</Label>
              <RichTextEditor
                placeholder="Anote as AÇÕES DE REPARO da vulnerabilidade"
                value={reparo}
                onChange={setReparo}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="vuln-poc">Proof Of Concept</Label>
              <RichTextEditor
                placeholder="Anote as PROVAS DE CONCEITO da vulnerabilidade"
                value={poc}
                onChange={setPoc}
                minHeight="min-h-[220px]"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="vuln-poc-caption">Legenda da PoC</Label>
              <Input
                id="vuln-poc-caption"
                value={pocLegenda}
                onChange={(event) => setPocLegenda(event.target.value)}
                placeholder="Ex: Figura: Evidência da exploração no parâmetro nome"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-[240px_1fr]">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="vuln-retest-status">Status do re-test</Label>
                <Select value={retestStatus} onValueChange={setRetestStatus}>
                  <SelectTrigger id="vuln-retest-status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Não validado">Não validado</SelectItem>
                    <SelectItem value="Não corrigido">Não corrigido</SelectItem>
                    <SelectItem value="Corrigido parcialmente">
                      Corrigido parcialmente
                    </SelectItem>
                    <SelectItem value="Corrigido">Corrigido</SelectItem>
                    <SelectItem value="Não aplicável">Não aplicável</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="vuln-retest-description">
                  Descrição do re-test
                </Label>
                <RichTextEditor
                  placeholder="Anote o resultado do RE-TEST da vulnerabilidade"
                  value={retestDescricao}
                  onChange={setRetestDescricao}
                  minHeight="min-h-[120px]"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                onClick={() => saveVulnerability()}
                disabled={!currentCvssData}
              >
                {editingId ? "Salvar alterações" : "Salvar vulnerabilidade"}
              </Button>
              <Button type="button" variant="outline" onClick={clearForm}>
                Cancelar
              </Button>
              {currentSeverity && (
                <span className="text-sm text-muted-foreground">
                  Risco atual: {currentSeverity}
                </span>
              )}
            </div>
            <CVSSCalculator
              initialValue={currentCvssData}
              onCalculate={handleCVSSCalculation}
            />
          </form>
        )}
        {/* Lista de Vulnerabilidades Adicionadas */}

        <Table className="mt-6">
          <TableHead className="w-[100px] text-center">#</TableHead>
          <TableHead>Título no relatório</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Risco</TableHead>
          <TableBody>
            {vulns.length > 0 ? (
              vulns.map((vuln, index) => (
                <TableRow
                  key={vuln.id}
                  className="cursor-pointer"
                  onClick={() => editVulnerability(vuln)}
                >
                  <TableCell className="text-center font-medium">
                    {String(index + 1).padStart(2, "0")}
                  </TableCell>
                  <TableCell>{vuln.titulo || vuln.nome}</TableCell>
                  <TableCell>{vuln.nome}</TableCell>
                  <TableCell>{vuln.severidade}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      onClick={(event) => {
                        event.stopPropagation();
                        setVulns(vulns.filter((v) => v.id !== vuln.id));
                        if (editingId === vuln.id) clearForm();
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
                <TableCell colSpan={5} className="text-center">
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
