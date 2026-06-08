import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Scope from "../components/scope";
import Vuln from "../components/vuln";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Alvo, VulnType } from "../types/types";
import { cn } from "@/lib/utils";
import { fillReportTemplate } from "@/lib/pdfProcessor";
import { createReportDataFromManualInput } from "@/lib/reportData";
import {
  getReportTemplate,
  reportTemplates,
  type ReportTemplateId,
} from "@/lib/reportTemplates";
import { downloadHtmlFile, downloadPdfFromHtml } from "@/lib/htmlReport";

export default function Report() {
  const { projectId } = useParams();
  const [alvos, setAlvos] = useState<Alvo[]>([]);
  const [vulns, setVulns] = useState<VulnType[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<ReportTemplateId>("rafa");
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [templateError, setTemplateError] = useState("");
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!projectId) return;

    window.electron?.getProjects?.().then((projects) => {
      const project = projects.find((item) => item.id === Number(projectId));
      setProjectName(project?.name ?? "");
    });
  }, [projectId]);

  if (!isClient) {
    return null;
  }

  // Função para adicionar ou atualizar vulnerabilidades
  const handleAddOrUpdateVulnerability = (vulnerability: VulnType) => {
    const existingIndex = vulns.findIndex((v) => v.id === vulnerability.id);
    if (existingIndex !== -1) {
      // Atualiza a vulnerabilidade existente
      const updatedVulns = [...vulns];
      updatedVulns[existingIndex] = vulnerability;
      setVulns(updatedVulns);
    } else {
      // Adiciona uma nova vulnerabilidade
      setVulns([...vulns, vulnerability]);
    }
  };

  const buildTemplateHtml = async () => {
    const selectedTemplate = getReportTemplate(selectedTemplateId);
    const response = await fetch(selectedTemplate.path);

    if (!response.ok) {
      throw new Error(
        `Erro ao carregar template: ${response.status} ${response.statusText}`
      );
    }

    const reportData = createReportDataFromManualInput(
      alvos,
      vulns,
      projectName
    );
    const templateHtml = await response.text();
    return fillReportTemplate(templateHtml, reportData);
  };

  const handleGeneratePreview = async () => {
    try {
      setTemplateError("");
      setIsGeneratingTemplate(true);
      setGeneratedHtml(await buildTemplateHtml());
    } catch (error) {
      setTemplateError(
        error instanceof Error
          ? error.message
          : "Erro ao gerar a prévia do relatório."
      );
    } finally {
      setIsGeneratingTemplate(false);
    }
  };

  const handleDownloadHtml = async () => {
    try {
      setTemplateError("");
      setIsGeneratingTemplate(true);
      const html = await buildTemplateHtml();
      setGeneratedHtml(html);
      downloadHtmlFile(html, "relatorio-pentest.html");
    } catch (error) {
      setTemplateError(
        error instanceof Error ? error.message : "Erro ao baixar HTML."
      );
    } finally {
      setIsGeneratingTemplate(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setTemplateError("");
      setIsGeneratingTemplate(true);
      const html = await buildTemplateHtml();
      setGeneratedHtml(html);
      await downloadPdfFromHtml(html, "relatorio-pentest.pdf");
    } catch (error) {
      setTemplateError(
        error instanceof Error ? error.message : "Erro ao baixar PDF."
      );
    } finally {
      setIsGeneratingTemplate(false);
    }
  };

  return (
    <div
      className={cn(
        "border-gray-200 bg-white text-gray-950 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50 flex justify-center items-center min-h-screen mt-5 mb-5"
      )}
    >
      {/* <NavBar /> */}
      <Card className="p-8 w-full max-w-7xl mx-auto mt-3">
        <CardHeader>
          <CardTitle>Configuração do Relatório</CardTitle>
          <CardDescription>
            Escolha o template que será usado para baixar ou pré-visualizar o relatório.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1fr_auto]">
          <div>
            <Label htmlFor="template">Template</Label>
            <Select
              value={selectedTemplateId}
              onValueChange={(value) =>
                setSelectedTemplateId(value as ReportTemplateId)
              }
            >
              <SelectTrigger id="template" className="mt-2">
                <SelectValue placeholder="Selecione um template" />
              </SelectTrigger>
              <SelectContent>
                {reportTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-2 text-sm text-muted-foreground">
              {getReportTemplate(selectedTemplateId).description}
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <Button
              variant="outline"
              onClick={handleGeneratePreview}
              disabled={isGeneratingTemplate}
            >
              Pré-visualizar
            </Button>
            <Button
              variant="secondary"
              onClick={handleDownloadHtml}
              disabled={isGeneratingTemplate}
            >
              Baixar HTML
            </Button>
            <Button onClick={handleDownloadPdf} disabled={isGeneratingTemplate}>
              Baixar PDF
            </Button>
          </div>
        </CardContent>

        {templateError && (
          <div className="mx-6 mb-4 rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {templateError}
          </div>
        )}

        <Scope alvos={alvos} setAlvos={setAlvos} />
        <Vuln
          onAddOrUpdateVulnerability={handleAddOrUpdateVulnerability}
          vulns={vulns}
          setVulns={setVulns}
        />

        {generatedHtml && (
          <div className="mt-6">
            <h2 className="mb-3 text-lg font-semibold">Prévia do Relatório</h2>
            <div className="h-[720px] overflow-hidden rounded border border-gray-800 bg-white">
              <iframe
                srcDoc={generatedHtml}
                className="h-full w-full border-0 bg-white"
                title="Prévia do relatório"
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
